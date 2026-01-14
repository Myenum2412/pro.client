/**
 * Utility functions for handling PDF URLs, especially Google Drive URLs
 */

/**
 * Converts a Google Drive sharing URL to a preview/view URL (not download)
 * @param url - Google Drive sharing URL or any PDF URL
 * @param useEmbed - If true, returns embed viewer URL (better for iframes), otherwise preview URL
 * @returns PDF preview URL that can be viewed in browser/iframe without downloading
 */
export function convertGoogleDriveUrl(url: string, useEmbed = false): string {
  if (!url || typeof url !== 'string') {
    return url;
  }

  // Extract file ID from various Google Drive URL formats
  let fileId: string | null = null;
  
  // Format 1: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // Format 2: https://drive.google.com/file/d/FILE_ID/preview
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    fileId = fileMatch[1];
  }
  
  // Format 3: https://drive.google.com/open?id=FILE_ID
  if (!fileId) {
    const openMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    if (openMatch) {
      fileId = openMatch[1];
    }
  }
  
  // Format 4: https://drive.google.com/uc?id=FILE_ID
  if (!fileId) {
    const ucMatch = url.match(/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/);
    if (ucMatch) {
      fileId = ucMatch[1];
    }
  }
  
  // Format 5: https://docs.google.com/document/d/FILE_ID/edit (for Google Docs)
  if (!fileId) {
    const docsMatch = url.match(/docs\.google\.com\/[^/]+\/d\/([a-zA-Z0-9_-]+)/);
    if (docsMatch) {
      fileId = docsMatch[1];
    }
  }
  
  if (fileId) {
    if (useEmbed) {
      // Use Google Drive's embed viewer URL (best for iframes)
      return `https://drive.google.com/file/d/${fileId}/preview`;
    } else {
      // Use the original view URL format if it was already a view URL
      // Otherwise use preview format
      if (url.includes('/view')) {
        // Keep the view format but ensure it's properly formatted
        return `https://drive.google.com/file/d/${fileId}/view`;
      }
      // Default to preview for better compatibility
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }
  
  // If not a Google Drive URL, return as-is
  return url;
}

/**
 * Checks if a URL is a Google Drive URL
 */
export function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com');
}

/**
 * Gets the Google Drive file ID from a URL
 */
export function getGoogleDriveFileId(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  // Try various Google Drive URL formats
  let fileId: string | null = null;
  
  // Format 1: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return fileMatch[1];
  }
  
  // Format 2: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch) {
    return openMatch[1];
  }
  
  // Format 3: https://drive.google.com/uc?id=FILE_ID
  const ucMatch = url.match(/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) {
    return ucMatch[1];
  }
  
  // Format 4: https://docs.google.com/document/d/FILE_ID/edit
  const docsMatch = url.match(/docs\.google\.com\/[^/]+\/d\/([a-zA-Z0-9_-]+)/);
  if (docsMatch) {
    return docsMatch[1];
  }
  
  return null;
}

/**
 * Converts a Google Drive URL to a direct download URL
 * @param url - Google Drive sharing URL
 * @returns Direct download URL or original URL if not a Google Drive URL
 */
export function convertGoogleDriveToDownloadUrl(url: string): string {
  const fileId = getGoogleDriveFileId(url);
  if (fileId) {
    // Use Google Drive's direct download URL
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return url;
}

