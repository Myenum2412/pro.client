# PDF Mapping Implementation

## Overview

This document describes the intelligent PDF mapping system that automatically links table records to their corresponding PDF documents using a predefined and secure file path structure.

## Features

### 1. **Intelligent Path Resolution**

The system automatically resolves PDF paths based on:
- **Project ID**: Unique identifier for the project
- **Module Type**: The table/section type (drawings_yet_to_return, drawings_yet_to_release, drawing_log, invoice_history, upcoming_submissions, change_orders, rfi_submissions)
- **Document Data**: Document-specific identifiers (dwgNo, invoiceId, changeOrderId, rfiNo, etc.)

### 2. **Dynamic Path Structure**

The system uses a consistent path structure:
```
/projects/{projectId}/{moduleType}/{documentIdentifier}.pdf
```

Examples:
- Drawings: `/projects/{projectId}/drawings/{dwgNo}.pdf`
- Invoices: `/projects/{projectId}/invoices/{invoiceId}.pdf`
- Change Orders: `/projects/{projectId}/change_orders/{changeOrderId}.pdf`
- RFI Submissions: `/projects/{projectId}/rfi/{rfiNo}.pdf`
- Submissions: `/projects/{projectId}/submissions/{drawingNo}.pdf`

### 3. **Security Features**

- **Path Validation**: Prevents path traversal attacks (`..`, `//`)
- **Access Control**: Restricts paths to `/projects/`, `/public/`, or `/assets/` directories
- **URL Encoding**: Automatically encodes project IDs and document identifiers
- **Permission Checks**: Role-based access control for downloads

### 4. **Real-time Updates**

When a drawing status changes (e.g., from "Yet to Approve" to "Approved"), the PDF automatically appears in the correct table without duplication. This is achieved through:
- Dynamic path resolution based on current status
- Status-based table filtering
- Automatic PDF path assignment during data mapping

### 5. **Embedded PDF Viewer**

- Full-featured PDF viewer with annotation capabilities
- Zoom controls
- Page navigation
- Annotation tools (highlight, underline, strikethrough, pen, shapes, text, stamps, notes)
- Layer management
- Version history

### 6. **Download Functionality**

- Permission-based downloads (`canDownload` permission)
- Support for Google Drive URLs
- Automatic filename generation based on document identifier
- Secure download handling

## Implementation Details

### Core Components

#### 1. PDF Path Resolver (`lib/utils/pdf-path-resolver.ts`)

```typescript
resolvePdfPath(
  projectId: string,
  moduleType: ModuleType,
  documentData: Record<string, any>,
  existingPath?: string | null
): string | null
```

This function intelligently resolves PDF paths by:
1. Checking for existing paths in the database
2. Constructing paths based on module type and document identifiers
3. Falling back to legacy path structure if needed

#### 2. Path Validation (`validatePdfPath`)

```typescript
validatePdfPath(path: string): boolean
```

Validates that paths are secure and don't contain path traversal attempts.

#### 3. Path Normalization (`normalizePdfPath`)

```typescript
normalizePdfPath(path: string | null | undefined): string | null
```

Normalizes paths to ensure consistent format and validates security.

### API Integration

The API route (`app/api/projects/[projectId]/sections/route.ts`) automatically:
1. Fetches data from Supabase
2. Resolves PDF paths for each record using `resolvePdfPath`
3. Normalizes paths using `normalizePdfPath`
4. Returns data with `pdfPath` field included

### Frontend Integration

#### Table Row Click Handler

```typescript
const handlePdfRowClick = useCallback((row: any) => {
  const pdfPath = row.pdfPath || row.pdf_path || row.pdfUrl || row.pdf_url;
  if (pdfPath) {
    setPdfDialog({
      open: true,
      pdfUrl: pdfPath,
      title: `Drawing ${row.dwgNo} - ${row.description}`,
      // ... other metadata
    });
  }
}, []);
```

This handler:
- Checks multiple possible PDF path field names
- Opens the PDF viewer dialog
- Sets appropriate title and description

#### PDF Viewer Component

The `DrawingPdfViewerAdvanced` component:
- Displays PDFs in an embedded iframe
- Provides annotation tools
- Handles downloads with permission checks
- Supports Google Drive URLs

## Usage

### Adding PDF Paths to New Tables

1. Import the path resolver:
```typescript
import { resolvePdfPath, normalizePdfPath, type ModuleType } from "@/lib/utils/pdf-path-resolver";
```

2. In your API route, map the data:
```typescript
const mappedData = data.map((item) => {
  const resolvedPdfPath = resolvePdfPath(
    projectId,
    "your_module_type" as ModuleType,
    {
      id: item.id,
      // ... other identifiers
    },
    item.pdf_path // existing path from database
  );
  
  return {
    ...item,
    pdfPath: normalizePdfPath(resolvedPdfPath),
  };
});
```

3. Add `pdfPath` to your TypeScript types:
```typescript
export type YourRow = {
  // ... existing fields
  pdfPath?: string;
};
```

4. Add `onRowClick` handler to your table:
```typescript
<SectionTableCard
  // ... other props
  onRowClick={handlePdfRowClick}
/>
```

## Path Resolution Logic

### Drawings (drawings_yet_to_return, drawings_yet_to_release, drawing_log)

1. Check for `dwgNo` → `/projects/{projectId}/drawings/{dwgNo}.pdf`
2. Fallback to `id` → `/projects/{projectId}/{moduleType}/{id}.pdf`
3. Legacy path: `/assets/{jobNumber}/Drawing-Log/{dwgNo}.pdf`

### Invoices

1. Check for `invoiceId` → `/projects/{projectId}/invoices/{invoiceId}.pdf`
2. Fallback to `id` → `/projects/{projectId}/invoice_history/{id}.pdf`

### Change Orders

1. Check for `changeOrderId` → `/projects/{projectId}/change_orders/{changeOrderId}.pdf`
2. Fallback to `id` → `/projects/{projectId}/change_orders/{id}.pdf`

### RFI Submissions

1. Check for `rfiNo` → `/projects/{projectId}/rfi/{rfiNo}.pdf`
2. Fallback to `id` → `/projects/{projectId}/rfi_submissions/{id}.pdf`

### Submissions

1. Check for `drawingNo` → `/projects/{projectId}/submissions/{drawingNo}.pdf`
2. Fallback to `id` → `/projects/{projectId}/upcoming_submissions/{id}.pdf`

## Security Considerations

1. **Path Traversal Prevention**: All paths are validated to prevent `..` and `//` sequences
2. **Access Control**: Paths are restricted to specific directories
3. **URL Encoding**: Project IDs and document identifiers are URL-encoded
4. **Permission Checks**: Downloads require `canDownload` permission
5. **Input Validation**: All user inputs are validated before path construction

## Real-time Updates

The system supports real-time updates through:
1. **Status-based Filtering**: Tables filter records based on status
2. **Dynamic Path Resolution**: PDFs are resolved based on current status
3. **Automatic Re-mapping**: When status changes, PDFs automatically appear in the correct table

Example:
- A drawing with status "APP" appears in "Drawings Yet to Approve"
- When status changes to "FFU", it moves to "Approved Drawing yet to release"
- The PDF path remains consistent, ensuring no duplication

## Future Enhancements

1. **Supabase Storage Integration**: Migrate PDFs to Supabase Storage for better scalability
2. **Caching**: Implement PDF path caching for improved performance
3. **Version Control**: Track PDF versions and revisions
4. **Access Logging**: Log PDF access for audit purposes
5. **Batch Operations**: Support batch PDF operations (download, view, etc.)

## Troubleshooting

### PDF Not Showing

1. Check if `pdfPath` is included in the API response
2. Verify the path structure matches the file system
3. Check browser console for CORS or 404 errors
4. Verify path validation is passing

### Download Not Working

1. Check `canDownload` permission in `userPermissions`
2. Verify PDF URL is accessible
3. Check browser download settings
4. Verify Google Drive API key (if using Google Drive)

### Path Resolution Issues

1. Verify all required identifiers are present in document data
2. Check module type matches expected values
3. Verify project ID is correct
4. Check path validation logs

## Related Files

- `lib/utils/pdf-path-resolver.ts` - Core path resolution logic
- `app/api/projects/[projectId]/sections/route.ts` - API route with PDF path mapping
- `components/projects/project-sections.tsx` - Frontend table integration
- `components/projects/drawing-pdf-viewer-advanced.tsx` - PDF viewer component
- `lib/pdf-annotations/types.ts` - Type definitions including UserPermissions

