import React, { useState } from 'react';
import { FiSave, FiX, FiAlertCircle } from 'react-icons/fi';
import {
  IMMUTABLE_FIELDS,
  MUTABLE_FIELDS,
  isFieldImmutable,
} from '../data/fieldSchema';
import { handleSaveToDatabase } from '../services/databaseService';

/**
 * AssetEditor Component
 * 
 * Handles editing of assets with distinct behavior for immutable and mutable fields:
 * - Immutable fields are disabled (read-only) and styled in grey
 * - Mutable fields are fully editable and styled normally
 * 
 * @param {object} props - Component props
 * @param {object} props.asset - The asset object to edit
 * @param {boolean} props.isNewAsset - Whether this is a new asset creation
 * @param {function} props.onSave - Callback when asset is saved
 * @param {function} props.onCancel - Callback to close editor
 * @returns {JSX.Element} - Asset editor form
 */
const AssetEditor = ({ asset, isNewAsset = false, onSave, onCancel }) => {
  const [formData, setFormData] = useState(asset);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Handle input change for form fields
   * Only mutable fields can be changed; immutable fields are ignored
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Block changes to immutable fields ONLY when editing an existing asset.
    // On creation, immutable fields must be writable (you set them once).
    if (isFieldImmutable(name) && !isNewAsset) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts editing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  /**
   * Validate form data
   * Checks required fields
   */
  const validateForm = () => {
    const newErrors = {};

    // Validate immutable fields
    IMMUTABLE_FIELDS.forEach((field) => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });

    // Validate mutable fields
    MUTABLE_FIELDS.forEach((field) => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   * Saves the asset to the database
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setSuccessMessage('');

    try {
      const response = await handleSaveToDatabase(formData, isNewAsset);

      if (response.success) {
        setSuccessMessage(response.message);
        setTimeout(() => {
          if (onSave) {
            onSave(formData);
          }
        }, 1500);
      } else {
        setErrors({
          submit: response.message || 'Failed to save asset',
        });
      }
    } catch (error) {
      setErrors({
        submit: 'An unexpected error occurred while saving',
      });
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Render a form field (input, textarea, etc.)
   */
  const renderField = (field, value, isImmutable) => {
    const isReadOnly = isImmutable && !isNewAsset;
    const fieldError = errors[field.id];

    const commonProps = {
      id: field.id,
      name: field.id,
      type: field.type,
      value: value || '',
      onChange: handleInputChange,
      disabled: isReadOnly,
      className: `
        w-full px-4 py-2.5 border rounded-lg transition-all
        ${
          isReadOnly
            ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        }
        ${fieldError ? 'border-red-500 dark:border-red-400' : ''}
        font-mono text-sm
      `,
    };

    return (
      <div key={field.id} className="mb-4">
        <label
          htmlFor={field.id}
          className={`
            block text-sm font-medium mb-2
            ${isReadOnly ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}
          `}
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
          {isReadOnly && (
            <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
              Immutable
            </span>
          )}
        </label>

        {field.type === 'textarea' ? (
          <textarea {...commonProps} rows="3" />
        ) : (
          <input {...commonProps} />
        )}

        {fieldError && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
            <FiAlertCircle size={14} />
            {fieldError}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {isNewAsset ? 'Create New Asset' : `Edit Asset - ${formData.assetTag}`}
          </h2>
          <button
            onClick={onCancel}
            className="text-white/90 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            title="Close editor"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 mx-6 mt-4">
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6 flex gap-2">
              <FiAlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Immutable Fields Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-4 w-4 bg-gray-300 dark:bg-gray-500 rounded"></div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Immutable Fields (Read-only after creation)
              </h3>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {IMMUTABLE_FIELDS.map((field) =>
                  renderField(field, formData[field.id], true)
                )}
              </div>
            </div>
          </div>

          {/* Mutable Fields Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-4 w-4 bg-red-300 dark:bg-red-500 rounded"></div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Mutable Fields (Always editable)
              </h3>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MUTABLE_FIELDS.map((field) =>
                  renderField(field, formData[field.id], false)
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={isSaving}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200
                ${
                  isSaving
                    ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/30 hover:shadow-lg active:scale-[0.97]'
                }
              `}
            >
              <FiSave size={18} />
              {isSaving ? 'Saving...' : 'Save Asset'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                ${
                  isSaving
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }
              `}
            >
              <FiX size={18} />
              Cancel
            </button>
          </div>

          {/* Info Text */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
            Immutable fields are locked after initial creation to maintain data integrity.
            Only mutable fields can be modified.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AssetEditor;
