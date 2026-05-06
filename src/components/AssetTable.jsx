import React, { useRef } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiUpload, FiDownload, FiFileText } from 'react-icons/fi';

/**
 * AssetTable Component
 * 
 * Displays a table of assets with edit and delete actions
 * 
 * @param {object} props - Component props
 * @param {array} props.assets - Array of asset objects
 * @param {function} props.onEdit - Callback when edit button is clicked
 * @param {function} props.onDelete - Callback when delete button is clicked
 * @param {function} props.onCreateNew - Callback when create new button is clicked
 * @returns {JSX.Element} - Asset table
 */
const AssetTable = ({ assets, onEdit, onDelete, onCreateNew, onUpload, isUploading, onDownload, isDownloading, onDownloadPdf, isDownloadingPdf }) => {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUpload) onUpload(file);
    // Reset so re-uploading the same file fires onChange again
    e.target.value = '';
  };

  if (!assets || assets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 mb-4">
          <FiPlus className="text-blue-600 dark:text-blue-400" size={28} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No assets yet</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Create one manually or import from an Excel file.</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md shadow-blue-500/30 hover:shadow-lg active:scale-[0.97] font-semibold text-sm transition-all"
          >
            <FiPlus size={18} />
            Create First Asset
          </button>
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 ring-1 ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg active:scale-[0.97] font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiUpload size={18} />
            {isUploading ? 'Uploading…' : 'Upload Excel'}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
      {/* Table Header with Create Button */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Asset Inventory</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage and track all organisational assets.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 ring-1 ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg active:scale-[0.97] font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiDownload size={18} />
            {isDownloading ? 'Downloading…' : 'Excel'}
          </button>
          <button
            onClick={onDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 ring-1 ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg active:scale-[0.97] font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiFileText size={18} />
            {isDownloadingPdf ? 'Generating…' : 'PDF'}
          </button>
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 ring-1 ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg active:scale-[0.97] font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiUpload size={18} />
            {isUploading ? 'Uploading…' : 'Upload Excel'}
          </button>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md shadow-blue-500/30 hover:shadow-lg active:scale-[0.97] font-semibold text-sm transition-all"
          >
            <FiPlus size={18} />
            New Asset
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 backdrop-blur">
              <th className="px-6 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Sr. No.
              </th>
              <th className="px-6 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Asset Tag
              </th>
              <th className="px-6 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Asset Type
              </th>
              <th className="px-6 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Maker
              </th>
              <th className="px-6 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Serial Number
              </th>
              <th className="px-6 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Custodian
              </th>
              <th className="px-6 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Location
              </th>
              <th className="px-6 py-3.5 text-center font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr
                key={asset.id}
                className="border-b border-gray-100 dark:border-gray-700/60 last:border-b-0 bg-white dark:bg-gray-800 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                  {asset.srNo}
                </td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                  <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-200 dark:ring-blue-800 rounded-full text-xs font-semibold tracking-wide">
                    {asset.assetTag}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{asset.assetType}</td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{asset.maker}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs font-mono">
                  {asset.serialNumber}
                </td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                  {asset.assetCustodian || '-'}
                </td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                  {asset.currentLocation || '-'}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-1">
                    <button
                      onClick={() => onEdit(asset)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Edit asset"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(asset.id)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete asset"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Total Assets: <span className="font-semibold">{assets.length}</span>
        </p>
      </div>
    </div>
  );
};

export default AssetTable;
