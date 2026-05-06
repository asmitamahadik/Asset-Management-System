const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const { COLUMN_MAP } = require('./columnMap');

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'inventory.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL'); // better concurrent read/write behaviour
db.exec('PRAGMA foreign_keys = ON');

// Schema — assetTag is the natural primary key. Storing all columns as TEXT
// keeps things simple; SQLite is dynamically typed and our only numeric
// field (srNo) gets coerced fine on read.
db.exec(`
  CREATE TABLE IF NOT EXISTS assets (
    assetTag           TEXT PRIMARY KEY,
    srNo               INTEGER,
    assetType          TEXT,
    maker              TEXT,
    modelNumber        TEXT,
    serialNumber       TEXT,
    purchaseDate       TEXT,
    amc                TEXT,
    configuration      TEXT,
    operatingSystem    TEXT,
    hostName           TEXT,
    internalIP         TEXT,
    assetCustodian     TEXT,
    currentLocation    TEXT,
    transferDate       TEXT,
    previousLocation   TEXT,
    previousCustodian  TEXT,
    createdAt          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const FIELD_IDS = COLUMN_MAP.map((c) => c.id);

const placeholders = (n) => Array(n).fill('?').join(', ');
const setClause = (ids) => ids.map((id) => `${id} = ?`).join(', ');

// ---- Prepared statements ----
const stmtAll       = db.prepare('SELECT * FROM assets ORDER BY srNo, assetTag');
const stmtByTag     = db.prepare('SELECT * FROM assets WHERE assetTag = ?');
const stmtDelete    = db.prepare('DELETE FROM assets WHERE assetTag = ?');
const stmtInsert    = db.prepare(
  `INSERT INTO assets (${FIELD_IDS.join(', ')}) VALUES (${placeholders(FIELD_IDS.length)})`
);
const stmtNextSrNo  = db.prepare('SELECT COALESCE(MAX(srNo), 0) + 1 AS next FROM assets');

const buildValues = (asset, ids) =>
  ids.map((id) => {
    const v = asset[id];
    return v === undefined || v === '' ? null : v;
  });

function listAssets() {
  return stmtAll.all();
}

function getAsset(assetTag) {
  return stmtByTag.get(assetTag);
}

function createAsset(asset) {
  // Auto-fill srNo if missing
  if (asset.srNo === undefined || asset.srNo === '' || asset.srNo === null) {
    asset.srNo = stmtNextSrNo.get().next;
  }
  stmtInsert.run(...buildValues(asset, FIELD_IDS));
  return getAsset(asset.assetTag);
}

function updateAsset(assetTag, patch, { allowImmutable = false } = {}) {
  const existing = getAsset(assetTag);
  if (!existing) return null;

  // Mutable fields are always patchable; immutable only when explicitly allowed.
  const IMMUTABLE = new Set(['srNo','assetTag','assetType','maker','modelNumber','serialNumber','purchaseDate','amc']);
  const ids = FIELD_IDS.filter((id) => {
    if (id === 'assetTag') return false; // never overwrite the PK
    if (!allowImmutable && IMMUTABLE.has(id)) return false;
    return patch[id] !== undefined;
  });
  if (ids.length === 0) return existing;

  const sql = `UPDATE assets SET ${setClause(ids)}, updatedAt = CURRENT_TIMESTAMP WHERE assetTag = ?`;
  const stmt = db.prepare(sql);
  stmt.run(...buildValues(patch, ids), assetTag);
  return getAsset(assetTag);
}

function deleteAsset(assetTag) {
  const info = stmtDelete.run(assetTag);
  return info.changes > 0;
}

// Used by the import endpoint — bulk upsert in a transaction
function upsertMany(assets) {
  let created = 0, updated = 0;
  const errors = [];

  db.exec('BEGIN');
  try {
    for (const { rowNumber, asset } of assets) {
      if (!asset.assetTag) {
        errors.push(`Row ${rowNumber}: missing Asset Tag`);
        continue;
      }
      if (getAsset(asset.assetTag)) {
        updateAsset(asset.assetTag, asset, { allowImmutable: true });
        updated += 1;
      } else {
        createAsset(asset);
        created += 1;
      }
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  return { created, updated, errors };
}

module.exports = {
  listAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  upsertMany,
  DB_PATH,
};
