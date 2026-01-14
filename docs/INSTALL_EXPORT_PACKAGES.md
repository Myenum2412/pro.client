# 📦 Install Export Packages

To enable PDF and Excel export functionality, you need to install the following packages:

## Required Packages

```bash
npm install jspdf jspdf-autotable xlsx
```

Or with yarn:

```bash
yarn add jspdf jspdf-autotable xlsx
```

## Package Details

### 1. **jsPDF** (PDF Generation)
- **Purpose**: Create PDF documents
- **Version**: Latest
- **Documentation**: https://github.com/parallax/jsPDF

### 2. **jspdf-autotable** (PDF Tables)
- **Purpose**: Add tables to PDF documents
- **Version**: Latest
- **Documentation**: https://github.com/simonbengtsson/jsPDF-AutoTable

### 3. **xlsx** (Excel Generation)
- **Purpose**: Create Excel spreadsheets
- **Version**: Latest
- **Documentation**: https://github.com/SheetJS/sheetjs

## Installation Steps

1. **Stop the dev server** (Ctrl+C)

2. **Install packages**:
   ```bash
   npm install jspdf jspdf-autotable xlsx
   ```

3. **Install TypeScript types** (if needed):
   ```bash
   npm install --save-dev @types/jspdf @types/jspdf-autotable
   ```

4. **Restart the dev server**:
   ```bash
   npm run dev
   ```

## Verification

After installation, check that the packages are in your `package.json`:

```json
{
  "dependencies": {
    "jspdf": "^2.5.x",
    "jspdf-autotable": "^3.8.x",
    "xlsx": "^0.18.x"
  }
}
```

## Troubleshooting

### Issue: Module not found

**Error**: `Cannot find module 'jspdf'`

**Solution**: 
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install`
3. Restart dev server

### Issue: TypeScript errors

**Error**: `Could not find a declaration file for module 'jspdf'`

**Solution**:
```bash
npm install --save-dev @types/jspdf @types/jspdf-autotable
```

### Issue: Build errors

**Error**: Build fails with export-related errors

**Solution**:
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall packages: `npm install`
3. Rebuild: `npm run build`

## After Installation

Once packages are installed, the export functionality will work automatically:

- ✅ CSV export (built-in, no packages needed)
- ✅ Excel export (requires `xlsx`)
- ✅ PDF export (requires `jspdf` and `jspdf-autotable`)

Navigate to any table on the Projects page and click the "Export" dropdown to test!

