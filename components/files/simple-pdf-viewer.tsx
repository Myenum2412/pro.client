"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink } from "lucide-react";

type SimplePDFViewerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string;
  fileName: string;
};

// Get file extension from filename (case-insensitive)
function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

// Check if file is an image
function isImageFile(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff', 'tif', 'ico'].includes(ext);
}

// Check if file is a PDF
function isPdfFile(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  return ext === 'pdf';
}

// Check if file is a CAD/DWG file
function isCadFile(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  return ['dwg', 'dxf', 'dgn', 'dwf'].includes(ext);
}

// Check if file can be viewed in browser
function canViewInBrowser(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  // Images, PDFs, and some CAD formats can be viewed
  return isImageFile(fileName) || isPdfFile(fileName) || isCadFile(fileName);
}

export function SimplePDFViewer({
  open,
  onOpenChange,
  pdfUrl,
  fileName,
}: SimplePDFViewerProps) {
  const isImage = isImageFile(fileName);
  const isPdf = isPdfFile(fileName);
  const isCad = isCadFile(fileName);
  const canView = canViewInBrowser(fileName);

  // Ensure the URL is properly encoded
  const encodedUrl = React.useMemo(() => {
    try {
      // If it's already a full URL, return as is
      if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
        return pdfUrl;
      }
      // If it's a relative path, ensure proper encoding
      // Split by '/' and encode each segment
      const parts = pdfUrl.split('/');
      const encodedParts = parts.map(part => {
        // Don't encode if it's already encoded or empty
        if (!part || part.includes('%')) return part;
        return encodeURIComponent(part);
      });
      return encodedParts.join('/');
    } catch {
      return pdfUrl;
    }
  }, [pdfUrl]);

  const handleDownload = () => {
    try {
      if (typeof document === "undefined" || !document.body) return;
      
      const link = document.createElement("a");
      link.href = encodedUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      if (link.parentNode) {
        document.body.removeChild(link);
      }
    } catch {
      // Silently handle errors
    }
  };

  const handleOpenInNewTab = () => {
    window.open(encodedUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg font-semibold truncate max-w-md">{fileName}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
          {isImage ? (
            <img
              src={encodedUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                const errorDiv = document.createElement('div');
                errorDiv.className = 'flex flex-col items-center justify-center h-full text-center p-8';
                errorDiv.innerHTML = `
                  <p class="text-lg font-medium mb-2">Image failed to load</p>
                  <p class="text-sm text-muted-foreground mb-4">The image file may be corrupted or the path is incorrect</p>
                `;
                if (target.parentNode) {
                  target.parentNode.replaceChild(errorDiv, target);
                }
              }}
            />
          ) : isPdf ? (
            <iframe
              src={encodedUrl}
              className="w-full h-full border-0 min-h-[600px]"
              title={fileName}
              onError={() => {
                console.error('Failed to load PDF:', encodedUrl);
              }}
            />
          ) : isCad ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <p className="text-lg font-medium mb-2">CAD File Preview</p>
              <p className="text-sm text-muted-foreground mb-4">
                CAD files (DWG, DXF, etc.) require specialized software to view.
                Please download the file to open it in a CAD application.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleOpenInNewTab}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ) : canView ? (
            <iframe
              src={encodedUrl}
              className="w-full h-full border-0 min-h-[600px]"
              title={fileName}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <p className="text-lg font-medium mb-2">Preview not available</p>
              <p className="text-sm text-muted-foreground mb-4">
                This file type cannot be previewed in the browser
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleOpenInNewTab}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

