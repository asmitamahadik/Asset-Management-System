/**
 * Asset Field Schema Configuration
 * Defines immutable and mutable fields for the Asset Management System
 */

export const IMMUTABLE_FIELDS = [
  { id: 'srNo', label: 'Sr. No.', type: 'number', required: true },
  { id: 'assetTag', label: 'Asset Tag', type: 'text', required: true },
  { id: 'assetType', label: 'Asset Type', type: 'text', required: true },
  { id: 'maker', label: 'Maker', type: 'text', required: true },
  { id: 'modelNumber', label: 'Model Number', type: 'text', required: true },
  { id: 'serialNumber', label: 'Serial Number', type: 'text', required: true },
  { id: 'purchaseDate', label: 'Purchase Date', type: 'date', required: true },
  { id: 'amc', label: 'AMC', type: 'text', required: true },
];

export const MUTABLE_FIELDS = [
  { id: 'configuration', label: 'Configuration', type: 'text', required: false },
  { id: 'operatingSystem', label: 'Operating System', type: 'text', required: false },
  { id: 'hostName', label: 'Host Name', type: 'text', required: false },
  { id: 'internalIP', label: 'Internal IP Address', type: 'text', required: false },
  { id: 'assetCustodian', label: 'Asset Custodian', type: 'text', required: false },
  { id: 'currentLocation', label: 'Asset Current Location', type: 'text', required: false },
  { id: 'transferDate', label: 'Asset Transfer Date', type: 'date', required: false },
  { id: 'previousLocation', label: 'Asset Previous Location', type: 'text', required: false },
  { id: 'previousCustodian', label: 'Asset Previous Custodian', type: 'text', required: false },
];

export const ALL_FIELDS = [...IMMUTABLE_FIELDS, ...MUTABLE_FIELDS];

/**
 * Check if a field is immutable
 * @param {string} fieldId - The field ID to check
 * @returns {boolean} - True if the field is immutable
 */
export const isFieldImmutable = (fieldId) => {
  return IMMUTABLE_FIELDS.some((field) => field.id === fieldId);
};

/**
 * Get field configuration by ID
 * @param {string} fieldId - The field ID
 * @returns {object} - Field configuration object
 */
export const getFieldConfig = (fieldId) => {
  return ALL_FIELDS.find((field) => field.id === fieldId);
};
