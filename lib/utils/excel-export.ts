"use client";

/**
 * Excel export utilities - isolated module to prevent bundling issues
 * This module is only loaded when Excel export is actually needed
 */

export async function exportToExcelFile(
  data: Record<string, unknown>[],
  filename: string,
  options?: {
    sheetName?: string;
    title?: string;
    projectName?: string;
    exportDate?: string;
  }
): Promise<void> {
  // Format a value for export (handle dates, numbers, etc.)
  function formatValue(value: unknown): string {
    if (value == null) return "";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") return value.toLocaleString();
    return String(value);
  }

  // Dynamically import xlsx using Function constructor to prevent static analysis
  // This ensures Turbopack doesn't try to evaluate xlsx at module load time
  const loadXLSX = new Function('return import("xlsx")');
  const XLSX = await loadXLSX();

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const sheetName = options?.sheetName || "Data";

  // Prepare data with formatted values
  const formattedData = data.map((row) => {
    const formatted: Record<string, string> = {};
    Object.entries(row).forEach(([key, value]) => {
      formatted[key] = formatValue(value);
    });
    return formatted;
  });

  // Add metadata rows if provided
  const wsData: any[] = [];
  
  if (options?.title) {
    wsData.push([options.title]);
    wsData.push([]);
  }
  
  if (options?.projectName) {
    wsData.push(["Project:", options.projectName]);
  }
  
  if (options?.exportDate) {
    wsData.push(["Export Date:", options.exportDate]);
  }
  
  if (wsData.length > 0) {
    wsData.push([]);
  }

  // Convert data to worksheet
  let ws: any;
  
  if (wsData.length > 0) {
    // Create worksheet with metadata first
    ws = XLSX.utils.aoa_to_sheet(wsData);
    // Then add the data
    XLSX.utils.sheet_add_json(ws, formattedData, { origin: `A${wsData.length + 1}`, skipHeader: false });
  } else {
    // No metadata, just create from data
    ws = XLSX.utils.json_to_sheet(formattedData);
  }

  // Auto-size columns
  const colWidths = Object.keys(formattedData[0] || {}).map((key) => {
    const maxLength = Math.max(
      key.length,
      ...formattedData.map((row) => String(row[key] || "").length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  ws["!cols"] = colWidths;

  // Style header row
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  const headerRow = wsData.length > 0 ? wsData.length : 0;
  
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col });
    if (!ws[cellAddress]) continue;
    
    ws[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "E2E8F0" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate Excel file
  XLSX.writeFile(wb, filename);
}

/**
 * Export data to Excel as Blob (for use in ZIP exports)
 */
export async function exportToExcelBlob(
  data: Record<string, unknown>[],
  options?: {
    sheetName?: string;
    title?: string;
    projectName?: string;
    exportDate?: string;
  }
): Promise<Blob> {
  // Format a value for export (handle dates, numbers, etc.)
  function formatValue(value: unknown): string {
    if (value == null) return "";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") return value.toLocaleString();
    return String(value);
  }

  // Dynamically import xlsx
  const loadXLSX = new Function('return import("xlsx")');
  const XLSX = await loadXLSX();

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const sheetName = options?.sheetName || "Data";

  // Prepare data with formatted values
  const formattedData = data.map((row) => {
    const formatted: Record<string, string> = {};
    Object.entries(row).forEach(([key, value]) => {
      formatted[key] = formatValue(value);
    });
    return formatted;
  });

  // Add metadata rows if provided
  const wsData: any[] = [];
  
  if (options?.title) {
    wsData.push([options.title]);
    wsData.push([]);
  }
  
  if (options?.projectName) {
    wsData.push(["Project:", options.projectName]);
  }
  
  if (options?.exportDate) {
    wsData.push(["Export Date:", options.exportDate]);
  }
  
  if (wsData.length > 0) {
    wsData.push([]);
  }

  // Convert data to worksheet
  let ws: any;
  
  if (wsData.length > 0) {
    ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.sheet_add_json(ws, formattedData, { origin: `A${wsData.length + 1}`, skipHeader: false });
  } else {
    ws = XLSX.utils.json_to_sheet(formattedData);
  }

  // Auto-size columns
  const colWidths = Object.keys(formattedData[0] || {}).map((key) => {
    const maxLength = Math.max(
      key.length,
      ...formattedData.map((row) => String(row[key] || "").length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  ws["!cols"] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate Excel file as blob
  const excelBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

