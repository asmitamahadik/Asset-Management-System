const COLUMN_MAP = [
  { id: 'srNo',              header: 'Sr. No.' },
  { id: 'assetTag',          header: 'Asset Tag' },
  { id: 'assetType',         header: 'Asset Type' },
  { id: 'maker',             header: 'Maker' },
  { id: 'modelNumber',       header: 'Model Number' },
  { id: 'serialNumber',      header: 'Serial Number' },
  { id: 'purchaseDate',      header: 'Purchase Date' },
  { id: 'amc',               header: 'AMC' },
  { id: 'configuration',     header: 'Configuration' },
  { id: 'operatingSystem',   header: 'Operating System' },
  { id: 'hostName',          header: 'Host Name' },
  { id: 'internalIP',        header: 'Internal IP Address' },
  { id: 'assetCustodian',    header: 'Asset Custodian' },
  { id: 'currentLocation',   header: 'Asset Current Location' },
  { id: 'transferDate',      header: 'Asset Transfer Date' },
  { id: 'previousLocation',  header: 'Asset Previous Location' },
  { id: 'previousCustodian', header: 'Asset Previous Custodian' },
];

const IMMUTABLE_IDS = new Set([
  'srNo', 'assetTag', 'assetType', 'maker',
  'modelNumber', 'serialNumber', 'purchaseDate', 'amc',
]);

module.exports = { COLUMN_MAP, IMMUTABLE_IDS };
