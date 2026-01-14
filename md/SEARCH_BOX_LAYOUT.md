# Search Box Layout - Visual Guide

## 🎨 New Centered Layout

All search boxes in the Project Page tables are now **centered** for better visual balance and user experience.

---

## 📐 Layout Diagrams

### Complete Table Header Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  CARD HEADER (border-bottom)                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ROW 1: Title and Actions                               │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  📊 Table Title          [Export ▼] [Filter ▼]   │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ROW 2: Centered Search Box                             │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │              🔍 [Search...]                       │   │   │
│  │  │              (max-width: 448px)                   │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🖼️ Desktop View (1920px)

```
┌───────────────────────────────────────────────────────────────────────────┐
│  📊 Drawings Yet to Return (APP/R&R)                [Export ▼] [Filter ▼] │
│                                                                           │
│                         🔍 [Search across all columns...]                 │
│                              (Centered, 448px max)                        │
├───────────────────────────────────────────────────────────────────────────┤
│  ☑  Drawing No  │  Client  │  Total Weight  │  Status  │  Date  │ Actions│
├───────────────────────────────────────────────────────────────────────────┤
│  ☐  DWG-001     │  ABC     │  125.5 tons    │  APP     │  Dec 26│  ⚙️    │
│  ☐  DWG-002     │  XYZ     │  89.3 tons     │  RR      │  Dec 25│  ⚙️    │
│  ☐  DWG-003     │  ABC     │  156.8 tons    │  APP     │  Dec 24│  ⚙️    │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Tablet View (768px)

```
┌─────────────────────────────────────────────────────────┐
│  📊 Drawings Yet to Return      [Export ▼] [Filter ▼]  │
│                                                         │
│              🔍 [Search across all columns...]          │
│                   (Centered, 448px max)                 │
├─────────────────────────────────────────────────────────┤
│  ☑  Drawing No  │  Client  │  Weight  │  Status  │ ... │
├─────────────────────────────────────────────────────────┤
│  ☐  DWG-001     │  ABC     │  125.5   │  APP     │ ... │
│  ☐  DWG-002     │  XYZ     │  89.3    │  RR      │ ... │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 Mobile View (375px)

```
┌────────────────────────────────┐
│  📊 Drawings Yet to Return     │
│  [Export ▼] [Filter ▼]         │
│                                │
│  🔍 [Search...]                │
│     (Full width)               │
├────────────────────────────────┤
│  ☑  Drawing No  │  Client  │..│
├────────────────────────────────┤
│  ☐  DWG-001     │  ABC     │..│
│  ☐  DWG-002     │  XYZ     │..│
└────────────────────────────────┘
```

---

## 🎯 Search Box Details

### Search Box Component

```
┌─────────────────────────────────────────────────────────┐
│  🔍 Search across all columns...                    ❌  │
│  │                                                   │   │
│  └─ Search Icon (left)                Clear Button ─┘   │
│     • Position: absolute left-3                         │
│     • Size: 16px                                        │
│     • Color: muted                                      │
│                                                         │
│  Input Field:                                           │
│  • Height: 36px (h-9)                                   │
│  • Padding: pl-9 (left), pr-9 (right)                  │
│  • Border: Standard input border                        │
│  • Focus: Ring on focus                                 │
│  • Placeholder: "Search across all columns..."          │
└─────────────────────────────────────────────────────────┘
```

### Container Structure

```
<div className="relative w-full max-w-md mx-auto">
  │
  ├─ relative: Positioning context for absolute children
  ├─ w-full: Full width of parent
  ├─ max-w-md: Maximum width of 448px (28rem)
  └─ mx-auto: Centers horizontally with auto margins
  
  <Search className="absolute left-3 top-1/2 -translate-y-1/2" />
  │
  └─ Positioned at left side, vertically centered
  
  <input className="h-9 w-full rounded-md border pl-9 pr-9" />
  │
  └─ Full width input with padding for icons
  
  {globalFilter && (
    <button className="absolute right-3 top-1/2 -translate-y-1/2">
      <X />
    </button>
  )}
  │
  └─ Clear button appears when text is entered
</div>
```

---

## 🎨 Visual Spacing

### Vertical Spacing

```
┌─────────────────────────────────────┐
│  Table Title    [Export] [Filter]   │  ← Row 1
│  ↕ gap-4 (16px)                     │
│  🔍 [Search...]                      │  ← Row 2
│  ↕ (Card padding)                   │
├─────────────────────────────────────┤
│  Table Content                      │
└─────────────────────────────────────┘
```

### Horizontal Spacing

```
Desktop (1920px):
┌────────────────────────────────────────────────────────┐
│  Title                                  [Export][Filter]│
│  ←─────────────────────────────────────────────────→   │
│                    [Search Box]                        │
│         ←──────── max-w-md ────────→                   │
│         ←─ mx-auto centers this ─→                     │
└────────────────────────────────────────────────────────┘

Mobile (375px):
┌──────────────────────────┐
│  Title                   │
│  [Export][Filter]        │
│  [Search Box Full Width] │
│  ←────── w-full ───────→ │
└──────────────────────────┘
```

---

## 🔍 Interactive States

### Default State
```
┌─────────────────────────────────────────────┐
│  🔍 Search across all columns...            │
│  (Gray placeholder text, no clear button)   │
└─────────────────────────────────────────────┘
```

### Focus State
```
┌─────────────────────────────────────────────┐
│  🔍 |Search across all columns...           │
│  (Blue ring, cursor visible)                │
└─────────────────────────────────────────────┘
```

### With Text
```
┌─────────────────────────────────────────────┐
│  🔍 DWG-001                              ❌  │
│  (Text entered, clear button appears)       │
└─────────────────────────────────────────────┘
```

### Hover on Clear Button
```
┌─────────────────────────────────────────────┐
│  🔍 DWG-001                              ❌  │
│  (Clear button darkens on hover)            │
└─────────────────────────────────────────────┘
```

---

## 📊 All Project Page Tables

### 1. Drawings Yet to Return (APP/R&R)
```
┌─────────────────────────────────────────────────────────┐
│  📊 Drawings Yet to Return (APP/R&R)  [Export] [Filter] │
│                   🔍 [Search...]                         │
├─────────────────────────────────────────────────────────┤
│  [Table with drawings data]                             │
└─────────────────────────────────────────────────────────┘
```

### 2. Drawings Yet to Release
```
┌─────────────────────────────────────────────────────────┐
│  📊 Drawings Yet to Release           [Export] [Filter] │
│                   🔍 [Search...]                         │
├─────────────────────────────────────────────────────────┤
│  [Table with drawings data]                             │
└─────────────────────────────────────────────────────────┘
```

### 3. Drawing Log
```
┌─────────────────────────────────────────────────────────┐
│  📊 Drawing Log                       [Export] [Filter] │
│                   🔍 [Search...]                         │
├─────────────────────────────────────────────────────────┤
│  [Table with log entries]                               │
└─────────────────────────────────────────────────────────┘
```

### 4. Invoice History
```
┌─────────────────────────────────────────────────────────┐
│  📊 Invoice History                   [Export] [Filter] │
│                   🔍 [Search...]                         │
├─────────────────────────────────────────────────────────┤
│  [Table with invoice data]                              │
└─────────────────────────────────────────────────────────┘
```

### 5. Change Orders
```
┌─────────────────────────────────────────────────────────┐
│  📊 Change Orders                     [Export] [Filter] │
│                   🔍 [Search...]                         │
├─────────────────────────────────────────────────────────┤
│  [Table with change order data]                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Alignment Comparison

### Before (Right-Aligned)
```
Title                              [Search][Export][Filter]
                                   ↑
                                   Search was cramped with buttons
```

### After (Centered)
```
Title                                      [Export][Filter]
                    [Search]
                       ↑
                   Centered, prominent, easy to find
```

---

## 💅 CSS Classes Breakdown

### Container
```css
relative          /* Positioning context */
w-full            /* Full width */
max-w-md          /* Max 448px (28rem) */
mx-auto           /* Center horizontally */
```

### Search Icon
```css
absolute          /* Position absolutely */
left-3            /* 12px from left */
top-1/2           /* 50% from top */
-translate-y-1/2  /* Center vertically */
h-4 w-4           /* 16px × 16px */
text-muted-foreground  /* Gray color */
```

### Input Field
```css
h-9               /* 36px height */
w-full            /* Full width of container */
rounded-md        /* Medium border radius */
border            /* Standard border */
border-input      /* Input border color */
bg-background     /* Background color */
pl-9              /* 36px left padding (for icon) */
pr-9              /* 36px right padding (for clear) */
text-sm           /* 14px font size */
shadow-sm         /* Small shadow */
transition-colors /* Smooth color transitions */
focus-visible:outline-none  /* Remove outline */
focus-visible:ring-1        /* Add ring on focus */
focus-visible:ring-ring     /* Ring color */
```

### Clear Button
```css
absolute          /* Position absolutely */
right-3           /* 12px from right */
top-1/2           /* 50% from top */
-translate-y-1/2  /* Center vertically */
text-muted-foreground      /* Gray color */
hover:text-foreground      /* Darker on hover */
transition-colors          /* Smooth transition */
```

---

## 📏 Dimensions

### Search Box Widths
- **Desktop**: 448px (max-w-md) centered
- **Tablet**: 448px (max-w-md) centered
- **Mobile**: 100% width (w-full)

### Search Box Height
- **All Sizes**: 36px (h-9)

### Icon Sizes
- **Search Icon**: 16px × 16px
- **Clear Icon**: 16px × 16px

### Spacing
- **Gap between rows**: 16px (gap-4)
- **Icon padding**: 12px (left-3, right-3)
- **Input padding**: 36px left/right (pl-9, pr-9)

---

## ✨ Benefits of Centered Layout

### Visual Benefits
✅ **Better Balance**: Symmetrical layout  
✅ **More Prominent**: Easier to spot  
✅ **Cleaner Design**: Separated from actions  
✅ **Professional Look**: Modern UI pattern  

### UX Benefits
✅ **Easier to Find**: Natural eye movement  
✅ **More Space**: Not cramped with buttons  
✅ **Clear Purpose**: Dedicated search area  
✅ **Consistent**: Same across all tables  

### Technical Benefits
✅ **Responsive**: Works on all screen sizes  
✅ **Maintainable**: Clean code structure  
✅ **Flexible**: Easy to adjust width  
✅ **Accessible**: Clear visual hierarchy  

---

## 🎬 Animation & Transitions

### Focus Transition
```
Default → Focus
border-color: gray → blue (smooth transition)
ring: none → 1px blue ring (instant)
```

### Clear Button Appearance
```
No text → Text entered
opacity: 0 → 1 (fade in)
display: none → block
```

### Clear Button Hover
```
Default → Hover
color: gray-500 → gray-900 (smooth transition)
```

---

## 📝 Code Example

### Complete Implementation
```tsx
<CardHeader className="border-b">
  <div className="flex flex-col items-center gap-4">
    {/* Row 1: Title and Actions */}
    <div className="flex items-center justify-between w-full">
      <CardTitle className="text-base">{title}</CardTitle>
      <CardAction className="flex items-center gap-2">
        <Button variant="outline">
          <Download className="size-4 sm:mr-2" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        <Button variant="outline">
          <Filter className="size-4 sm:mr-2" />
          <span className="hidden sm:inline">Filter</span>
        </Button>
      </CardAction>
    </div>
    
    {/* Row 2: Centered Search Box */}
    <div className="relative w-full max-w-md mx-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search across all columns..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      {globalFilter && (
        <button
          onClick={() => setGlobalFilter("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  </div>
</CardHeader>
```

---

## 🎯 Summary

✅ **All search boxes are now centered**  
✅ **Consistent layout across all Project Page tables**  
✅ **Maximum width of 448px on large screens**  
✅ **Full width on mobile devices**  
✅ **Clean two-row header structure**  
✅ **All functionality maintained**  

---

**Date**: December 26, 2025  
**Status**: ✅ Complete  
**Build**: Successful  
**File**: `components/projects/section-table-card.tsx`

