"use client";

/**
 * Export utilities for PDF and Excel generation
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type ExportFormat = "csv" | "excel" | "pdf" | "zip" | "binde";

export type ExportOptions = {
  filename: string;
  format: ExportFormat;
  title?: string;
  projectName?: string;
  exportDate?: string;
};

/**
 * Format a value for export (handle dates, numbers, etc.)
 */
function formatValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString();
  return String(value);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(
  baseName: string,
  format: ExportFormat,
  projectName?: string
): string {
  const date = new Date().toISOString().split("T")[0];
  const time = new Date().toTimeString().split(" ")[0].replace(/:/g, "-");
  const project = projectName ? `${projectName}_` : "";
  let extension: string;
  if (format === "excel") {
    extension = "xlsx";
  } else if (format === "zip") {
    extension = "zip";
  } else if (format === "binde") {
    extension = "pdf";
  } else {
    extension = format;
  }
  return `${project}${baseName}_${date}_${time}.${extension}`;
}

/**
 * Export data to CSV
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string
): void {
  if (!data.length) {
    console.warn("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  const escape = (v: unknown) => {
    const s = formatValue(v);
    const needsQuotes = /[",\n]/.test(s);
    const escaped = s.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const lines = [
    headers.join(","),
    ...data.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];

  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

/**
 * Export data to Excel
 * Uses fully dynamic import to prevent Turbopack from analyzing xlsx dependency
 */
export async function exportToExcel(
  data: Record<string, unknown>[],
  filename: string,
  options?: {
    sheetName?: string;
    title?: string;
    projectName?: string;
    exportDate?: string;
  }
): Promise<void> {
  if (!data.length) {
    console.warn("No data to export");
    return;
  }

  // Fully dynamic import using Function constructor to prevent static analysis
  // This ensures Turbopack doesn't try to evaluate xlsx at module load time
  const loadExcel = new Function('return import("./excel-export")');
  const excelModule = await loadExcel();
  await excelModule.exportToExcelFile(data, filename, options);
}

/**
 * Export data to ZIP (contains CSV and Excel files)
 */
export async function exportToZIP(
  data: Record<string, unknown>[],
  filename: string,
  options?: {
    title?: string;
    projectName?: string;
    exportDate?: string;
  }
): Promise<void> {
  if (!data.length) {
    console.warn("No data to export");
    return;
  }

  // Dynamically import JSZip using Function constructor to prevent static analysis
  const loadJSZip = new Function('return import("jszip")');
  const JSZipModule = await loadJSZip();
  const JSZip = JSZipModule.default || JSZipModule;
  const zip = new JSZip();

  // Generate CSV content
  const headers = Object.keys(data[0]);
  const escape = (v: unknown) => {
    const s = formatValue(v);
    const needsQuotes = /[",\n]/.test(s);
    const escaped = s.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };
  const csvLines = [
    headers.join(","),
    ...data.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];
  const csvContent = csvLines.join("\n");
  zip.file(`${filename.replace('.zip', '')}.csv`, csvContent);

  // Generate Excel file and add to zip
  try {
    const excelModule = await import("./excel-export");
    const excelBlob = await excelModule.exportToExcelBlob(data, {
      title: options?.title,
      projectName: options?.projectName,
      exportDate: options?.exportDate,
    });
    const excelArrayBuffer = await excelBlob.arrayBuffer();
    zip.file(`${filename.replace('.zip', '')}.xlsx`, excelArrayBuffer);
  } catch (error) {
    console.warn("Failed to add Excel to ZIP, continuing with CSV only:", error);
  }

  // Generate and download ZIP
  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, filename);
}

/**
 * Export data to Binde (Bound PDF - multiple pages combined)
 */
export function exportToBinde(
  data: Record<string, unknown>[],
  filename: string,
  options?: {
    title?: string;
    projectName?: string;
    exportDate?: string;
  }
): void {
  if (!data.length) {
    console.warn("No data to export");
    return;
  }

  // Determine orientation based on column count
  const columnCount = Object.keys(data[0]).length;
  const orientation = columnCount > 6 ? "landscape" : "portrait";

  // Create PDF document
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  let yPosition = 20;

  // Add title
  if (options?.title) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(options.title, 14, yPosition);
    yPosition += 10;
  }

  // Add metadata
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  if (options?.projectName) {
    doc.text(`Project: ${options.projectName}`, 14, yPosition);
    yPosition += 6;
  }
  
  if (options?.exportDate) {
    doc.text(`Export Date: ${options.exportDate}`, 14, yPosition);
    yPosition += 6;
  }

  yPosition += 4;

  // Prepare table data
  const headers = Object.keys(data[0]);
  const body = data.map((row) => headers.map((h) => formatValue(row[h])));

  // Add table with page break handling
  autoTable(doc, {
    head: [headers],
    body: body,
    startY: yPosition,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [15, 118, 110], // Emerald-600
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // Gray-50
    },
    margin: { top: 20, right: 14, bottom: 20, left: 14 },
    didDrawPage: (data) => {
      // Add page numbers
      const pageCount = doc.getNumberOfPages();
      const currentPage = doc.getCurrentPageInfo().pageNumber;
      doc.setFontSize(8);
      doc.text(
        `Page ${currentPage} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    },
  });

  // Save PDF
  doc.save(filename);
}

/**
 * Export data to PDF
 */
export function exportToPDF(
  data: Record<string, unknown>[],
  filename: string,
  options?: {
    title?: string;
    projectName?: string;
    exportDate?: string;
    orientation?: "portrait" | "landscape";
  }
): void {
  if (!data.length) {
    console.warn("No data to export");
    return;
  }

  // Determine orientation based on column count
  const columnCount = Object.keys(data[0]).length;
  const orientation = options?.orientation || (columnCount > 6 ? "landscape" : "portrait");

  // Create PDF document
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  let yPosition = 20;

  // Add title
  if (options?.title) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(options.title, 14, yPosition);
    yPosition += 10;
  }

  // Add metadata
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  if (options?.projectName) {
    doc.text(`Project: ${options.projectName}`, 14, yPosition);
    yPosition += 6;
  }
  
  if (options?.exportDate) {
    doc.text(`Export Date: ${options.exportDate}`, 14, yPosition);
    yPosition += 6;
  }

  yPosition += 4;

  // Prepare table data
  const headers = Object.keys(data[0]);
  const body = data.map((row) => headers.map((h) => formatValue(row[h])));

  // Add table
  autoTable(doc, {
    head: [headers],
    body: body,
    startY: yPosition,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [15, 118, 110], // Emerald-600
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // Gray-50
    },
    margin: { top: 20, right: 14, bottom: 20, left: 14 },
    didDrawPage: (data) => {
      // Add page numbers
      const pageCount = doc.getNumberOfPages();
      const currentPage = doc.getCurrentPageInfo().pageNumber;
      doc.setFontSize(8);
      doc.text(
        `Page ${currentPage} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    },
  });

  // Save PDF
  doc.save(filename);
}

/**
 * Download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Main export function that handles all formats
 */
export async function exportTableData(
  data: Record<string, unknown>[],
  options: ExportOptions
): Promise<void> {
  const { format, filename, title, projectName, exportDate } = options;

  const fullFilename = generateFilename(filename, format, projectName);
  const exportDateFormatted = exportDate || new Date().toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });

  switch (format) {
    case "csv":
      exportToCSV(data, fullFilename);
      break;
    case "excel":
      await exportToExcel(data, fullFilename, {
        title,
        projectName,
        exportDate: exportDateFormatted,
      });
      break;
    case "pdf":
      exportToPDF(data, fullFilename, {
        title,
        projectName,
        exportDate: exportDateFormatted,
      });
      break;
    case "zip":
      await exportToZIP(data, fullFilename, {
        title,
        projectName,
        exportDate: exportDateFormatted,
      });
      break;
    case "binde":
      exportToBinde(data, fullFilename, {
        title,
        projectName,
        exportDate: exportDateFormatted,
      });
      break;
    default:
      console.error(`Unsupported export format: ${format}`);
  }
}

