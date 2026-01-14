"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download } from "lucide-react";

// Temporarily simplified - fabric viewer needs updates for v7
export type DrawingData = {
  annotations: string;
  layers: string;
  revision: number;
};

type DrawingPdfDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string;
  title: string;
  description?: string;
  drawingId?: string;
  dwgNo?: string;
  status?: string;
  releaseStatus?: string;
  onSave?: (data: DrawingData) => Promise<void>;
  initialData?: DrawingData;
};

export function DrawingPdfDialog({
  open,
  onOpenChange,
  pdfUrl,
  title,
  description,
}: DrawingPdfDialogProps) {
  // Check if URL is external (starts with http:// or https://)
  const isExternalUrl = pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://');
  
  // For external URLs, try to use them directly in iframe
  // If that fails, provide option to open in new tab
  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title || 'document.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-xl w-full min-w-[95vw] max-h-[95vh] h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 w-full flex flex-row items-center justify-between">
          <div className="flex-1">
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </div>
          {isExternalUrl && (
            <div className="flex gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          )}
        </DialogHeader>
        <div className="flex-1 px-6 pb-6 min-h-0 overflow-hidden">
          {isExternalUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border rounded-md"
              title={title}
              allow="fullscreen"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
            />
          ) : (
            <iframe
              src={pdfUrl}
              className="w-full h-full border rounded-md"
              title={title}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

