"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FolderPlus, MoreVertical, FileText, Loader2, Eye, FolderOpen } from "lucide-react";
import { FileTree } from "./file-tree";
import { SimplePDFViewer } from "./simple-pdf-viewer";
import { FloatingSearch } from "./floating-search";
import { useFileDirectory } from "@/lib/hooks/use-files";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationContainer } from "./notification-toast";
import { FileTreeSkeleton, FileGridSkeleton, FileDetailsSkeleton } from "./skeleton-loader";

type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  extension?: string;
  size?: number;
};

export function FileManagementClient() {
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<FileNode | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfToView, setPdfToView] = useState<{ url: string; name: string } | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [localFiles, setLocalFiles] = useState<Map<string, { url: string; name: string; type: string }>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    notifications,
    removeNotification,
    success,
    error: showError,
    info,
  } = useNotifications();

  // Use TanStack Query hook for file operations with automatic caching
  const { 
    data: fileTreeData = [], 
    isLoading, 
    error: queryError, 
    dataUpdatedAt,
    refetch,
    isRefetching 
  } = useFileDirectory("", {
    // Using defaults from use-files hook (5 minutes staleTime, no polling)
    // Manual refresh available via button instead of aggressive polling
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Memoize file tree to prevent unnecessary re-renders
  const fileTree = useMemo(() => fileTreeData, [fileTreeData]);

  // Handle file updates notification
  const lastUpdated = useMemo(() => dataUpdatedAt ? new Date(dataUpdatedAt) : null, [dataUpdatedAt]);
  
  // Show success notification on updates (only if not initial load)
  useEffect(() => {
    if (fileTree.length > 0 && lastUpdated && isInitialized) {
      success("Files Updated", `Loaded ${fileTree.length} items from local directory`);
    }
  }, [fileTree.length, lastUpdated, isInitialized, success]);

  // Handle errors
  useEffect(() => {
    if (queryError) {
      showError("Update Failed", queryError instanceof Error ? queryError.message : "Failed to load files");
    }
  }, [queryError, showError]);

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);
  
  const isRefreshing = isRefetching;
  const error = queryError;

  // Auto-expand first folder on initial load
  useEffect(() => {
    if (!isLoading && !isInitialized && fileTree.length > 0) {
      const firstFolder = fileTree.find((node) => node.type === "folder");
      if (firstFolder) {
        setSelectedNode(firstFolder);
        setExpandedIds(new Set([firstFolder.id]));
        setIsInitialized(true);
      }
    }
  }, [fileTree, isLoading, isInitialized]);

  // Handle hover preview
  const handleFolderHover = (node: FileNode) => {
    if (node.type === "folder") {
      setHoveredNode(node);
    }
  };

  // Display node is either hovered or selected (hovered takes precedence for preview)
  const displayNode = hoveredNode || selectedNode;

  const handleFileClick = (file: FileNode) => {
    if (file.type === "folder") {
      // For folders with children, expand them in the tree
      if (file.children && file.children.length > 0) {
        setSelectedNode(file);
      }
    } else if (file.type === "file" && file.extension?.toLowerCase() === "pdf") {
      // Use local file path
      const url = `/assets/files/${file.path.replace(/\\/g, '/').split('/').map(segment => encodeURIComponent(segment)).join('/')}`;
      
      setPdfToView({
        url,
        name: file.name,
      });
      setPdfViewerOpen(true);
    } else if (file.type === "file") {
      // For non-PDF files, try to open them
      const url = `/assets/files/${file.path.replace(/\\/g, '/').split('/').map(segment => encodeURIComponent(segment)).join('/')}`;
      window.open(url, '_blank');
    }
  };

  const handleLocalFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const fileId = `${file.name}-${file.size}-${file.lastModified}`;
      
      // Check if already loaded
      if (localFiles.has(fileId)) {
        const existing = localFiles.get(fileId)!;
        if (file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf')) {
          setPdfToView({ url: existing.url, name: existing.name });
          setPdfViewerOpen(true);
        } else {
          window.open(existing.url, '_blank');
        }
        return;
      }

      // Create object URL for the file
      const objectUrl = URL.createObjectURL(file);
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      
      setLocalFiles((prev) => {
        const newMap = new Map(prev);
        newMap.set(fileId, {
          url: objectUrl,
          name: file.name,
          type: file.type || fileExtension,
        });
        return newMap;
      });

      // Open PDFs in viewer, others in new tab
      if (file.type === "application/pdf" || fileExtension === "pdf") {
        setPdfToView({ url: objectUrl, name: file.name });
        setPdfViewerOpen(true);
        success("File Opened", `Opened ${file.name} from local filesystem`);
      } else {
        window.open(objectUrl, '_blank');
        success("File Opened", `Opened ${file.name} in new tab`);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [localFiles, success]);

  const handleOpenLocalFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      localFiles.forEach((file) => {
        if (file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [localFiles]);

  const handleToggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
    info(
      autoRefreshEnabled ? "Auto-refresh Disabled" : "Auto-refresh Enabled",
      autoRefreshEnabled
        ? "Files will not update automatically"
        : "Files will refresh every 30 seconds"
    );
  };

  const handleManualRefresh = async () => {
    info("Refreshing...", "Fetching latest files from local directory");
    await refresh();
  };

  return (
    <>
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />

      <Card className="w-full shadow-lg flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="flex h-full">
            {/* Left Side - File Tree */}
            <div className="w-64 border-r shrink-0 overflow-y-auto p-4">
              <div className="mb-3 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Project Explorer
                </h3>
                {/* Open Local File Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleOpenLocalFile}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Open Local File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleLocalFileSelect}
                  accept="*/*"
                />
                {/* Floating Search Trigger */}
                <FloatingSearch files={fileTree} onSelectFile={handleFileClick} />
              </div>
              {isLoading ? (
                <FileTreeSkeleton />
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-sm text-red-600 mb-2">Failed to load files</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {error.message}
                  </p>
                  <Button size="sm" variant="outline" onClick={handleManualRefresh}>
                    Retry
                  </Button>
                </div>
              ) : fileTree.length > 0 ? (
                <FileTree
                  data={fileTree}
                  onSelect={setSelectedNode}
                  onHover={handleFolderHover}
                  selectedId={selectedNode?.id}
                  expandedIds={expandedIds}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-2">No files found</p>
                  <p className="text-xs text-muted-foreground">
                    Add files to <code className="bg-muted px-1 py-0.5 rounded">public/assets/files</code>
                  </p>
                </div>
              )}
            </div>

          {/* Right Side - File Content/Preview */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <FileDetailsSkeleton />
            ) : displayNode ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold">{displayNode.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {displayNode.type === "folder" ? "Folder" : "File"} • 
                      {displayNode.children ? ` ${displayNode.children.length} items` : " Document"}
                      {hoveredNode && " • Preview"}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>

                {displayNode.type === "folder" && displayNode.children ? (
                  isRefreshing ? (
                    <FileGridSkeleton />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {displayNode.children.map((child: FileNode) => (
                        <div
                          key={child.id}
                          className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-all hover:shadow-md"
                          onClick={() => {
                            if (child.type === "folder") {
                              handleFileClick(child);
                            } else {
                              setSelectedNode(child);
                            }
                          }}
                          onDoubleClick={() => {
                            if (child.type === "file" && child.extension?.toLowerCase() === "pdf") {
                              handleFileClick(child);
                            }
                          }}
                        >
                        <div className="flex items-center gap-3">
                          {child.type === "folder" ? (
                            <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                              <FolderPlus className="h-5 w-5 text-blue-600" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-gray-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate" title={child.name}>
                              {child.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {child.type === "folder" 
                                ? `${child.children?.length || 0} items` 
                                : child.extension || "File"}
                            </p>
                          </div>
                        </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="border rounded-lg p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">File Preview</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {displayNode.name}
                    </p>
                    {displayNode.extension && (
                      <p className="text-xs text-muted-foreground mb-4">
                        Type: {displayNode.extension.toUpperCase()}
                      </p>
                    )}
                    {displayNode.size && (
                      <p className="text-xs text-muted-foreground mb-4">
                        Size: {(displayNode.size / 1024).toFixed(2)} KB
                      </p>
                    )}
                    {displayNode.extension?.toLowerCase() === "pdf" && (
                      <Button
                        onClick={() => handleFileClick(displayNode)}
                        className="mt-4"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Open PDF Viewer
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <FolderPlus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Select a file or folder</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose an item from the file tree to view its contents
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleOpenLocalFile}
                    className="mt-2"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Open Local File
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      </Card>

    {pdfToView && (
      <SimplePDFViewer
        open={pdfViewerOpen}
        onOpenChange={(open) => {
          setPdfViewerOpen(open);
          if (!open) {
            // Clean up object URLs when viewer closes
            setPdfToView(null);
          }
        }}
        pdfUrl={pdfToView.url}
        fileName={pdfToView.name}
      />
    )}
    </>
  );
}

