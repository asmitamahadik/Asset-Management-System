# React Asset Management System

A professional, login-protected admin panel for managing IT assets with a distinction between immutable and mutable fields. Built with React, Tailwind CSS, and mock database integration.

## 🎯 Features

- **Authentication**: Simple login system with demo credentials
- **Asset Dashboard**: Table view of all assets with search and filter capabilities
- **Asset Editor**: Modal-based editor with smart field handling
- **Immutable Fields**: Grey, read-only fields (Sr. No., Asset Tag, Asset Type, Maker, Model Number, Serial Number, Purchase Date, AMC)
- **Mutable Fields**: Fully editable fields (Configuration, Operating System, Host Name, Internal IP Address, Asset Custodian, Asset Current Location, Asset Transfer Date, Asset Previous Location, Asset Previous Custodian)
- **Mock Database**: Console logging for data persistence tracking
- **Professional UI**: Tailwind CSS styling with responsive design
- **Session Persistence**: User session saved in localStorage

## 📁 Project Structure

```
litmus/
├── src/
│   ├── components/
│   │   ├── Login.jsx           # Login authentication page
│   │   ├── Dashboard.jsx       # Main dashboard with asset management
│   │   ├── AssetTable.jsx      # Table component for displaying assets
│   │   └── AssetEditor.jsx     # Modal editor for creating/editing assets
│   ├── services/
│   │   └── databaseService.js  # Mock database operations
│   ├── data/
│   │   ├── fieldSchema.js      # Field definitions (immutable/mutable)
│   │   └── mockAssets.js       # Sample asset data
│   ├── App.jsx                 # Main app component
│   ├── App.css                 # Global styles
│   └── index.jsx               # React entry point
├── public/
│   └── index.html              # HTML template
├── package.json                # Project dependencies
├── tailwind.config.js          # Tailwind CSS configuration
└── README.md                   # This file
```

## 🔐 Authentication

### Demo Credentials
- **Email**: `admin@example.com`
- **Password**: `admin123`

Or click "Try Demo Login" for quick access.

## 📊 Schema Definition

### Immutable Fields (Grey - Read-only after creation)
- Sr. No.
- Asset Tag
- Asset Type
- Maker
- Model Number
- Serial Number
- Purchase Date
- AMC

### Mutable Fields (Red - Always editable)
- Configuration
- Operating System
- Host Name
- Internal IP Address
- Asset Custodian
- Asset Current Location
- Asset Transfer Date
- Asset Previous Location
- Asset Previous Custodian

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

## 📝 Component Documentation

### AssetEditor.jsx

The main component handling asset creation and editing with smart field handling:

```jsx
<AssetEditor
  asset={assetObject}
  isNewAsset={true}
  onSave={handleSaveCallback}
  onCancel={handleCancelCallback}
/>
```

**Features**:
- Automatically disables immutable fields when editing existing assets
- Shows "Immutable" badge on read-only fields
- Real-time form validation
- Loading states during save operation
- Success/error messaging
- Separated visual sections for immutable vs mutable fields

### Dashboard.jsx

Main admin dashboard managing the asset list:

```jsx
<Dashboard
  userName="John Doe"
  onLogout={handleLogoutCallback}
/>
```

**Features**:
- Displays asset table
- Create new asset functionality
- Edit existing assets
- Delete assets with confirmation
- Logout functionality

### AssetTable.jsx

Responsive table component for displaying assets:

```jsx
<AssetTable
  assets={assetsArray}
  onEdit={editCallback}
  onDelete={deleteCallback}
  onCreateNew={createCallback}
/>
```

## 💾 Database Integration

### Mock Database Service

The `databaseService.js` provides a `handleSaveToDatabase` function:

```javascript
const response = await handleSaveToDatabase(assetData, isNewAsset);
// Returns: { success: boolean, message: string, assetId: number, timestamp: string }
```

**Console Output**:
```
[DATABASE] Updating Asset:
{
  id: 1,
  assetTag: "AST-001",
  ...
}
```

### Future Excel Integration

To integrate with an actual Excel file, you'll need to:

1. **Backend Setup** (Node.js + Express):
```javascript
const ExcelJS = require('exceljs');

app.post('/api/assets/:id', async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('./Asset_Inventory.xlsx');
  const worksheet = workbook.getWorksheet(1);
  
  // Update row data
  const row = worksheet.getRow(req.params.id + 1);
  Object.entries(req.body).forEach(([key, value]) => {
    const columnIndex = fieldToColumnMap[key];
    row.getCell(columnIndex).value = value;
  });
  
  await workbook.xlsx.writeFile('./Asset_Inventory.xlsx');
  res.json({ success: true });
});
```

2. **Frontend Update**:
```javascript
// Replace handleSaveToDatabase with API call
const response = await fetch(`/api/assets/${assetData.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(assetData)
});
```

## 🎨 Styling

The application uses **Tailwind CSS** via CDN. Key color scheme:
- **Blue (#0284c7)**: Primary actions and navigation
- **Red (#dc2626)**: Mutable field indicators and destructive actions
- **Grey (#6b7280)**: Immutable field indicators and disabled states
- **Green (#16a34a)**: Success messages

## 🔄 User Flow

1. **Login Page** → Enter credentials or use demo login
2. **Dashboard** → View all assets in table
3. **Edit Asset** → Click edit button to open modal
4. **Asset Editor**:
   - Immutable fields are greyed out and disabled
   - Mutable fields are highlighted and editable
   - Validate and save
5. **Success** → Asset updated and modal closes
6. **Logout** → Return to login page

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px and above)
- Tablet (768px - 1919px)
- Mobile (below 768px)

## 🔒 Security Notes

- Current implementation uses mock authentication
- For production, implement proper JWT/OAuth
- Never store passwords in frontend code
- Use HTTPS for all communication
- Validate all inputs on both frontend and backend

## 🐛 Debugging

Enable console logging to see all database operations:
```javascript
// Open browser DevTools (F12)
// Check Console tab for [DATABASE] logs
```

## 📦 Dependencies

- **react**: ^18.2.0 - UI framework
- **react-dom**: ^18.2.0 - React DOM rendering
- **react-icons**: ^4.12.0 - Icon library (FiEdit2, FiTrash2, etc.)
- **tailwindcss**: ^3.3.0 - Utility-first CSS framework

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deployment Platforms
- **Vercel**: `vercel deploy`
- **Netlify**: Connect GitHub repo
- **AWS S3 + CloudFront**: Upload build folder
- **Docker**: Create Dockerfile for containerization

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues or questions, please open a GitHub issue or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: May 2024  
**Built with ❤️ using React and Tailwind CSS**
