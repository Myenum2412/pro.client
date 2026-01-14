/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
}

/**
 * Get file type from MIME type or extension
 */
export function getFileType(mimeType: string | null, filename: string): string {
  if (mimeType) {
    if (mimeType.includes("pdf")) return "pdf";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "spreadsheet";
    if (mimeType.includes("document") || mimeType.includes("word")) return "document";
    if (mimeType.includes("video/")) return "video";
    if (mimeType.includes("audio/")) return "audio";
  }

  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) return "image";
  if (["xls", "xlsx", "csv"].includes(ext || "")) return "spreadsheet";
  if (["doc", "docx", "txt"].includes(ext || "")) return "document";
  if (["mp4", "avi", "mov", "wmv"].includes(ext || "")) return "video";
  if (["mp3", "wav", "ogg"].includes(ext || "")) return "audio";

  return "other";
}

