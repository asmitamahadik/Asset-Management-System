import React, { useState, useEffect, useCallback } from 'react';
import { FiLogOut, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import AssetTable from './AssetTable';
import AssetEditor from './AssetEditor';
import {
  handleImportAssets,
  handleDownloadExcel,
  handleDownloadPdf,
  handleFetchAssets,
  handleDeleteAsset as deleteAssetOnServer,
} from '../services/databaseService';

// Backend assets are keyed by assetTag. The UI also wants a numeric `id`
// for React keys and local lookups — so we synthesise one from the index.
const withIds = (assets) =>
  assets.map((a, idx) => ({ ...a, id: idx + 1, srNo: a.srNo || idx + 1 }));

/**
 * Dashboard Component
 * 
 * Main dashboard showing the asset inventory table and managing edit/delete operations
 * 
 * @param {object} props - Component props
 * @param {string} props.userName - Name of logged-in user
 * @param {function} props.onLogout - Callback for logout
 * @returns {JSX.Element} - Dashboard view
 */
const Dashboard = ({ userName, onLogout }) => {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAsset, setEditingAsset] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Fetch persisted assets from the backend on mount so refreshing doesn't lose data.
  const refreshAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await handleFetchAssets();
      if (result.success) {
        setAssets(withIds(result.assets || []));
      } else {
        showToast('error', result.message || 'Failed to load assets.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refreshAssets(); }, [refreshAssets]);

  const runDownload = async (downloader, setBusy) => {
    setBusy(true);
    try {
      const result = await downloader();
      if (result.success) showToast('success', `Downloaded ${result.filename}`);
      else showToast('error', result.message || 'Download failed.');
    } catch (err) {
      showToast('error', err.message || 'Download failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleDownload    = () => runDownload(handleDownloadExcel, setIsDownloading);
  const handleDownloadPdfClick = () => runDownload(handleDownloadPdf, setIsDownloadingPdf);

  const handleUploadExcel = async (file) => {
    setIsUploading(true);
    try {
      const result = await handleImportAssets(file);
      if (!result.success) {
        showToast('error', result.message || 'Upload failed.');
        return;
      }
      setAssets(withIds(result.assets));
      const errs = result.errors?.length ? ` ${result.errors.length} skipped.` : '';
      showToast(
        'success',
        `Imported successfully — ${result.created} created, ${result.updated} updated.${errs}`
      );
    } catch (err) {
      showToast('error', err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handle creating a new asset
   */
  const handleCreateNew = () => {
    const newAsset = {
      id: Math.max(...assets.map((a) => a.id), 0) + 1,
      srNo: Math.max(...assets.map((a) => a.srNo), 0) + 1,
      assetTag: '',
      assetType: '',
      maker: '',
      modelNumber: '',
      serialNumber: '',
      purchaseDate: '',
      amc: '',
      configuration: '',
      operatingSystem: '',
      hostName: '',
      internalIP: '',
      assetCustodian: '',
      currentLocation: '',
      transferDate: '',
      previousLocation: '',
      previousCustodian: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingAsset(newAsset);
    setIsCreatingNew(true);
  };

  /**
   * Handle editing an existing asset
   */
  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setIsCreatingNew(false);
  };

  /**
   * Handle saving an asset
   */
  const handleSaveAsset = (updatedAsset) => {
    if (isCreatingNew) {
      // Add new asset to list
      setAssets((prev) => [...prev, updatedAsset]);
    } else {
      // Update existing asset
      setAssets((prev) =>
        prev.map((asset) =>
          asset.id === updatedAsset.id ? updatedAsset : asset
        )
      );
    }

    // Close editor
    setEditingAsset(null);
    setIsCreatingNew(false);
  };

  /**
   * Handle deleting an asset — calls the backend so it persists.
   */
  const handleDeleteAsset = async (assetId) => {
    const assetToDelete = assets.find((a) => a.id === assetId);
    if (!assetToDelete) return;
    if (!window.confirm(`Are you sure you want to delete asset "${assetToDelete.assetTag}"?`)) return;

    const result = await deleteAssetOnServer(assetToDelete.assetTag);
    if (result.success) {
      setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
      showToast('success', `Deleted ${assetToDelete.assetTag}`);
    } else {
      showToast('error', result.message || 'Delete failed.');
    }
  };

  /**
   * Handle closing the editor
   */
  const handleCloseEditor = () => {
    setEditingAsset(null);
    setIsCreatingNew(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      {/* Navigation Header */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/70 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Asset Management
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Logged in as <span className="font-semibold text-gray-700 dark:text-gray-200">{userName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2 mr-14 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg shadow-md shadow-red-500/30 hover:shadow-lg active:scale-[0.97] transition-all font-semibold text-sm"
            >
              <FiLogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-12 text-center">
            <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">Loading assets…</p>
          </div>
        ) : (
        <AssetTable
          assets={assets}
          onEdit={handleEditAsset}
          onDelete={handleDeleteAsset}
          onCreateNew={handleCreateNew}
          onUpload={handleUploadExcel}
          isUploading={isUploading}
          onDownload={handleDownload}
          isDownloading={isDownloading}
          onDownloadPdf={handleDownloadPdfClick}
          isDownloadingPdf={isDownloadingPdf}
        />
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-slide-up max-w-sm">
          <div
            className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl ring-1 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-green-50/95 dark:bg-green-900/80 ring-green-200 dark:ring-green-800 text-green-800 dark:text-green-200'
                : 'bg-red-50/95 dark:bg-red-900/80 ring-red-200 dark:ring-red-800 text-red-800 dark:text-red-200'
            }`}
          >
            {toast.type === 'success' ? (
              <FiCheckCircle className="flex-shrink-0 mt-0.5" size={20} />
            ) : (
              <FiAlertCircle className="flex-shrink-0 mt-0.5" size={20} />
            )}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Asset Editor Modal */}
      {editingAsset && (
        <AssetEditor
          asset={editingAsset}
          isNewAsset={isCreatingNew}
          onSave={handleSaveAsset}
          onCancel={handleCloseEditor}
        />
      )}
    </div>
  );
};

export default Dashboard;
