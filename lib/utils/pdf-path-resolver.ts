/**
 * PDF Path Resolver Utility
 * Intelligently maps table records to their corresponding PDF documents
 * using a predefined and secure file path structure.
 */

export type ModuleType = 
  | "drawings_yet_to_return"
  | "drawings_yet_to_release"
  | "drawing_log"
  | "invoice_history"
  | "upcoming_submissions"
  | "change_orders"
  | "rfi_submissions";

export type DocumentCategory = 
  | "drawing"
  | "invoice"
  | "submission"
  | "change_order"
  | "rfi"
  | "general";

/**
 * Resolves PDF path based on project ID, module type, and document data
 * @param projectId - The project ID
 * @param moduleType - The module/table type
 * @param documentData - Document data containing identifiers (dwgNo, id, etc.)
 * @param existingPath - Optional existing PDF path from database
 * @returns Resolved PDF path or null if path cannot be determined
 */
export function resolvePdfPath(
  projectId: string,
  moduleType: ModuleType,
  documentData: Record<string, any>,
  existingPath?: string | null
): string | null {
  // If an existing path is provided and it's valid, use it
  // Priority: Use the path from database if it exists (especially for Google Drive URLs)
  if (existingPath && typeof existingPath === 'string' && existingPath.trim()) {
    const trimmed = existingPath.trim();
    
    // If it's a URL (http/https), return it directly without modification
    // This preserves Google Drive URLs exactly as stored in Supabase
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    
    // If it's a relative path starting with /, return as-is
    if (trimmed.startsWith('/')) {
      return trimmed;
    }
    
    // If it's a relative path without leading slash, add it
    if (!trimmed.startsWith('/') && !trimmed.startsWith('http')) {
      return `/${trimmed}`;
    }
    
    return trimmed;
  }

  // Extract identifiers from document data
  const dwgNo = documentData.dwgNo || documentData.dwg_no || documentData.drawingNo || documentData.drawing_number;
  const docId = documentData.id;
  const projectNumber = documentData.jobNo || documentData.job_number || documentData.projectNumber || documentData.project_number;
  
  // Base path structure: /projects/{projectId}/{moduleType}/
  const basePath = `/projects/${encodeURIComponent(projectId)}/${moduleType}`;

  // Resolve path based on module type and available identifiers
  switch (moduleType) {
    case "drawings_yet_to_return":
    case "drawings_yet_to_release":
    case "drawing_log":
      if (dwgNo) {
        // Get project folder name from document data
        const jobNumber = documentData.jobNo || documentData.job_number || documentData.projectNumber || documentData.project_number || projectNumber;
        const projectName = documentData.projectName || documentData.project_name;
        
        // Build project folder name (e.g., "U2961_ JMEUC PUMP STATION" or "PRO 042_U2524_Valley View Business Park Tilt Panels")
        let projectFolder = jobNumber || '';
        if (projectName) {
          const sanitizedProjectName = projectName.trim();
          // Check if project folder already includes project name pattern
          if (!projectFolder.includes(sanitizedProjectName)) {
            // Check if it's a "PRO XXX_" format
            const proMatch = projectFolder.match(/^(PRO\s*\d+[_-])/i);
            if (proMatch) {
              projectFolder = `${proMatch[1]}${sanitizedProjectName}`;
            } else {
              projectFolder = `${projectFolder}_${sanitizedProjectName}`;
            }
          }
        }
        
        // Priority: Use "05 Approval Drawings" folder structure
        // Path format: /assets/{projectFolder}/05 Approval Drawings/{filename}
        // Supports all file formats (PDF, DWG, DXF, etc.)
        if (projectFolder) {
          // Build filename patterns - the actual file search will be done in the API route
          // This ensures we support all file formats, not just PDFs
          const description = documentData.description || '';
          const revision = documentData.revision || documentData.rev || '00';
          
          // Build filename - try multiple patterns (supports all extensions)
          let filename = '';
          
          // Pattern 1: {jobNumber}_{dwgNo}_APP {revision}_{description}.pdf
          if (description && jobNumber) {
            const sanitizedDesc = description
              .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
              .replace(/\s+/g, ' ') // Normalize whitespace
              .trim()
              .substring(0, 150); // Limit length
            
            filename = `${jobNumber}_${dwgNo}_APP ${revision}_${sanitizedDesc}.pdf`;
          } else if (jobNumber) {
            // Pattern 2: {jobNumber}_{dwgNo}.pdf (will match any extension in actual file system)
            filename = `${jobNumber}_${dwgNo}.pdf`;
          } else {
            // Pattern 3: {dwgNo}.pdf (fallback, will match any extension)
            filename = `${dwgNo}.pdf`;
          }
          
          // Return path to "05 Approval Drawings" folder
          // Note: The API route will search for actual files matching the drawing number
          // and support all file formats (PDF, DWG, DXF, etc.)
          return `/assets/${encodeURIComponent(projectFolder)}/05 Approval Drawings/${encodeURIComponent(filename)}`;
        }
        
        // Fallback 1: Legacy Drawing-Log path
        if (jobNumber) {
          return `/assets/${encodeURIComponent(jobNumber)}/Drawing-Log/${encodeURIComponent(dwgNo)}.pdf`;
        }
        
        // Fallback 2: Generic project path
        return `/projects/${encodeURIComponent(projectId)}/drawings/${encodeURIComponent(dwgNo)}.pdf`;
      }
      if (docId) {
        return `${basePath}/${encodeURIComponent(docId)}.pdf`;
      }
      break;

    case "invoice_history":
      const invoiceId = documentData.invoiceId || documentData.invoice_id || docId;
      if (invoiceId) {
        // Structure: /projects/{projectId}/invoices/{invoiceId}.pdf
        return `/projects/${encodeURIComponent(projectId)}/invoices/${encodeURIComponent(invoiceId)}.pdf`;
      }
      break;

    case "upcoming_submissions":
      const submissionId = documentData.id || docId;
      const submissionDrawingNo = documentData.drawingNo || documentData.drawing_number || dwgNo;
      if (submissionDrawingNo) {
        return `/projects/${encodeURIComponent(projectId)}/submissions/${encodeURIComponent(submissionDrawingNo)}.pdf`;
      }
      if (submissionId) {
        return `${basePath}/${encodeURIComponent(submissionId)}.pdf`;
      }
      break;

    case "change_orders":
      const changeOrderId = documentData.changeOrderId || documentData.change_order_id || docId;
      const jobNumber = documentData.jobNo || documentData.job_number || documentData.projectNumber || documentData.project_number;
      const projectName = documentData.projectName || documentData.project_name;
      
      if (changeOrderId && jobNumber) {
        // Extract CO number from changeOrderId (format: "U2524 - CO #001" or just "001")
        let coNumber = String(changeOrderId);
        // Remove job number and "CO #" prefix if present (e.g., "U2524 - CO #001" -> "001")
        coNumber = coNumber.replace(new RegExp(`^${jobNumber}\\s*-\\s*CO\\s*#?\\s*`, "i"), "").trim();
        // Remove any remaining "CO #" or "CO#" prefix
        coNumber = coNumber.replace(/^CO\s*#?\s*/i, "").trim();
        
        // If coNumber is still empty or invalid, use the original changeOrderId
        if (!coNumber || coNumber === changeOrderId) {
          coNumber = String(changeOrderId).replace(/^CO\s*#?\s*/i, "").trim() || "001";
        }
        
        // Build project folder name: "U2524_Valley View Business Park Tilt Panels"
        let projectFolder = jobNumber;
        if (projectName) {
          // Keep spaces in project name, just combine with job number
          const sanitizedProjectName = projectName.trim();
          projectFolder = `${jobNumber}_${sanitizedProjectName}`;
        }
        
        // Structure: /assets/files/{ProjectFolder}/04 Documents/Change Order (CO)/PRO CO#{SequentialNumber}_{JobNumber}_CO#{CONumber}/PRO CO#{SequentialNumber}_{JobNumber}_CO#{CONumber} (1).pdf
        // Format: PRO CO#112_U2524_CO#001/PRO CO#112_U2524_CO#001 (1).pdf
        // The "112" is a sequential number (passed from API route, calculated as 100 + index + 1)
        // The PDF is inside a folder with the same name, and the file has "(1)" appended
        const sequentialNumber = documentData.sequentialNumber || documentData.sequential_number || coNumber;
        const folderName = `PRO CO#${sequentialNumber}_${jobNumber}_CO#${coNumber}`;
        const fileName = `${folderName} (1)`;
        return `/assets/files/${encodeURIComponent(projectFolder)}/04 Documents/Change Order (CO)/${encodeURIComponent(folderName)}/${encodeURIComponent(fileName)}.pdf`;
      }
      break;

    case "rfi_submissions":
      const rfiNo = documentData.rfiNo || documentData.rfi_no || documentData.proRfiNo || documentData.pro_rfi_no;
      const rfiJobNumber = documentData.jobNo || documentData.job_number || documentData.projectNumber || documentData.project_number || projectNumber;
      const rfiProjectName = documentData.projectName || documentData.project_name;
      
      if (rfiNo && rfiJobNumber) {
        // Build project folder name (e.g., "U2961_ JMEUC PUMP STATION")
        let projectFolder = rfiJobNumber;
        if (rfiProjectName) {
          const sanitizedProjectName = rfiProjectName.trim();
          // Check if project folder already includes project name pattern
          if (!projectFolder.includes(sanitizedProjectName)) {
            // Check if it's a "PRO XXX_" format
            const proMatch = projectFolder.match(/^(PRO\s*\d+[_-])/i);
            if (proMatch) {
              projectFolder = `${proMatch[1]}${sanitizedProjectName}`;
            } else {
              projectFolder = `${projectFolder}_${sanitizedProjectName}`;
            }
          }
        }
        
        // Structure: /assets/{projectFolder}/04 Documents/004_RFI's/PRO_RFI's/{rfiNo}.pdf
        // Example: /assets/U2961_ JMEUC PUMP STATION/04 Documents/004_RFI's/PRO_RFI's/{rfiNo}.pdf
        // Note: The system should check for multiple file extensions (pdf, PDF, etc.) when the file is actually accessed
        return `/assets/${encodeURIComponent(projectFolder)}/04 Documents/004_RFI's/PRO_RFI's/${encodeURIComponent(rfiNo)}.pdf`;
      }
      if (rfiNo) {
        // Fallback: Use project ID if job number not available
        return `/projects/${encodeURIComponent(projectId)}/rfi/${encodeURIComponent(rfiNo)}.pdf`;
      }
      if (docId) {
        return `${basePath}/${encodeURIComponent(docId)}.pdf`;
      }
      break;
  }

  // Fallback: try to construct path from available data
  if (docId) {
    return `${basePath}/${encodeURIComponent(docId)}.pdf`;
  }

  return null;
}

/**
 * Validates if a PDF path is secure (prevents path traversal attacks)
 * @param path - The PDF path to validate
 * @returns true if path is secure, false otherwise
 */
export function validatePdfPath(path: string): boolean {
  if (!path || typeof path !== 'string') {
    return false;
  }

  // Allow absolute URLs (http/https) - check first to avoid false positives
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // For URLs, only reject path traversal attempts (..)
    // Allow // as it's part of the protocol (http://, https://)
    if (path.includes('..')) {
      return false;
    }
    return true;
  }

  // Reject paths with path traversal attempts
  if (path.includes('..')) {
    return false;
  }

  // Reject consecutive slashes in relative paths (but allow single /)
  // This prevents paths like /path//to/file but allows /path/to/file
  if (path.includes('//') && !path.startsWith('/')) {
    return false;
  }

  // Allow relative paths starting with /
  if (path.startsWith('/')) {
    // Ensure it starts with /projects/ to restrict access
    if (path.startsWith('/projects/')) {
      return true;
    }
    // Also allow public assets and local file paths
    if (path.startsWith('/public/') || path.startsWith('/assets/')) {
      return true;
    }
  }

  return false;
}

/**
 * Normalizes PDF path to ensure consistent format
 * @param path - The PDF path to normalize
 * @returns Normalized path or null if invalid
 */
export function normalizePdfPath(path: string | null | undefined): string | null {
  if (!path || typeof path !== 'string') {
    return null;
  }

  const trimmed = path.trim();
  if (!trimmed) {
    return null;
  }

  // For URLs (especially Google Drive URLs), return as-is without validation
  // This preserves the exact URL format stored in Supabase
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Validate path security for relative paths
  if (!validatePdfPath(trimmed)) {
    return null;
  }

  // Normalize relative paths
  if (!trimmed.startsWith('/')) {
    return `/${trimmed}`;
  }

  return trimmed;
}

