const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const ExcelJS = require('exceljs');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const { COLUMN_MAP } = require('./columnMap');
const db = require('./db');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB cap
});

const PORT = process.env.PORT || 4000;
const SHEET_NAME = 'Assets';

const app = express();
app.use(cors());
app.use(express.json());

// ---------- routes ----------

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, db: db.DB_PATH });
});

// Download — stream the current inventory as a PDF (landscape A4)
app.get('/api/assets/export-pdf', (_req, res, next) => {
  try {
    const assets = db.listAssets();

    const filename = `Asset_Inventory_${new Date().toISOString().slice(0, 10)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    doc.pipe(res);

    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(18)
      .text('Asset Inventory', { align: 'left' });
    doc.fillColor('#64748b').font('Helvetica').fontSize(9)
      .text(`Generated ${new Date().toLocaleString()}  ·  ${assets.length} asset${assets.length === 1 ? '' : 's'}`,
        { align: 'left' });
    doc.moveDown(0.8);

    const columns = [
      { id: 'srNo',            label: 'Sr.',        width: 30  },
      { id: 'assetTag',        label: 'Asset Tag',  width: 75  },
      { id: 'assetType',       label: 'Type',       width: 60  },
      { id: 'maker',           label: 'Maker',      width: 65  },
      { id: 'serialNumber',    label: 'Serial No.', width: 90  },
      { id: 'hostName',        label: 'Host Name',  width: 80  },
      { id: 'assetCustodian',  label: 'Custodian',  width: 90  },
      { id: 'currentLocation', label: 'Location',   width: 90  },
      { id: 'amc',             label: 'AMC',        width: 65  },
      { id: 'purchaseDate',    label: 'Purchased',  width: 65  },
    ];

    const startX = doc.page.margins.left;
    const tableWidth = columns.reduce((sum, c) => sum + c.width, 0);
    const headerHeight = 22;
    const rowHeight = 18;
    const cellPad = 4;

    const drawHeader = (y) => {
      doc.rect(startX, y, tableWidth, headerHeight).fill('#1e293b');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
      let x = startX;
      for (const col of columns) {
        doc.text(col.label, x + cellPad, y + 7, {
          width: col.width - cellPad * 2,
          ellipsis: true,
        });
        x += col.width;
      }
    };

    let y = doc.y;
    drawHeader(y);
    y += headerHeight;

    doc.font('Helvetica').fontSize(7.5);
    assets.forEach((asset, i) => {
      if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage({ margin: 30, size: 'A4', layout: 'landscape' });
        y = doc.page.margins.top;
        drawHeader(y);
        y += headerHeight;
        doc.font('Helvetica').fontSize(7.5);
      }

      if (i % 2 === 0) {
        doc.rect(startX, y, tableWidth, rowHeight).fill('#f8fafc');
      }
      doc.fillColor('#1f2937');

      let x = startX;
      for (const col of columns) {
        const v = asset[col.id];
        const text = v === null || v === undefined || v === '' ? '—' : String(v);
        doc.text(text, x + cellPad, y + 5, {
          width: col.width - cellPad * 2,
          ellipsis: true,
          lineBreak: false,
        });
        x += col.width;
      }

      doc.strokeColor('#e2e8f0').lineWidth(0.5)
        .moveTo(startX, y + rowHeight).lineTo(startX + tableWidth, y + rowHeight).stroke();

      y += rowHeight;
    });

    if (assets.length === 0) {
      doc.fillColor('#94a3b8').font('Helvetica-Oblique').fontSize(10)
        .text('No assets recorded.', startX, y + 20);
    }

    doc.end();
  } catch (err) { next(err); }
});

// Download — generate an .xlsx on-the-fly from the SQLite data and stream it
app.get('/api/assets/export', async (_req, res, next) => {
  try {
    const assets = db.listAssets();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(SHEET_NAME);
    sheet.columns = COLUMN_MAP.map(({ id, header }) => ({
      header,
      key: id,
      width: Math.max(header.length + 2, 16),
    }));
    sheet.getRow(1).font = { bold: true };
    assets.forEach((a) => sheet.addRow(a));

    const filename = `Asset_Inventory_${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { next(err); }
});

app.get('/api/assets', (_req, res, next) => {
  try {
    res.json({ assets: db.listAssets() });
  } catch (err) { next(err); }
});

// Import — bulk upsert from an uploaded .xlsx file
app.post('/api/assets/import', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded (field name: file)' });
    if (!req.file.size) return res.status(400).json({ error: 'Uploaded file is empty (0 bytes).' });

    const ext = path.extname(req.file.originalname || '').toLowerCase();
    if (ext === '.xls') {
      return res.status(400).json({
        error: 'Legacy .xls files are not supported. Open the file in Excel and use "Save As → Excel Workbook (.xlsx)" then upload again.',
      });
    }

    const incoming = new ExcelJS.Workbook();
    try {
      await incoming.xlsx.load(req.file.buffer);
    } catch (parseErr) {
      console.error('[server] xlsx parse failed:', parseErr.message);
      return res.status(400).json({
        error: `Could not read the file as .xlsx (${parseErr.message}). Make sure it is a valid Excel Workbook (.xlsx) and not a CSV or .xls renamed.`,
      });
    }

    const sourceSheet = incoming.worksheets[0];
    if (!sourceSheet) return res.status(400).json({ error: 'Uploaded workbook has no worksheets.' });

    // Build header → field id mapping
    const norm = (s) => String(s || '').trim().toLowerCase();
    const headerToFieldId = {};
    COLUMN_MAP.forEach(({ id, header }) => { headerToFieldId[norm(header)] = id; });

    const colIdxToFieldId = {};
    const headerRow = sourceSheet.getRow(1);
    headerRow.eachCell({ includeEmpty: false }, (cell, colIdx) => {
      const fieldId = headerToFieldId[norm(cell.value)];
      if (fieldId) colIdxToFieldId[colIdx] = fieldId;
    });

    if (Object.keys(colIdxToFieldId).length === 0) {
      return res.status(400).json({
        error: 'No recognised columns found. Header row must include at least one of the known column names (e.g. "Asset Tag").',
      });
    }

    // Parse rows into { rowNumber, asset } pairs
    const incomingAssets = [];
    sourceSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      const asset = {};
      Object.entries(colIdxToFieldId).forEach(([colIdx, fieldId]) => {
        const v = row.getCell(Number(colIdx)).value;
        asset[fieldId] = v instanceof Date ? v.toISOString().slice(0, 10) : (v ?? '');
      });
      incomingAssets.push({ rowNumber, asset });
    });

    const { created, updated, errors } = db.upsertMany(incomingAssets);
    res.json({ success: true, created, updated, errors, assets: db.listAssets() });
  } catch (err) { next(err); }
});

// Create — immutable fields are accepted on creation only
app.post('/api/assets', (req, res, next) => {
  try {
    const asset = req.body;
    if (!asset?.assetTag) return res.status(400).json({ error: 'assetTag is required' });
    if (db.getAsset(asset.assetTag)) {
      return res.status(409).json({ error: `assetTag "${asset.assetTag}" already exists` });
    }
    const created = db.createAsset(asset);
    res.status(201).json({ success: true, asset: created });
  } catch (err) { next(err); }
});

// Update — immutable fields silently ignored, mutable fields patched
app.put('/api/assets/:assetTag', (req, res, next) => {
  try {
    const { assetTag } = req.params;
    const updated = db.updateAsset(assetTag, req.body, { allowImmutable: false });
    if (!updated) return res.status(404).json({ error: `assetTag "${assetTag}" not found` });
    res.json({ success: true, asset: updated });
  } catch (err) { next(err); }
});

app.delete('/api/assets/:assetTag', (req, res, next) => {
  try {
    const { assetTag } = req.params;
    const ok = db.deleteAsset(assetTag);
    if (!ok) return res.status(404).json({ error: `assetTag "${assetTag}" not found` });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ---------- production: serve the React build ----------
// In production we ship the built React app from the same Express process,
// so the deployment is one URL with no CORS to worry about.

const BUILD_DIR = path.join(__dirname, '..', 'build');
if (fs.existsSync(BUILD_DIR)) {
  app.use(express.static(BUILD_DIR));
  // SPA fallback — anything that isn't /api/* serves index.html so client routing works
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(BUILD_DIR, 'index.html'));
  });
  console.log(`[server] Serving React build from ${BUILD_DIR}`);
}

// ---------- error handler ----------

app.use((err, _req, res, _next) => {
  console.error('[server] error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[server] Asset API listening on http://localhost:${PORT}`);
  console.log(`[server] Database: ${db.DB_PATH}`);
});
