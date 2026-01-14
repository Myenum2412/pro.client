"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Folder, FileText, ChevronRight, ChevronDown, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { SimplePDFViewer } from "@/components/files/simple-pdf-viewer";

type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  extension?: string;
  size?: number;
};

type ProjectFilesResponse = {
  data: FileNode[];
  projectId: string;
  count?: number;
  timestamp?: string;
};

type ProjectFilesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
};

function FileTreeItem({
  node,
  level = 0,
  expandedIds,
  onToggleExpand,
  onFileClick,
}: {
  node: FileNode;
  level?: number;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onFileClick: (file: FileNode) => void;
}) {
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const isPdf = node.type === "file" && node.extension?.toLowerCase() === "pdf";

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded hover:bg-accent cursor-pointer transition-colors ${
          level > 0 ? "ml-4" : ""
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (node.type === "folder") {
            onToggleExpand(node.id);
          } else if (isPdf) {
            onFileClick(node);
          }
        }}
      >
        {node.type === "folder" ? (
          <>
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )
            ) : (
              <div className="w-4" />
            )}
            <Folder className="h-4 w-4 text-blue-500 shrink-0" />
            <span className="text-sm font-medium truncate">{node.name}</span>
          </>
        ) : (
          <>
            <div className="w-4" />
            <FileText
              className={`h-4 w-4 shrink-0 ${
                isPdf ? "text-red-500" : "text-gray-500"
              }`}
            />
            <span
              className={`text-sm truncate ${
                isPdf ? "text-blue-600 hover:underline cursor-pointer" : ""
              }`}
            >
              {node.name}
            </span>
          </>
        )}
      </div>
      {node.type === "folder" && isExpanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectFilesDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
}: ProjectFilesDialogProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; name: string } | null>(null);

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["project-files-dialog", projectId],
    queryFn: () => fetchJson<ProjectFilesResponse>(`/api/files/project/${encodeURIComponent(projectId)}`),
    enabled: open,
    staleTime: 30_000,
  });

  const fileTree = response?.data || [];

  // Auto-expand first level folders on load
  useEffect(() => {
    if (open && fileTree.length > 0 && expandedIds.size === 0) {
      const firstLevelFolders = fileTree.filter(
        (node) => node.type === "folder"
      );
      if (firstLevelFolders.length > 0) {
        setExpandedIds(new Set(firstLevelFolders.map((f) => f.id)));
      }
    }
  }, [open, fileTree, expandedIds.size]);

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleFileClick = (file: FileNode) => {
    if (file.type === "file" && file.extension?.toLowerCase() === "pdf") {
      setSelectedPdf({
        url: file.path,
        name: file.name,
      });
    }
  };

  const getAllPdfs = (nodes: FileNode[]): FileNode[] => {
    const pdfs: FileNode[] = [];
    nodes.forEach((node) => {
      if (node.type === "file" && node.extension?.toLowerCase() === "pdf") {
        pdfs.push(node);
      }
      if (node.children) {
        pdfs.push(...getAllPdfs(node.children));
      }
    });
    return pdfs;
  };

  const allPdfs = getAllPdfs(fileTree);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-lg font-semibold">
              Project Files - {projectName}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {allPdfs.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {allPdfs.length} PDF{allPdfs.length !== 1 ? "s" : ""} available
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading files...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-sm text-red-600 mb-2">Failed to load files</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {error instanceof Error ? error.message : "Unknown error"}
                  </p>
                  <Button size="sm" variant="outline" onClick={() => refetch()}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : fileTree.length > 0 ? (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {fileTree.map((node) => (
                    <FileTreeItem
                      key={node.id}
                      node={node}
                      expandedIds={expandedIds}
                      onToggleExpand={handleToggleExpand}
                      onFileClick={handleFileClick}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">No files found</p>
                  <p className="text-xs text-muted-foreground">
                    This project folder is empty
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedPdf && (
        <SimplePDFViewer
          open={!!selectedPdf}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedPdf(null);
            }
          }}
          pdfUrl={selectedPdf.url}
          fileName={selectedPdf.name}
        />
      )}
    </>
  );
}
