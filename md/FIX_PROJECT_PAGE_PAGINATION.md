# Fix Project Page Pagination - Troubleshooting Guide

## 🔍 Issue

Pagination options not showing correctly on the Project page.

## ✅ Verification: Code is Correct

The code has been verified and is correctly configured:

### ✅ Page Size Options
```typescript
// components/projects/section-table-card.tsx (line 131)
pageSizes = [20, 40, 60, 80, 100, 200, 400, 500],
```

### ✅ Initial State
```typescript
// components/projects/section-table-card.tsx (lines 314-318)
initialState: {
  pagination: {
    pageSize: 20,
  },
},
```

### ✅ Dropdown Rendering
```typescript
// components/projects/section-table-card.tsx (lines 600-606)
<SelectContent>
  {pageSizes.map((s) => (
    <SelectItem key={s} value={String(s)}>
      {s}
    </SelectItem>
  ))}
</SelectContent>
```

## 🔧 Solution: Clear Cache

The issue is likely due to **browser and Next.js caching**. Follow these steps:

### Step 1: Stop Development Server
```bash
# Press Ctrl+C in the terminal running the dev server
```

### Step 2: Clear Next.js Cache
```powershell
# Windows PowerShell
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules\.cache
```

Or manually delete:
- `.next` folder
- `node_modules\.cache` folder

### Step 3: Restart Development Server
```bash
npm run dev
```

### Step 4: Hard Refresh Browser
**Chrome/Edge (Windows)**:
- Press `Ctrl + Shift + R`
- Or `Ctrl + F5`

**Or use DevTools**:
1. Press `F12` to open DevTools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Step 5: Verify on Project Page
1. Navigate to any Project page
2. Scroll to any table (e.g., "Drawings Yet to Return")
3. Look at the bottom of the table
4. Find "Rows per page" dropdown
5. Click the dropdown
6. **Expected**: Should show 8 options: 20, 40, 60, 80, 100, 200, 400, 500

## 🧪 Quick Test

### Test the Dropdown
1. Go to Project page
2. Find any table (Drawings, Change Orders, etc.)
3. At the bottom, click "Rows per page" dropdown
4. You should see:
```
┌─────────┐
│   20 ✓  │ ← Default selected
│   40    │
│   60    │
│   80    │
│  100    │
│  200    │
│  400    │
│  500    │
└─────────┘
```

### Test Functionality
1. Select "40" from dropdown
2. **Expected**: Table immediately shows 40 rows
3. **Expected**: Pagination info updates (e.g., "1-40 of 150 records")
4. **Expected**: Page count updates (e.g., "Page 1 of 4")

## 🔍 Debugging Steps

If clearing cache doesn't work, try these debugging steps:

### 1. Check Browser Console
```javascript
// Open DevTools (F12) and run in Console:
console.log('Checking pagination...');

// Should not show any errors related to pagination
```

### 2. Inspect Element
1. Right-click on "Rows per page" dropdown
2. Select "Inspect"
3. Look for the `<select>` or `<button>` element
4. Check if `pageSizes` array is being rendered

### 3. Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for API calls to `/api/projects/[id]/sections`
5. Check if data is loading correctly

### 4. Verify Component Props
Add temporary console log to verify:
```typescript
// In section-table-card.tsx, add at the top of component:
console.log('pageSizes:', pageSizes);
console.log('pageSize:', pageSize);
```

## 📊 Expected Behavior

### On Page Load
- Default: 20 rows per page
- Dropdown shows: "20"
- Pagination: "1-20 of X records"

### When Changing Page Size
1. Click dropdown
2. Select "40"
3. Table updates immediately
4. Shows: "1-40 of X records"
5. Page count recalculates

### When Navigating Pages
1. Set page size to 60
2. Click "Next page"
3. Shows: "61-120 of X records"
4. Page size remains 60

## 🎯 Tables on Project Page

All these tables should have the new pagination:

1. ✅ Drawings Yet to Return (APP/R&R)
2. ✅ Drawings Yet to Release
3. ✅ Drawing Log
4. ✅ Invoice History
5. ✅ Upcoming Submissions
6. ✅ Change Orders

## 🔄 Alternative: Force Rebuild

If clearing cache doesn't work, try a complete rebuild:

```bash
# Stop server (Ctrl+C)

# Delete everything
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules\.cache
Remove-Item -Recurse -Force out

# Reinstall (optional, if needed)
# npm install

# Start fresh
npm run dev
```

## 📝 Verification Checklist

After clearing cache and restarting:

- [ ] Stopped development server
- [ ] Deleted `.next` folder
- [ ] Deleted `node_modules\.cache` folder
- [ ] Restarted development server
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Navigated to Project page
- [ ] Opened "Rows per page" dropdown
- [ ] Verified 8 options visible (20, 40, 60, 80, 100, 200, 400, 500)
- [ ] Selected different page size
- [ ] Verified table updated immediately
- [ ] Verified page count recalculated
- [ ] Tested on multiple tables

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ Dropdown shows exactly 8 options
2. ✅ Default is 20 rows per page
3. ✅ Selecting different size updates table instantly
4. ✅ Pagination info updates correctly
5. ✅ Page count recalculates dynamically
6. ✅ Selection persists during page navigation

## 🆘 Still Not Working?

If pagination still doesn't work after clearing cache:

### Check File Integrity
```bash
# Verify the file was saved correctly
cat components/projects/section-table-card.tsx | grep "pageSizes = \[20"
```

Should output:
```
pageSizes = [20, 40, 60, 80, 100, 200, 400, 500],
```

### Check for Syntax Errors
```bash
# Run linter
npm run lint
```

Should show no errors in `section-table-card.tsx`.

### Verify Import
Check that `SectionTableCard` is being used:
```bash
grep -n "SectionTableCard" components/projects/project-sections.tsx
```

Should show the component is imported and used.

## 📞 Quick Fix Command

Run this single command to clear cache and restart:

```powershell
# Windows PowerShell (run from project root)
Remove-Item -Recurse -Force .next; Remove-Item -Recurse -Force node_modules\.cache; npm run dev
```

Then hard refresh browser: `Ctrl + Shift + R`

---

**Status**: Code is correct, likely a caching issue
**Solution**: Clear cache and hard refresh
**Expected Result**: 8 pagination options (20, 40, 60, 80, 100, 200, 400, 500)
**Default**: 20 rows per page

