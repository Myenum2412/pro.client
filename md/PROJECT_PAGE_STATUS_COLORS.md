# Project Page - Status Color Coding System

## 🎨 Color Scheme

All status indicators on the Project page follow a consistent color-coding system:

| Status | Color | Visual | Usage |
|--------|-------|--------|-------|
| **APP** (Approval) | 🟡 **Yellow** | `bg-yellow-100 text-yellow-800` | Approval status/submissions |
| **RR** (Review & Return) | 🟠 **Orange** | `bg-orange-100 text-orange-800` | Review and return status |
| **FFU** (For Field Use) | 🟢 **Green** | `bg-green-100 text-green-800` | Field use status |

## 📍 Where Colors Are Applied

### 1. **Status Badges**
All status badges across the Project page use consistent colors:
- Drawings Yet to Return table
- Drawing Log table
- Change Orders table
- Upcoming Submissions table

### 2. **Table Indicators**
Status columns in all tables display colored badges:
- Status column in Drawings tables
- Submission Type column
- Any status-related field

### 3. **Labels and Text**
Status labels throughout the interface:
- Inline status text
- Status dropdowns
- Status filters

## 🛠️ Implementation

### Files Updated

#### 1. **Submission Colors Utility** (Enhanced)
**File**: `lib/utils/submission-colors.ts`

**Added Functions**:
```typescript
// Unified status color function
export function getStatusColor(status: string): string;

// Status color mapping
export const STATUS_COLORS = {
  APP: { badge: "bg-yellow-100 text-yellow-800...", ... },
  RR: { badge: "bg-orange-100 text-orange-800...", ... },
  FFU: { badge: "bg-green-100 text-green-800...", ... },
};
```

#### 2. **Status Badge Component** (New)
**File**: `components/ui/status-badge.tsx`

**Components Created**:
```typescript
// Main status badge
<StatusBadge status="APP" />

// Status indicator dot
<StatusDot status="APP" />

// Status label with dot
<StatusLabel status="APP" />
```

**Features**:
- Automatic color detection
- Consistent styling
- Dark mode support
- Reusable across app

#### 3. **Project Sections** (Updated)
**File**: `components/projects/sections.tsx`

**Updated `statusPill` Function**:
```typescript
function statusPill(label: string) {
  const normalized = label.toLowerCase();
  const upper = label.toUpperCase().trim();
  
  // APP status - Yellow
  if (upper === "APP" || normalized.includes("approval")) {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-transparent 
                       dark:bg-yellow-900 dark:text-yellow-200">
        {label}
      </Badge>
    );
  }
  
  // RR status - Orange
  if (upper === "RR" || upper.includes("R&R") || 
      normalized.includes("review") || normalized.includes("return")) {
    return (
      <Badge className="bg-orange-100 text-orange-800 border-transparent 
                       dark:bg-orange-900 dark:text-orange-200">
        {label}
      </Badge>
    );
  }
  
  // FFU status - Green
  if (upper === "FFU" || normalized.includes("field use") || 
      normalized.includes("for field")) {
    return (
      <Badge className="bg-green-100 text-green-800 border-transparent 
                       dark:bg-green-900 dark:text-green-200">
        {label}
      </Badge>
    );
  }
  
  // ... other statuses
}
```

## 📊 Status Detection Logic

### APP (Yellow) - Triggers
- Exact match: `"APP"`
- Contains: `"approval"`
- Case-insensitive matching

### RR (Orange) - Triggers
- Exact match: `"RR"`
- Contains: `"R&R"`, `"review"`, `"return"`
- Case-insensitive matching

### FFU (Green) - Triggers
- Exact match: `"FFU"`
- Contains: `"field use"`, `"for field"`
- Case-insensitive matching

## 🎨 Visual Examples

### Before Standardization
```
APP:  Blue badge
RR:   Gray/default badge
FFU:  Gray/default badge
```

### After Standardization
```
APP:  🟡 Yellow badge
RR:   🟠 Orange badge
FFU:  🟢 Green badge
```

## 📋 Tables Affected

### Project Page Tables

| Table | Status Column | Color Applied |
|-------|--------------|---------------|
| **Drawings Yet to Return** | Status | ✅ APP=Yellow, RR=Orange, FFU=Green |
| **Drawing Log** | Status | ✅ APP=Yellow, RR=Orange, FFU=Green |
| **Upcoming Submissions** | Submission Type | ✅ APP=Yellow, RR=Orange, FFU=Green |
| **Change Orders** | Status | ✅ APP=Yellow, RR=Orange, FFU=Green |

### Other Pages

| Page | Location | Color Applied |
|------|----------|---------------|
| **RFI Page** | Submission Type | ✅ APP=Yellow, RR=Orange, FFU=Green |
| **Drawings Table** | Status | ✅ APP=Yellow, RR=Orange, FFU=Green |
| **Dashboard** | Status Indicators | ✅ APP=Yellow, RR=Orange, FFU=Green |

## 🌓 Dark Mode Support

All status colors include dark mode variants:

### Light Mode
```css
APP:  bg-yellow-100 text-yellow-800
RR:   bg-orange-100 text-orange-800
FFU:  bg-green-100 text-green-800
```

### Dark Mode
```css
APP:  dark:bg-yellow-900 dark:text-yellow-200
RR:   dark:bg-orange-900 dark:text-orange-200
FFU:  dark:bg-green-900 dark:text-green-200
```

## 🎯 UI Elements Styled

### 1. **Status Badges**
```tsx
<Badge className="bg-yellow-100 text-yellow-800">APP</Badge>
<Badge className="bg-orange-100 text-orange-800">RR</Badge>
<Badge className="bg-green-100 text-green-800">FFU</Badge>
```

### 2. **Status Dots**
```tsx
<StatusDot status="APP" />  // Yellow dot
<StatusDot status="RR" />   // Orange dot
<StatusDot status="FFU" />  // Green dot
```

### 3. **Status Labels**
```tsx
<StatusLabel status="APP" />  // Dot + "APP" text
<StatusLabel status="RR" />   // Dot + "RR" text
<StatusLabel status="FFU" />  // Dot + "FFU" text
```

### 4. **Table Rows** (Future Enhancement)
```tsx
// Can be extended to highlight entire rows
<TableRow className={getStatusBgColor(status)}>
  ...
</TableRow>
```

## ✨ Benefits

### 1. **Visual Consistency**
- Same colors across all pages
- Same colors in all tables
- Same colors in all UI elements
- Professional appearance

### 2. **Quick Recognition**
- 🟡 Yellow = Approval needed
- 🟠 Orange = Review required
- 🟢 Green = Ready for field use
- Instant visual scanning

### 3. **Reduced Cognitive Load**
- No need to read text
- Color provides instant context
- Faster decision making
- Better user experience

### 4. **Accessibility**
- High contrast ratios
- Color + text labels
- Dark mode support
- Screen reader friendly

## 🧪 Testing Checklist

### Visual Testing
- [ ] APP status displays in yellow
- [ ] RR status displays in orange
- [ ] FFU status displays in green
- [ ] Colors consistent across all tables
- [ ] Colors work in light mode
- [ ] Colors work in dark mode
- [ ] Badges have proper spacing
- [ ] Text is readable on all backgrounds

### Functional Testing
- [ ] Status badges display correctly
- [ ] Status colors update when data changes
- [ ] Filters work with colored statuses
- [ ] Sorting works with colored statuses
- [ ] Exports maintain status information
- [ ] No console errors
- [ ] Performance is not affected

### Edge Cases
- [ ] Mixed case statuses (e.g., "App", "app", "APP")
- [ ] Status with extra spaces
- [ ] Null/undefined statuses
- [ ] Unknown statuses (fallback to gray)
- [ ] Long status text

## 📚 Related Files

### Core Files
- `lib/utils/submission-colors.ts` - Color utility functions
- `components/ui/status-badge.tsx` - Status badge components
- `components/projects/sections.tsx` - Project sections with statusPill
- `components/data-table/drawings-columns.tsx` - Drawings table columns

### Supporting Files
- `app/projects/page.tsx` - Project page
- `components/projects/project-sections.tsx` - Section container
- `components/rfi/rfi-columns.tsx` - RFI table columns

## 🔄 Usage Examples

### In Components
```typescript
import { StatusBadge } from "@/components/ui/status-badge";

// Simple usage
<StatusBadge status="APP" />
<StatusBadge status="RR" />
<StatusBadge status="FFU" />

// With custom className
<StatusBadge status="APP" className="text-sm" />

// Outline variant
<StatusBadge status="RR" variant="outline" />
```

### In Table Columns
```typescript
{
  accessorKey: "status",
  header: "Status",
  cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
}
```

### With Status Dots
```typescript
import { StatusDot, StatusLabel } from "@/components/ui/status-badge";

// Just the dot
<StatusDot status="APP" />

// Dot with label
<StatusLabel status="APP" />
```

## 🎓 Color Psychology

### 🟡 Yellow (APP - Approval)
- **Meaning**: Attention, caution, pending
- **Action**: Review and approve
- **User Response**: "This needs my attention"

### 🟠 Orange (RR - Review & Return)
- **Meaning**: Action required, needs work
- **Action**: Review and provide feedback
- **User Response**: "This needs revision"

### 🟢 Green (FFU - For Field Use)
- **Meaning**: Approved, ready, go ahead
- **Action**: Use in field
- **User Response**: "This is ready to use"

## 🚀 Future Enhancements

### Planned Features
1. **Row Highlighting**: Highlight entire table rows based on status
2. **Status Filters**: Color-coded filter buttons
3. **Status Icons**: Add icons alongside colors
4. **Status Animations**: Subtle transitions on status change
5. **Status Tooltips**: Detailed status information on hover

### Example Future Usage
```typescript
// Row highlighting
<TableRow className={getStatusBgColor(status)}>
  ...
</TableRow>

// Filter buttons with colors
<FilterButton status="APP" color="yellow">
  Show APP Only
</FilterButton>

// Status with icon
<StatusBadge status="APP" icon={<CheckIcon />} />
```

## 📖 Best Practices

### Do's ✅
- Always use `StatusBadge` for status display
- Use consistent colors (Yellow, Orange, Green)
- Include dark mode variants
- Maintain text labels (don't rely on color alone)
- Test in both light and dark modes

### Don'ts ❌
- Don't hardcode status colors
- Don't use color as the only indicator
- Don't forget dark mode variants
- Don't use inconsistent shades
- Don't override status badge styles

## ✅ Completion Status

- ✅ Enhanced submission colors utility
- ✅ Created StatusBadge component
- ✅ Updated statusPill function in sections.tsx
- ✅ Applied colors to all Project page tables
- ✅ Added dark mode support
- ✅ No linter errors
- ✅ Documentation created

---

**Implementation Date**: December 26, 2025
**Version**: 1.0.0
**Status**: ✅ Complete and Active
**Color Scheme**: 
- APP = 🟡 Yellow (`bg-yellow-100 text-yellow-800`)
- RR = 🟠 Orange (`bg-orange-100 text-orange-800`)
- FFU = 🟢 Green (`bg-green-100 text-green-800`)
**Scope**: All status indicators on Project page and related pages

