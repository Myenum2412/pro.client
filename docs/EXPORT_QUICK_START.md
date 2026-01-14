# 📥 Export Feature - Quick Start

## What's New?

Every table on the Projects page can now export data in **3 formats**: CSV, Excel, and PDF!

## 🚀 Quick Setup

### Step 1: Install Required Packages

```bash
npm install jspdf jspdf-autotable xlsx
```

### Step 2: Restart Dev Server

```bash
npm run dev
```

### Step 3: You're Ready!

Navigate to any table and click the "Export" button!

## 📊 How to Use

### Export All Data

```
1. Go to any table (e.g., Drawing Log)
2. Click "Export" dropdown
3. Select format:
   - Export All as CSV
   - Export All as Excel
   - Export All as PDF
4. File downloads automatically!
```

### Export Selected Rows

```
1. Check boxes for rows you want
2. Click "Export" dropdown
3. Select format:
   - Export Selected as CSV
   - Export Selected as Excel
   - Export Selected as PDF
4. File downloads with only selected rows!
```

## 📋 Export Formats

### CSV
- ✅ Lightweight
- ✅ Opens in Excel/Sheets
- ✅ Universal format
- 📄 Example: `drawing-log_all_2024-12-26.csv`

### Excel
- ✅ Formatted spreadsheet
- ✅ Styled headers
- ✅ Auto-sized columns
- ✅ Includes metadata
- 📊 Example: `drawing-log_all_2024-12-26.xlsx`

### PDF
- ✅ Professional document
- ✅ Print-ready
- ✅ Page numbers
- ✅ Branded colors
- 📄 Example: `drawing-log_all_2024-12-26.pdf`

## 💡 Tips & Tricks

### Tip 1: Export Filtered Data
```
1. Search or filter table
2. Click "Export All"
3. Only filtered data exports!
```

### Tip 2: Export Sorted Data
```
1. Click column header to sort
2. Click "Export All"
3. Sorted order is preserved!
```

### Tip 3: Quick CSV for Analysis
```
For quick data analysis:
- Use CSV format
- Fastest export
- Opens in any tool
```

### Tip 4: Excel for Reports
```
For professional reports:
- Use Excel format
- Formatted and styled
- Includes metadata
```

### Tip 5: PDF for Sharing
```
For sharing/archiving:
- Use PDF format
- Professional look
- Print-ready
```

## 🎯 Common Use Cases

### Use Case 1: Monthly Report
```
Goal: Create Excel report of all drawings
Steps:
1. Go to Drawing Log
2. Export All as Excel
3. Share with stakeholders
Result: Professional Excel report ✅
```

### Use Case 2: Selected Invoices
```
Goal: PDF of specific invoices
Steps:
1. Go to Invoice History
2. Check desired invoices
3. Export Selected as PDF
4. Email to client
Result: Clean PDF with only selected invoices ✅
```

### Use Case 3: Data Analysis
```
Goal: Analyze pending submissions
Steps:
1. Go to Upcoming Submissions
2. Search "pending"
3. Export All as CSV
4. Import into analysis tool
Result: CSV with only pending items ✅
```

## 📁 File Names

Exported files are automatically named:

```
Format: TableName_Type_Date_Time.extension

Examples:
- drawing-log_all_2024-12-26_14-30-45.xlsx
- invoice-history_selected_2024-12-26_15-20-30.pdf
- change-orders_all_2024-12-26_16-45-00.csv
```

## ❓ FAQ

### Q: Where do files download?
**A:** Your browser's default download folder

### Q: Can I export without selecting rows?
**A:** Yes! Use "Export All" options

### Q: Do exports include hidden columns?
**A:** No, only visible columns are exported

### Q: Can I export from mobile?
**A:** Yes! Works on all devices

### Q: Is there a row limit?
**A:** No hard limit, but large exports (1000+) may take a few seconds

### Q: Do I need internet?
**A:** No! Export works offline (client-side processing)

## 🔧 Troubleshooting

### Problem: Export button doesn't work
**Solution:** 
1. Install packages: `npm install jspdf jspdf-autotable xlsx`
2. Restart server: `npm run dev`

### Problem: Can't see "Export Selected" options
**Solution:** Select at least one row using checkboxes

### Problem: Export is empty
**Solution:** Check if table has data or filters are too restrictive

### Problem: Excel file won't open
**Solution:** 
1. Update packages: `npm update xlsx`
2. Try CSV format instead

## 🎉 Summary

Export feature gives you:

- ✅ **3 formats** - CSV, Excel, PDF
- ✅ **2 options** - All or Selected
- ✅ **Smart naming** - Auto-generated filenames
- ✅ **Fast** - Client-side processing
- ✅ **Easy** - Just click and download!

**Start exporting now!** 📥

---

**Need more details?** See `docs/ADVANCED_EXPORT_FEATURE.md`

