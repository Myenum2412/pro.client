"use client";

import * as React from "react";
import { File, FileText, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SimplePDFViewer } from "@/components/files/simple-pdf-viewer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

type ChatFileLinkProps = {
  url: string;
  fileName: string;
  fileType?: string;
  className?: string;
  projectId?: string;
  onDrawingDataShow?: (data: any) => void;
};

// Extract drawing number from file name or URL (e.g., "R-1" from "U2961_R-1_APP...")
function extractDrawingNumber(fileName: string, url: string): string | null {
  // Try to extract from file name first (e.g., "U2961_R-1_APP...")
  const nameMatch = fileName.match(/[_-](R-\d+[A-Z]?)/i);
  if (nameMatch) {
    return nameMatch[1].toUpperCase();
  }

  // Try to extract from URL path
  const urlMatch = url.match(/[_-](R-\d+[A-Z]?)/i);
  if (urlMatch) {
    return urlMatch[1].toUpperCase();
  }

  return null;
}

async function fetchDrawingInfo(dwgNo: string, projectId?: string) {
  const params = new URLSearchParams({ dwgNo });
  if (projectId) {
    params.set("projectId", projectId);
  }
  const response = await fetch(`/api/chat/drawing-info?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch drawing info");
  }
  return response.json();
}

export function ChatFileLink({ url, fileName, fileType, className, projectId, onDrawingDataShow }: ChatFileLinkProps) {
  const [pdfViewerOpen, setPdfViewerOpen] = React.useState(false);
  const [drawingDataOpen, setDrawingDataOpen] = React.useState(false);
  const isPdf = fileType === "pdf" || fileName.toLowerCase().endsWith(".pdf") || url.toLowerCase().includes(".pdf");
  
  const dwgNo = extractDrawingNumber(fileName, url);
  
  const { data: drawingData, isLoading: isLoadingDrawing } = useQuery({
    queryKey: ["drawing-info", dwgNo, projectId],
    queryFn: () => fetchDrawingInfo(dwgNo!, projectId),
    enabled: !!dwgNo && drawingDataOpen,
  });

  const handleShowData = () => {
    setDrawingDataOpen(true);
    if (drawingData && onDrawingDataShow) {
      onDrawingDataShow(drawingData);
    }
  };

  return (
    <>
      <div className={cn("flex items-center gap-2 p-2 bg-muted/50 rounded-lg border mt-2", className)}>
        <div className="h-10 w-10 rounded bg-background border flex items-center justify-center shrink-0">
          {isPdf ? (
            <FileText className="h-5 w-5 text-muted-foreground" />
          ) : (
            <File className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className="text-xs text-muted-foreground truncate">{url}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {dwgNo && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowData}
              className="shrink-0"
            >
              <Info className="h-4 w-4 mr-2" />
              Data
            </Button>
          )}
          {isPdf ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPdfViewerOpen(true)}
              className="shrink-0"
            >
              <FileText className="h-4 w-4 mr-2" />
              View
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(url, "_blank")}
              className="shrink-0"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </Button>
          )}
        </div>
      </div>
      {isPdf && (
        <SimplePDFViewer
          open={pdfViewerOpen}
          onOpenChange={setPdfViewerOpen}
          pdfUrl={url}
          fileName={fileName}
        />
      )}
      {dwgNo && (
        <Dialog open={drawingDataOpen} onOpenChange={setDrawingDataOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Drawing Information: {dwgNo}</DialogTitle>
              <DialogDescription>
                {drawingData?.projectName || "Drawing details"}
              </DialogDescription>
            </DialogHeader>
            {isLoadingDrawing ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading drawing data...</div>
              </div>
            ) : drawingData ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Drawing Number</p>
                        <p className="text-sm font-semibold">{drawingData.dwgNo}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <Badge variant="outline" className="mt-1">
                          {drawingData.status}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Description</p>
                        <p className="text-sm">{drawingData.description}</p>
                      </div>
                      {drawingData.elements && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">Elements</p>
                          <p className="text-sm">{drawingData.elements}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Weight (Tons)</p>
                        <p className="text-sm font-semibold">{drawingData.totalWeightTons?.toFixed(2) || "0.00"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Latest Submitted Date</p>
                        <p className="text-sm">{drawingData.latestSubmittedDate || "N/A"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Release Status</p>
                        <p className="text-sm">{drawingData.releaseStatus || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">No drawing data found</div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
