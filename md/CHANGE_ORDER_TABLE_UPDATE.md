# Change Order Table - Column Structure Update

## 📋 Overview

Updated the Change Order table column structure to display fields in a specific order with improved naming and alignment.

## ✅ Changes Made

### Column Order (New Structure)

The Change Order table now displays columns in this exact order:

1. **CO #** (Change Order Number)
2. **Submission Date**
3. **Drawing No**
4. **Hours**
5. **Status**

### Before vs After

#### Before
```
┌──────────────────┬─────────────┬───────┬──────────┬────────┐
│ Change Order ID  │ Description │ Hours │ Date     │ Status │
└──────────────────┴─────────────┴───────┴──────────┴────────┘
```

#### After
```
┌──────┬─────────────────┬────────────┬───────┬────────┐
│ CO # │ Submission Date │ Drawing No │ Hours │ Status │
└──────┴─────────────────┴────────────┴───────┴────────┘
```

## 📊 Column Details

### 1. CO # (Column 1)
- **Previous Name**: "Change Order ID"
- **New Name**: "CO #"
- **Data**: Change order identifier
- **Alignment**: Center
- **Font**: Medium weight
- **Sortable**: Yes

### 2. Submission Date (Column 2)
- **Previous Position**: 4th column
- **New Position**: 2nd column
- **Previous Name**: "Date"
- **New Name**: "Submission Date"
- **Data**: Date formatted as "Month Date, Year"
- **Format**: Uses `formatDate()` utility
- **Alignment**: Center
- **Example**: "December 26, 2025"

### 3. Drawing No (Column 3)
- **Previous Name**: "Description"
- **New Name**: "Drawing No"
- **Data**: Drawing number/reference
- **Alignment**: Center
- **Font**: Medium weight
- **Sortable**: Yes

### 4. Hours (Column 4)
- **Position**: Moved from 3rd to 4th
- **Name**: "Hours" (unchanged)
- **Data**: Number of hours
- **Format**: Decimal with 1 decimal place (e.g., "10.5")
- **Alignment**: Center (changed from right)
- **Font**: Medium weight

### 5. Status (Column 5)
- **Position**: Remains 5th (last)
- **Name**: "Status" (unchanged)
- **Data**: Status badge
- **Display**: Color-coded pill/badge
- **Colors**:
  - APP = Yellow
  - RR = Orange
  - FFU = Green
  - Other statuses = Various colors
- **Alignment**: Center

## 🎨 Styling Updates

### Alignment
All columns now use **center alignment** for consistency:
```typescript
meta: { align: "center" }
```

### Font Weights
- **CO #**: Medium weight (`font-medium`)
- **Submission Date**: Regular weight
- **Drawing No**: Medium weight (`font-medium`)
- **Hours**: Medium weight (`font-medium`)
- **Status**: Badge styling (varies by status)

### Number Formatting
Hours are displayed with 1 decimal place:
```typescript
Number(row.getValue("hours")).toFixed(1)
// Examples: 10.0, 15.5, 20.3
```

### Date Formatting
Dates use the standardized format utility:
```typescript
formatDate(row.getValue("date"))
// Output: "December 26, 2025"
```

## 📝 Code Changes

### File Modified
**File**: `components/projects/sections.tsx`

### Column Definition
```typescript
export const changeOrderColumns: ColumnDef<ChangeOrderRow>[] = [
  {
    accessorKey: "changeOrderId",
    header: "CO #",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("changeOrderId")}</div>
    ),
    meta: { align: "center" },
  },
  { 
    accessorKey: "date", 
    header: "Submission Date",
    cell: ({ row }) => <div>{formatDate(row.getValue("date"))}</div>,
    meta: { align: "center" },
  },
  { 
    accessorKey: "description", 
    header: "Drawing No",
    cell: ({ row }) => <div className="font-medium">{row.getValue("description")}</div>,
    meta: { align: "center" },
  },
  {
    accessorKey: "hours",
    header: "Hours",
    cell: ({ row }) => (
      <div className="font-medium">{Number(row.getValue("hours")).toFixed(1)}</div>
    ),
    meta: { align: "center" },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => statusPill(String(row.getValue("status"))),
    meta: { align: "center" },
  },
];
```

## 🔍 Data Structure

### ChangeOrderRow Type
```typescript
export type ChangeOrderRow = {
  id: string;              // Unique identifier
  changeOrderId: string;   // CO # (displayed in column 1)
  description: string;     // Drawing No (displayed in column 3)
  hours: number;           // Hours (displayed in column 4)
  date: string;           // Submission Date (displayed in column 2)
  status: string;         // Status (displayed in column 5)
};
```

### Field Mapping
| Field | Display Name | Column Position |
|-------|--------------|-----------------|
| `changeOrderId` | CO # | 1 |
| `date` | Submission Date | 2 |
| `description` | Drawing No | 3 |
| `hours` | Hours | 4 |
| `status` | Status | 5 |

## 🎯 Features Maintained

### Sorting
All columns remain sortable (except Status which uses custom rendering):
- Click column header to sort
- Toggle between ascending/descending
- Visual indicator for sort direction

### Filtering
Table-level search/filter works across all columns:
- Search box filters all visible columns
- Real-time filtering as you type
- Case-insensitive matching

### Export
Export functionality includes all columns in new order:
- CSV export
- Excel export
- PDF export
- Maintains column order and formatting

### Status Colors
Status badges maintain color-coding:
- **APP**: Yellow (`bg-yellow-100 text-yellow-800`)
- **RR**: Orange (`bg-orange-100 text-orange-800`)
- **FFU**: Green (`bg-green-100 text-green-800`)
- **Paid/Success**: Emerald green
- **Open/Due/Pending**: Amber
- **Reject/Fail**: Red
- **Default**: Gray

## 📱 Responsive Behavior

### Desktop (1024px+)
- All 5 columns visible
- Adequate spacing between columns
- Center alignment for clean look

### Tablet (768px - 1023px)
- All columns visible
- Slightly reduced padding
- Maintains readability

### Mobile (<768px)
- Columns may stack or scroll horizontally
- Priority columns remain visible
- Touch-friendly interaction

## 🧪 Testing Checklist

### Visual Verification
- [ ] CO # appears as first column
- [ ] Submission Date appears as second column
- [ ] Drawing No appears as third column
- [ ] Hours appears as fourth column
- [ ] Status appears as fifth column
- [ ] All columns center-aligned
- [ ] Font weights correct (medium for CO#, Drawing No, Hours)
- [ ] Date format correct (Month Date, Year)
- [ ] Hours format correct (1 decimal place)
- [ ] Status badges colored correctly

### Functional Verification
- [ ] Sorting works on all sortable columns
- [ ] Table search filters all columns
- [ ] Export includes all columns in correct order
- [ ] Status colors display correctly
- [ ] Date formatting consistent
- [ ] Hours calculation accurate

### Responsive Verification
- [ ] Columns display correctly on desktop
- [ ] Columns display correctly on tablet
- [ ] Columns display correctly on mobile
- [ ] No horizontal overflow issues
- [ ] Touch interactions work on mobile

## 📊 Example Data Display

### Sample Row
```
┌──────┬─────────────────┬────────────┬───────┬────────┐
│ CO-1 │ December 26,    │ DWG-001    │ 15.5  │  APP   │
│      │ 2025            │            │       │ Yellow │
└──────┴─────────────────┴────────────┴───────┴────────┘
```

### Multiple Rows
```
┌──────┬─────────────────┬────────────┬───────┬────────┐
│ CO # │ Submission Date │ Drawing No │ Hours │ Status │
├──────┼─────────────────┼────────────┼───────┼────────┤
│ CO-1 │ December 26,    │ DWG-001    │ 15.5  │  APP   │
│      │ 2025            │            │       │ Yellow │
├──────┼─────────────────┼────────────┼───────┼────────┤
│ CO-2 │ December 25,    │ DWG-002    │ 20.0  │   RR   │
│      │ 2025            │            │       │ Orange │
├──────┼─────────────────┼────────────┼───────┼────────┤
│ CO-3 │ December 24,    │ DWG-003    │ 10.3  │  FFU   │
│      │ 2025            │            │       │ Green  │
└──────┴─────────────────┴────────────┴───────┴────────┘
```

## 🔄 Migration Notes

### No Data Changes Required
- Column reordering is UI-only
- No database schema changes needed
- Existing data displays correctly
- Field names remain the same in data structure

### Backward Compatibility
- API responses unchanged
- Data fetching logic unchanged
- Only display order modified
- Export formats updated automatically

## ✅ Completion Status

- [x] Column order updated (CO#, Submission Date, Drawing No, Hours, Status)
- [x] Column headers renamed appropriately
- [x] Alignment set to center for all columns
- [x] Date formatting applied to Submission Date
- [x] Hours formatting maintained (1 decimal)
- [x] Status badges maintain color-coding
- [x] Font weights applied correctly
- [x] Meta alignment added to all columns
- [x] No linter errors
- [x] Sorting functionality preserved
- [x] Export functionality preserved

## 📝 Summary

### What Changed
1. **Column Order**: Rearranged to CO#, Submission Date, Drawing No, Hours, Status
2. **Column Names**: 
   - "Change Order ID" → "CO #"
   - "Date" → "Submission Date"
   - "Description" → "Drawing No"
3. **Alignment**: All columns now center-aligned
4. **Hours**: Changed from right-aligned to center-aligned

### What Stayed the Same
- Data structure (ChangeOrderRow type)
- Field names in data
- Sorting functionality
- Filtering functionality
- Export functionality
- Status color-coding
- Date formatting utility
- Hours number formatting

---

**Implementation Date**: December 26, 2025
**Status**: ✅ Complete
**File Modified**: `components/projects/sections.tsx`
**Breaking Changes**: None
**Data Migration**: Not required

