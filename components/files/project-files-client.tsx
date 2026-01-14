"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  RefreshCw, 
  FileText, 
  Download, 
  Eye, 
  Grid3x3, 
  List,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  Video,
  File,
  ChevronLeft,
  Search,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { SimplePDFViewer } from "./simple-pdf-viewer";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { cn } from "@/lib/utils";

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

type ViewMode = "grid" | "list";

// Supported file formats for viewing (case-insensitive check)
const VIEWABLE_FORMATS = [
  ".pdf", ".PDF",
  ".dwg", ".DWG", ".dxf", ".DXF", ".dgn", ".DGN", ".dwf", ".DWF",
  ".jpg", ".JPG", ".jpeg", ".JPEG", ".png", ".PNG", ".gif", ".GIF",
  ".bmp", ".BMP", ".svg", ".SVG", ".webp", ".WEBP", ".tiff", ".TIFF", ".tif", ".TIF",
  ".txt", ".TXT", ".csv", ".CSV",
  ".doc", ".DOC", ".docx", ".DOCX", ".xls", ".XLS", ".xlsx", ".XLSX",
  ".mp4", ".MP4", ".avi", ".AVI", ".mov", ".MOV", ".webm", ".WEBM"
];

// Get file icon based on extension
function getFileIcon(extension?: string, isFolder?: boolean) {
  if (isFolder) return Folder;
  
  if (!extension) return File;
  
  const ext = extension.toLowerCase();
  
  if ([".pdf", ".dwg"].includes(ext)) return FileText;
  if ([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"].includes(ext)) return ImageIcon;
  if ([".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"].includes(ext)) return Video;
  
  return File;
}

// Check if file can be viewed (case-insensitive)
function canViewFile(extension?: string): boolean {
  if (!extension) return false;
  // Normalize extension to lowercase for comparison
  const normalizedExt = extension.toLowerCase();
  return VIEWABLE_FORMATS.some(format => format.toLowerCase() === normalizedExt);
}

// Flatten file tree for breadcrumb navigation
function flattenPath(nodes: FileNode[], targetId: string, path: FileNode[] = []): FileNode[] | null {
  for (const node of nodes) {
    const currentPath = [...path, node];
    
    if (node.id === targetId) {
      return currentPath;
    }
    
    if (node.children) {
      const found = flattenPath(node.children, targetId, currentPath);
      if (found) return found;
    }
  }
  return null;
}

export function ProjectFilesClient({ projectId }: { projectId: string }) {
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [pdfToView, setPdfToView] = useState<{ url: string; name: string } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPath, setCurrentPath] = useState<FileNode[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: response,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["project-files", projectId],
    queryFn: () => fetchJson<ProjectFilesResponse>(`/api/files/project/${encodeURIComponent(projectId)}`),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const fileTree = response?.data || [];
  const decodedProjectId = decodeURIComponent(projectId);

  // Get current directory contents
  const currentDirectory = useMemo(() => {
    if (currentPath.length === 0) {
      return fileTree;
    }
    
    const lastFolder = currentPath[currentPath.length - 1];
    return lastFolder?.children || [];
  }, [currentPath, fileTree]);

  // Filter files based on search
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return currentDirectory;
    
    const query = searchQuery.toLowerCase();
    const filterNode = (node: FileNode): FileNode | null => {
      const nameMatch = node.name.toLowerCase().includes(query);
      
      if (node.type === "folder") {
        const filteredChildren = node.children?.map(filterNode).filter(Boolean) as FileNode[] | undefined;
        if (nameMatch || (filteredChildren && filteredChildren.length > 0)) {
          return { ...node, children: filteredChildren };
        }
        return null;
      }
      
      return nameMatch ? node : null;
    };
    
    return currentDirectory.map(filterNode).filter(Boolean) as FileNode[];
  }, [currentDirectory, searchQuery]);

  // Auto-expand first folder on initial load
  useEffect(() => {
    if (!isLoading && fileTree.length > 0 && expandedIds.size === 0) {
      const firstFolder = fileTree.find((node) => node.type === "folder");
      if (firstFolder) {
        setSelectedNode(firstFolder);
        setExpandedIds(new Set([firstFolder.id]));
      }
    }
  }, [fileTree, isLoading, expandedIds.size]);

  const handleFileClick = (file: FileNode) => {
    if (file.type === "folder") {
      // Navigate into folder
      setCurrentPath([...currentPath, file]);
      setSelectedNode(null);
    } else {
      setSelectedNode(file);
      // For viewable files, open in viewer
      if (canViewFile(file.extension) && file.path) {
        // Ensure path is properly formatted
        const filePath = file.path.startsWith('/') ? file.path : `/${file.path}`;
        setPdfToView({
          url: filePath,
          name: file.name,
        });
      } else if (file.path) {
        // For other files, open in a new tab
        const filePath = file.path.startsWith('/') ? file.path : `/${file.path}`;
        window.open(filePath, "_blank");
      }
    }
  };

  const handleFolderDoubleClick = (folder: FileNode) => {
    setCurrentPath([...currentPath, folder]);
    setSelectedNode(null);
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
    setSelectedNode(null);
  };

  const handleDownload = (file: FileNode) => {
    if (!file.path) return;
    
    try {
      if (typeof document === "undefined" || !document.body) return;
      
      const link = document.createElement("a");
      // Ensure path is properly formatted
      const filePath = file.path.startsWith('/') ? file.path : `/${file.path}`;
      link.href = filePath;
      link.download = file.name;
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

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (timestamp?: string): string => {
    if (!timestamp) return "—";
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return "—";
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header with Breadcrumbs and Controls */}
      <Card className="w-full shadow-lg">
        <CardHeader className="border-b shrink-0 bg-emerald-50/70 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-sm mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentPath([]);
                    setSelectedNode(null);
                  }}
                  disabled={currentPath.length === 0}
                  className="h-7 px-2"
                >
                  <Folder className="h-4 w-4 mr-1" />
                  {decodedProjectId}
                </Button>
                {currentPath.map((folder, index) => (
                  <div key={folder.id} className="flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBreadcrumbClick(index)}
                      className="h-7 px-2"
                    >
                      {folder.name}
                    </Button>
                  </div>
                ))}
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files and folders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9 h-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 px-3 rounded-r-none"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 px-3 rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="h-8"
              >
                {isRefetching ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading files...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-red-600 mb-2">Failed to load files</p>
              <p className="text-xs text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : filteredFiles.length > 0 ? (
            viewMode === "grid" ? (
              // Grid View (Dropbox-style)
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredFiles.map((node) => {
                  const Icon = getFileIcon(node.extension, node.type === "folder");
                  const isSelected = selectedNode?.id === node.id;
                  
                  return (
                    <div
                      key={node.id}
                      className={cn(
                        "group relative flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                        "hover:border-primary hover:shadow-md",
                        isSelected ? "border-primary bg-primary/5" : "border-transparent hover:bg-accent/50"
                      )}
                      onClick={() => handleFileClick(node)}
                      onDoubleClick={() => node.type === "folder" && handleFolderDoubleClick(node)}
                    >
                      <div className="flex flex-col items-center w-full">
                        <div className="mb-3 relative">
                          {node.type === "folder" ? (
                            <FolderOpen className="h-12 w-12 text-blue-500" />
                          ) : (
                            <Icon className={cn(
                              "h-12 w-12",
                              node.extension?.toLowerCase() === ".pdf" || node.extension?.toLowerCase() === ".dwg"
                                ? "text-red-500"
                                : node.extension && [".jpg", ".jpeg", ".png", ".gif"].includes(node.extension.toLowerCase())
                                ? "text-green-500"
                                : "text-gray-500"
                            )} />
                          )}
                        </div>
                        <div className="text-center w-full min-h-[3rem]">
                          <p className="text-xs font-medium truncate" title={node.name}>
                            {node.name}
                          </p>
                          {node.type === "file" && node.size && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatFileSize(node.size)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Hover Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          {node.type === "file" && canViewFile(node.extension) && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (node.path) {
                                  const filePath = node.path.startsWith('/') ? node.path : `/${node.path}`;
                                  setPdfToView({ url: filePath, name: node.name });
                                }
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(node);
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // List View
              <div className="space-y-1">
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-2">Modified</div>
                  <div className="col-span-1">Actions</div>
                </div>
                {filteredFiles.map((node) => {
                  const Icon = getFileIcon(node.extension, node.type === "folder");
                  const isSelected = selectedNode?.id === node.id;
                  
                  return (
                    <div
                      key={node.id}
                      className={cn(
                        "grid grid-cols-12 gap-4 px-4 py-3 rounded-md cursor-pointer transition-colors items-center",
                        "hover:bg-accent",
                        isSelected && "bg-accent"
                      )}
                      onClick={() => handleFileClick(node)}
                      onDoubleClick={() => node.type === "folder" && handleFolderDoubleClick(node)}
                    >
                      <div className="col-span-5 flex items-center gap-3 min-w-0">
                        <Icon className={cn(
                          "h-5 w-5 shrink-0",
                          node.type === "folder" ? "text-blue-500" :
                          node.extension?.toLowerCase() === ".pdf" || node.extension?.toLowerCase() === ".dwg"
                            ? "text-red-500"
                            : "text-gray-500"
                        )} />
                        <span className="text-sm truncate" title={node.name}>
                          {node.name}
                        </span>
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">
                        {node.type === "folder" ? "Folder" : (node.extension?.toUpperCase() || "File")}
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">
                        {node.type === "file" ? formatFileSize(node.size) : "—"}
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">
                        {formatDate(response?.timestamp)}
                      </div>
                      <div className="col-span-1 flex items-center gap-1">
                        {node.type === "file" && canViewFile(node.extension) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (node.path) {
                                const filePath = node.path.startsWith('/') ? node.path : `/${node.path}`;
                                setPdfToView({ url: filePath, name: node.name });
                              }
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(node);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                {searchQuery ? "No files match your search" : "This folder is empty"}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>


      {/* File Viewer */}
      {pdfToView && (
        <SimplePDFViewer
          open={!!pdfToView}
          onOpenChange={(open) => {
            if (!open) {
              setPdfToView(null);
            }
          }}
          pdfUrl={pdfToView.url}
          fileName={pdfToView.name}
        />
      )}
    </div>
  );
}
