/**
 * Asset persistence service.
 * - Dev: API_BASE points to localhost:4000 (the Express dev server).
 * - Prod: API_BASE is empty so requests go to the same origin (Express serves both).
 */

const API_BASE =
  process.env.REACT_APP_API_BASE ??
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4000');

async function callApi(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `API ${res.status}`);
  return body;
}

function mockResolve(action, assetData) {
  console.warn(`[DB-MOCK] Backend unreachable, mocking ${action}:`, assetData);
  return {
    success: true,
    message: `Asset ${assetData.assetTag} ${action} (mock — backend offline)`,
    assetId: assetData.id,
    timestamp: new Date().toISOString(),
    mocked: true,
  };
}

export const handleSaveToDatabase = async (assetData, isNewAsset = false) => {
  try {
    const body = await (isNewAsset
      ? callApi('/api/assets', { method: 'POST', body: JSON.stringify(assetData) })
      : callApi(`/api/assets/${encodeURIComponent(assetData.assetTag)}`, {
          method: 'PUT',
          body: JSON.stringify(assetData),
        }));

    return {
      success: true,
      message: `Asset ${assetData.assetTag} ${isNewAsset ? 'created' : 'updated'} successfully`,
      asset: body.asset,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    if (err.name === 'TypeError') {
      // Network failure (server down / CORS blocked) — degrade to mock
      return mockResolve(isNewAsset ? 'created' : 'updated', assetData);
    }
    return { success: false, message: err.message };
  }
};

export const handleDeleteAsset = async (assetTag) => {
  try {
    await callApi(`/api/assets/${encodeURIComponent(assetTag)}`, { method: 'DELETE' });
    return { success: true, message: `Asset ${assetTag} deleted`, timestamp: new Date().toISOString() };
  } catch (err) {
    if (err.name === 'TypeError') return mockResolve('deleted', { assetTag });
    return { success: false, message: err.message };
  }
};

async function downloadFromEndpoint(path, fallbackExt) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Download failed (${res.status})`);
    }
    const blob = await res.blob();

    const disposition = res.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="?([^"]+)"?/i);
    const filename = match?.[1] || `Asset_Inventory_${new Date().toISOString().slice(0, 10)}.${fallbackExt}`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    return { success: true, filename };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export const handleDownloadExcel = () => downloadFromEndpoint('/api/assets/export', 'xlsx');
export const handleDownloadPdf   = () => downloadFromEndpoint('/api/assets/export-pdf', 'pdf');

export const handleImportAssets = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/api/assets/import`, {
      method: 'POST',
      body: formData,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || `Import failed (${res.status})`);
    return {
      success: true,
      created: body.created,
      updated: body.updated,
      errors: body.errors || [],
      assets: body.assets || [],
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const handleFetchAssets = async () => {
  try {
    const { assets } = await callApi('/api/assets', { method: 'GET' });
    return { success: true, assets };
  } catch (err) {
    if (err.name === 'TypeError') {
      console.warn('[DB-MOCK] Backend unreachable, returning empty list');
      return { success: true, assets: [], mocked: true };
    }
    return { success: false, message: err.message, assets: [] };
  }
};
