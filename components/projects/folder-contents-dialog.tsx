"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, Folder, X, ExternalLink } from "lucide-react";
import { SimplePDFViewer } from "@/components/files/simple-pdf-viewer";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  extension?: string;
  size?: number;
  children?: FileNode[];
}

interface FolderContentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  dwgNo?: string;
  pdfPath?: string;
}

export function FolderContentsDialog({
  open,
  onOpenChange,
  projectId,
  dwgNo,
  pdfPath,
}: FolderContentsDialogProps) {
  const [files, setFiles] = React.useState<FileNode[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedPdf, setSelectedPdf] = React.useState<{ url: string; name: string } | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = React.useState(false);

  // Fetch folder contents when dialog opens
  React.useEffect(() => {
    if (open && projectId) {
      fetchFolderContents();
    } else {
      setFiles([]);
    }
  }, [open, projectId]);

  const fetchFolderContents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/files/project/${encodeURIComponent(projectId || "")}`);
      const data = await response.json();
      
      if (data.data) {
        // Flatten the file tree to show all PDFs
        const allFiles = flattenFileTree(data.data);
        setFiles(allFiles);
      }
    } catch (error) {
      console.error("Error fetching folder contents:", error);
    } finally {
      setLoading(false);
    }
  };

  const flattenFileTree = (nodes: FileNode[]): FileNode[] => {
    const result: FileNode[] = [];
    for (const node of nodes) {
      if (node.type === "file" && node.extension === ".pdf") {
        result.push(node);
      }
      if (node.children) {
        result.push(...flattenFileTree(node.children));
      }
    }
    return result;
  };

  const handlePdfClick = (file: FileNode) => {
    setSelectedPdf({ url: file.path, name: file.name });
    setPdfViewerOpen(true);
  };

  const handleDownload = (file: FileNode) => {
    const link = document.createElement("a");
    link.href = file.path;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If there's a direct PDF path, show it first
  const displayFiles = React.useMemo(() => {
    const result: FileNode[] = [];
    
    // Add the direct PDF if available
    if (pdfPath) {
      result.push({
        id: "direct-pdf",
        name: `${dwgNo || "document"}.pdf`,
        type: "file",
        path: pdfPath,
        extension: ".pdf",
      });
    }
    
    // Add other PDFs from folder
    result.push(...files);
    
    return result;
  }, [pdfPath, dwgNo, files]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              {dwgNo ? `Files for ${dwgNo}` : "Folder Contents"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto mt-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-sm text-muted-foreground">Loading files...</div>
              </div>
            ) : displayFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No PDF files found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {displayFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-red-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        {file.size && (
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePdfClick(file)}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedPdf && (
        <SimplePDFViewer
          open={pdfViewerOpen}
          onOpenChange={setPdfViewerOpen}
          pdfUrl={selectedPdf.url}
          fileName={selectedPdf.name}
        />
      )}
    </>
  );
}
