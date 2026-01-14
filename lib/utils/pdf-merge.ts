"use client";

/**
 * Utility to merge multiple PDFs into a single PDF document
 */

import { getGoogleDriveFileId } from "./pdf-url";

/**
 * Merges multiple PDF files into a single PDF document
 * @param pdfUrls - Array of PDF URLs or paths
 * @param filename - Output filename
 * @returns Promise that resolves when the merged PDF is downloaded
 */
export async function mergePdfsToBinde(
  pdfUrls: string[],
  filename: string = "merged-documents.pdf"
): Promise<void> {
  if (pdfUrls.length === 0) {
    console.warn("No PDFs to merge");
    return;
  }

  try {
    // Dynamically import pdf-lib
    const { PDFDocument } = await import("pdf-lib");

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Process each PDF URL
    for (const pdfUrl of pdfUrls) {
      try {
        // Fetch the PDF
        let response: Response;
        
        // Handle Google Drive URLs
        if (pdfUrl.includes('drive.google.com')) {
          // For Google Drive, we need to use the download API
          const fileId = getGoogleDriveFileId(pdfUrl);
          if (fileId) {
            response = await fetch(`/api/google-drive/download?fileId=${fileId}`);
            // If response is a redirect, follow it
            if (response.redirected) {
              response = await fetch(response.url);
            }
          } else {
            console.warn(`Skipping invalid Google Drive URL: ${pdfUrl}`);
            continue;
          }
        } else {
          // For regular URLs or paths
          let url = pdfUrl;
          if (!url.startsWith('http')) {
            // Relative path - make it absolute
            url = url.startsWith('/') 
              ? `${window.location.origin}${url}`
              : `${window.location.origin}/${url}`;
          }
          response = await fetch(url);
        }

        if (!response.ok) {
          console.warn(`Failed to fetch PDF: ${pdfUrl}`, response.statusText);
          continue;
        }

        // Get PDF as array buffer
        const arrayBuffer = await response.arrayBuffer();
        
        // Load the PDF document
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        // Copy all pages from this PDF to the merged PDF
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      } catch (error) {
        console.warn(`Error processing PDF ${pdfUrl}:`, error);
        // Continue with other PDFs even if one fails
        continue;
      }
    }

    // Generate the merged PDF as a blob
    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

    // Download the merged PDF
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error merging PDFs:", error);
    throw error;
  }
}
