# SSR Architecture Documentation

## Current Status

✅ **All page files are Server Components** (SSR enabled)
- `app/dashboard/page.tsx` - Server Component
- `app/projects/page.tsx` - Server Component  
- `app/chat/page.tsx` - Server Component
- All other page files - Server Components

## Why Some Components Need "use client"

Components with `"use client"` are necessary for:

1. **Interactive UI Elements**
   - Buttons, forms, dialogs, dropdowns
   - User interactions (clicks, inputs, hovers)

2. **React Hooks**
   - `useState`, `useEffect`, `useCallback`, `useMemo`
   - State management and side effects

3. **Browser APIs**
   - `window`, `localStorage`, `document`
   - Browser-specific functionality

4. **Context Providers**
   - React Context API
   - State sharing across components

## Architecture Pattern

```
Page (Server Component - SSR)
  └── Client Component (Interactive UI)
      └── Server Component (Data fetching)
```

## Best Practices

- ✅ Pages fetch data on the server
- ✅ Interactive UI stays as client components
- ✅ Data fetching happens in server components
- ✅ Minimal client-side JavaScript bundle

## Components That Must Stay Client

- UI components (buttons, dialogs, forms)
- Components with hooks
- Components using browser APIs
- Interactive features (search, filters, etc.)
