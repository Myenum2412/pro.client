"use client";

/**
 * Advanced PDF Viewer with Comprehensive Annotation Tools
 * Full markup capabilities for PDF drawings
 */

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ToolMode, StampType, Layer } from "@/components/kokonutui/pdf-toolbar";
import { AutosaveManager } from "@/lib/pdf-annotations/autosave";
import { VersionHistoryManager } from "@/lib/pdf-annotations/version-history";
import type { Annotation, UserPermissions } from "@/lib/pdf-annotations/types";
import { cn } from "@/lib/utils";
import { convertGoogleDriveUrl, getGoogleDriveFileId } from "@/lib/utils/pdf-url";
import {
  Download,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog as HistoryDialog,
  DialogContent as HistoryDialogContent,
  DialogDescription as HistoryDialogDescription,
  DialogHeader as HistoryDialogHeader,
  DialogTitle as HistoryDialogTitle,
} from "@/components/ui/dialog";

// Configure PDF.js worker
if (typeof window !== "undefined") {
  // Use CDN with https protocol for better reliability
  // The protocol-relative URL (//) was causing issues, so we use https:// explicitly
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

type DrawingPdfViewerAdvancedProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string;
  title: string;
  description?: string;
  drawingId?: string;
  dwgNo?: string;
  onSave?: (annotations: Annotation[], pdfBlob: Blob) => Promise<void>;
  userPermissions?: UserPermissions;
  initialAnnotations?: Annotation[];
  initialLayers?: Layer[];
  currentRevisionNumber?: number;
  availableRevisions?: number[];
};

export function DrawingPdfViewerAdvanced({
  open,
  onOpenChange,
  pdfUrl,
  title,
  description,
  drawingId,
  dwgNo,
  onSave,
  userPermissions = {
    canEdit: true,
    canDelete: true,
    canCreateLayers: true,
    canManageRevisions: true,
    canDownload: true,
    isViewOnly: false,
  },
  initialAnnotations = [],
  initialLayers = [],
  currentRevisionNumber = 1,
  availableRevisions = [1],
}: DrawingPdfViewerAdvancedProps) {
  // State
  const [selectedTool, setSelectedTool] = useState<ToolMode | null>("select");
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [layers, setLayers] = useState<Layer[]>(initialLayers);
  const [selectedLayerId, setSelectedLayerId] = useState<string | undefined>(
    initialLayers[0]?.id
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<number | undefined>(
    currentRevisionNumber
  );

  // Tool settings
  const [penColor, setPenColor] = useState("#000000");
  const [penStrokeWidth, setPenStrokeWidth] = useState(2);
  const [shapeColor, setShapeColor] = useState("#F44336");
  const [shapeStrokeWidth, setShapeStrokeWidth] = useState(2);
  const [selectedStamp, setSelectedStamp] = useState<StampType>("approved");

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const annotationHistoryRef = useRef<Annotation[][]>([]);
  const historyIndexRef = useRef(-1);
  const isDrawingRef = useRef(false);
  const drawingStartRef = useRef<{ x: number; y: number } | null>(null);
  const penPointsRef = useRef<Array<{ x: number; y: number }>>([]);

  // Managers
  const autosaveManagerRef = useRef<AutosaveManager | null>(null);
  const versionHistoryManagerRef = useRef<VersionHistoryManager | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  // Initialize managers
  useEffect(() => {
    if (!onSave) return;

    autosaveManagerRef.current = new AutosaveManager({
      debounceMs: 2000,
      onSave: async () => {
        await handleSave(false);
      },
      onStatusChange: (status) => {
        setAutosaveStatus(status);
      },
    });

    versionHistoryManagerRef.current = new VersionHistoryManager(50);

    return () => {
      autosaveManagerRef.current?.destroy();
    };
  }, [onSave]);

  // Normalize PDF URL - convert relative paths to absolute URLs
  const normalizedPdfUrl = useMemo(() => {
    if (!pdfUrl) return '';
    
    // If it's already a full URL (http/https), return as is
    if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
      return pdfUrl;
    }
    
    // If it's a relative path starting with /, make it absolute
    if (pdfUrl.startsWith('/')) {
      // For local development and production, use window.location.origin
      if (typeof window !== 'undefined') {
        return `${window.location.origin}${pdfUrl}`;
      }
      return pdfUrl;
    }
    
    // If it's a relative path without leading slash, add it and make absolute
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/${pdfUrl}`;
    }
    
    return pdfUrl;
  }, [pdfUrl]);

  // Load PDF
  useEffect(() => {
    if (open && normalizedPdfUrl) {
      loadPdf();
    }
  }, [open, normalizedPdfUrl]);

  const loadPdf = async () => {
    try {
      // Always use iframe for desktop PDF viewing (same as Drawing Log)
      // The iframe can handle both Google Drive URLs and direct PDF URLs
      if (normalizedPdfUrl.includes('drive.google.com')) {
        // Convert to preview URL for iframe display
        // Use embed mode (true) for better iframe compatibility
        const convertedUrl = convertGoogleDriveUrl(normalizedPdfUrl, true);
        setPdfDoc(null);
        setTotalPages(0);
        setCurrentPage(1);
        // The iframe will handle the PDF display
        return;
      }
      
      // For non-Google Drive URLs, also use iframe for desktop view
      // The iframe will directly load the PDF URL
      setPdfDoc(null);
      setTotalPages(0);
      setCurrentPage(1);
      // The iframe will handle the PDF display directly
    } catch (error) {
      // If it's a Google Drive URL, try using the iframe approach
      if (normalizedPdfUrl.includes('drive.google.com')) {
        setPdfDoc(null);
        setTotalPages(0);
        setCurrentPage(1);
        // The iframe will handle the display
        return;
      }
      // For any error, still try to use iframe (it might work even if PDF.js fails)
      setPdfDoc(null);
      setTotalPages(0);
      setCurrentPage(1);
    }
  };

  // History management
  const saveToHistory = useCallback(() => {
    const current = [...annotations];
    annotationHistoryRef.current = annotationHistoryRef.current.slice(
      0,
      historyIndexRef.current + 1
    );
    annotationHistoryRef.current.push(current);
    historyIndexRef.current = annotationHistoryRef.current.length - 1;
  }, [annotations]);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      setAnnotations([...annotationHistoryRef.current[historyIndexRef.current]]);
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < annotationHistoryRef.current.length - 1) {
      historyIndexRef.current++;
      setAnnotations([...annotationHistoryRef.current[historyIndexRef.current]]);
    }
  }, []);

  const canUndo = historyIndexRef.current > 0;
  const canRedo =
    historyIndexRef.current < annotationHistoryRef.current.length - 1;

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 25, 400));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 25, 25));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(100);
  }, []);

  // Layer management
  const handleLayerSelect = useCallback((layerId: string) => {
    setSelectedLayerId(layerId);
  }, []);

  const handleLayerToggleVisibility = useCallback((layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  }, []);

  const handleLayerToggleLock = useCallback((layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
      )
    );
  }, []);

  const handleLayerCreate = useCallback((name: string, revisionNumber?: number) => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name,
      visible: true,
      locked: false,
      revisionNumber,
    };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  }, []);

  // Filter annotations by visible layers
  const visibleAnnotations = useMemo(() => {
    const visibleLayerIds = new Set(
      layers.filter((l) => l.visible).map((l) => l.id)
    );
    return annotations.filter(
      (ann) => !ann.layerId || visibleLayerIds.has(ann.layerId)
    );
  }, [annotations, layers]);

  // Canvas drawing handlers
  const getCanvasCoordinates = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return null;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!selectedTool || userPermissions.isViewOnly) return;
      if (selectedTool === "select") return;

      const coords = getCanvasCoordinates(e);
      if (!coords) return;

      isDrawingRef.current = true;
      drawingStartRef.current = coords;

      if (selectedTool === "pen") {
        penPointsRef.current = [coords];
      }
    },
    [selectedTool, userPermissions.isViewOnly, getCanvasCoordinates]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || !selectedTool) return;

      const coords = getCanvasCoordinates(e);
      if (!coords) return;

      if (selectedTool === "pen") {
        penPointsRef.current.push(coords);
        // Render pen stroke in real-time
        renderCanvas();
      }
    },
    [selectedTool, getCanvasCoordinates]
  );

  const handleCanvasMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || !selectedTool || !drawingStartRef.current) {
        return;
      }

      const coords = getCanvasCoordinates(e);
      if (!coords) return;

      const start = drawingStartRef.current;
      const end = coords;

      saveToHistory();

      let newAnnotation: Annotation | null = null;

      switch (selectedTool) {
        case "highlight":
          newAnnotation = {
            id: `ann-${Date.now()}`,
            type: "highlight",
            page: currentPage,
            layerId: selectedLayerId,
            revisionNumber: selectedRevision,
            x: Math.min(start.x, end.x),
            y: Math.min(start.y, end.y),
            width: Math.abs(end.x - start.x),
            height: Math.abs(end.y - start.y),
            color: "#FFEB3B",
            opacity: 0.3,
            createdAt: new Date().toISOString(),
            createdBy: "Current User",
          };
          break;

        case "underline":
          newAnnotation = {
            id: `ann-${Date.now()}`,
            type: "underline",
            page: currentPage,
            layerId: selectedLayerId,
            revisionNumber: selectedRevision,
            x: Math.min(start.x, end.x),
            y: start.y,
            width: Math.abs(end.x - start.x),
            color: "#2196F3",
            thickness: 2,
            createdAt: new Date().toISOString(),
            createdBy: "Current User",
          };
          break;

        case "strikethrough":
          newAnnotation = {
            id: `ann-${Date.now()}`,
            type: "strikethrough",
            page: currentPage,
            layerId: selectedLayerId,
            revisionNumber: selectedRevision,
            x: Math.min(start.x, end.x),
            y: start.y,
            width: Math.abs(end.x - start.x),
            color: "#F44336",
            thickness: 2,
            createdAt: new Date().toISOString(),
            createdBy: "Current User",
          };
          break;

        case "pen":
          if (penPointsRef.current.length > 1) {
            newAnnotation = {
              id: `ann-${Date.now()}`,
              type: "pen",
              page: currentPage,
              layerId: selectedLayerId,
              revisionNumber: selectedRevision,
              points: [...penPointsRef.current],
              color: penColor,
              strokeWidth: penStrokeWidth,
              createdAt: new Date().toISOString(),
              createdBy: "Current User",
            };
          }
          break;

        case "rectangle":
          newAnnotation = {
            id: `ann-${Date.now()}`,
            type: "rectangle",
            page: currentPage,
            layerId: selectedLayerId,
            revisionNumber: selectedRevision,
            x: Math.min(start.x, end.x),
            y: Math.min(start.y, end.y),
            width: Math.abs(end.x - start.x),
            height: Math.abs(end.y - start.y),
            color: shapeColor,
            strokeWidth: shapeStrokeWidth,
            createdAt: new Date().toISOString(),
            createdBy: "Current User",
          };
          break;

        case "circle":
          const radius = Math.sqrt(
            Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
          );
          newAnnotation = {
            id: `ann-${Date.now()}`,
            type: "circle",
            page: currentPage,
            layerId: selectedLayerId,
            revisionNumber: selectedRevision,
            centerX: start.x,
            centerY: start.y,
            radius,
            color: shapeColor,
            strokeWidth: shapeStrokeWidth,
            createdAt: new Date().toISOString(),
            createdBy: "Current User",
          };
          break;

        case "arrow":
          newAnnotation = {
            id: `ann-${Date.now()}`,
            type: "arrow",
            page: currentPage,
            layerId: selectedLayerId,
            revisionNumber: selectedRevision,
            startX: start.x,
            startY: start.y,
            endX: end.x,
            endY: end.y,
            color: shapeColor,
            strokeWidth: shapeStrokeWidth,
            arrowHeadSize: 10,
            createdAt: new Date().toISOString(),
            createdBy: "Current User",
          };
          break;

        case "stamp":
          newAnnotation = {
            id: `ann-${Date.now()}`,
            type: "stamp",
            page: currentPage,
            layerId: selectedLayerId,
            revisionNumber: selectedRevision,
            x: start.x,
            y: start.y,
            stampType: selectedStamp,
            width: 100,
            height: 100,
            createdAt: new Date().toISOString(),
            createdBy: "Current User",
          };
          break;
      }

      if (newAnnotation) {
        setAnnotations((prev) => [...prev, newAnnotation as Annotation]);
        autosaveManagerRef.current?.trigger();
      }

      isDrawingRef.current = false;
      drawingStartRef.current = null;
      penPointsRef.current = [];
    },
    [
      selectedTool,
      currentPage,
      selectedLayerId,
      selectedRevision,
      penColor,
      penStrokeWidth,
      shapeColor,
      shapeStrokeWidth,
      selectedStamp,
      saveToHistory,
      getCanvasCoordinates,
    ]
  );

  // Render canvas
  const renderCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    if (iframeRef.current) {
      const rect = iframeRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw annotations for current page
    visibleAnnotations
      .filter((ann) => ann.page === currentPage)
      .forEach((ann) => {
        // Render based on annotation type
        // This is a simplified version - full implementation would handle all types
        if (ann.type === "highlight" && "width" in ann && "height" in ann) {
          ctx.fillStyle = ann.color || "#FFEB3B";
          ctx.globalAlpha = ann.opacity || 0.3;
          ctx.fillRect(ann.x, ann.y, ann.width, ann.height);
          ctx.globalAlpha = 1;
        } else if (ann.type === "pen" && "points" in ann) {
          if (ann.points.length > 1) {
            ctx.strokeStyle = ann.color || "#000000";
            ctx.lineWidth = ann.strokeWidth || 2;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo(ann.points[0].x, ann.points[0].y);
            for (let i = 1; i < ann.points.length; i++) {
              ctx.lineTo(ann.points[i].x, ann.points[i].y);
            }
            ctx.stroke();
          }
        }
        // Add rendering for other annotation types...
      });

    // Draw current pen stroke if drawing
    if (selectedTool === "pen" && isDrawingRef.current && penPointsRef.current.length > 1) {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penStrokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(penPointsRef.current[0].x, penPointsRef.current[0].y);
      for (let i = 1; i < penPointsRef.current.length; i++) {
        ctx.lineTo(penPointsRef.current[i].x, penPointsRef.current[i].y);
      }
      ctx.stroke();
    }
  }, [visibleAnnotations, currentPage, selectedTool, penColor, penStrokeWidth]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Save handler
  const handleSave = async (showToast = true) => {
    if (!pdfDoc || !onSave) return;

    setIsSaving(true);
    try {
      const response = await fetch(convertGoogleDriveUrl(normalizedPdfUrl));
      const arrayBuffer = await response.arrayBuffer();
      const pdfDocLib = await PDFDocument.load(arrayBuffer);
      const pages = pdfDocLib.getPages();

      // Apply annotations to PDF (simplified - full implementation needed)
      annotations.forEach((ann) => {
        if (ann.page > 0 && ann.page <= pages.length) {
          const page = pages[ann.page - 1];
          const { height } = page.getSize();

          // Render annotation based on type
          // Full implementation would handle all annotation types
        }
      });

      const pdfBytes = await pdfDocLib.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

      await onSave(annotations, blob);

      // Create version
      if (versionHistoryManagerRef.current) {
        versionHistoryManagerRef.current.createVersion(
          annotations,
          "Current User",
          `Saved at ${new Date().toLocaleString()}`
        );
      }

      if (showToast) {
        toast.success("Drawing corrections saved successfully");
      }
    } catch (error) {
      if (showToast) {
        toast.error("Failed to save drawing corrections");
      }
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = () => {
    handleSave(true);
  };

  const handleHistory = () => {
    setShowHistoryDialog(true);
  };

  const handleDownload = useCallback(() => {
    try {
      if (typeof document === "undefined" || !document.body) return;
      
      // Check download permission
      if (userPermissions.canDownload === false) {
        toast.error("You don't have permission to download this document");
        return;
      }

      // Handle Google Drive URLs
      if (normalizedPdfUrl.includes('drive.google.com')) {
        // Use the API download route for better reliability
        const fileId = getGoogleDriveFileId(normalizedPdfUrl);
        if (fileId) {
          // Use our API route for downloading Google Drive files
          const downloadUrl = `/api/google-drive/download?fileId=${fileId}`;
          window.open(downloadUrl, '_blank');
          toast.success("Opening Google Drive PDF for download.");
          return;
        } else {
          // Fallback: open original URL in new tab
          window.open(normalizedPdfUrl, '_blank');
          toast.success("Opening Google Drive PDF.");
          return;
        }
      }

      // For non-Google Drive URLs, create temporary link to download file
      const link = document.createElement('a');
      link.href = normalizedPdfUrl;
      link.download = `${dwgNo || 'document'}.pdf`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      document.body.appendChild(link);
      link.click();
      
      // Safely remove the link
      if (link.parentNode) {
        document.body.removeChild(link);
      }
      
      toast.success("PDF download started");
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  }, [normalizedPdfUrl, dwgNo, userPermissions.canDownload]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl w-full min-w-[95vw] max-h-[95vh] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0 w-full border-b">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <DialogTitle>{title}</DialogTitle>
                {description && <DialogDescription>{description}</DialogDescription>}
              </div>
              {userPermissions.canDownload !== false && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="shrink-0"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

            {/* PDF Viewer */}
            <div className="flex-1 px-6 pb-6 min-h-0 overflow-auto">
              <div
                ref={containerRef}
                className="relative w-full h-full flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center" }}
              >
                {/* Always use iframe for desktop PDF viewing (same as Drawing Log) */}
                {/* Supports all file formats: PDF, DWG, DXF, images, etc. */}
                <iframe
                  ref={iframeRef}
                  src={normalizedPdfUrl.includes('drive.google.com') ? convertGoogleDriveUrl(normalizedPdfUrl, true) : normalizedPdfUrl}
                  className="w-full h-full border rounded-md"
                  title={title}
                  allow="fullscreen"
                  style={{ 
                    minHeight: '600px', 
                    display: 'block',
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    height: '100%'
                  }}
                  key={normalizedPdfUrl} // Force re-render when PDF URL changes
                  onError={(e) => {
                    console.error("Iframe failed to load file:", normalizedPdfUrl, e);
                    // Check if it's a 404 error
                    const iframe = e.target as HTMLIFrameElement;
                    if (iframe?.contentWindow?.location) {
                      try {
                        const iframeUrl = iframe.contentWindow.location.href;
                        if (iframeUrl.includes('404') || iframeUrl.includes('not found')) {
                          toast.error("File not found (404). The file may have been moved or deleted.");
                        } else {
                          toast.error("Failed to load file. Please check if the file exists.");
                        }
                      } catch (err) {
                        // Cross-origin error - can't access iframe content
                        toast.error("Failed to load file. Please check if the file exists.");
                      }
                    } else {
                      toast.error("Failed to load file. Please check if the file exists.");
                    }
                  }}
                  onLoad={(e) => {
                    // File loaded successfully
                    const iframe = e.target as HTMLIFrameElement;
                    try {
                      // Check if the iframe content indicates an error
                      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                      if (iframeDoc) {
                        const bodyText = iframeDoc.body?.textContent || '';
                        if (bodyText.includes('404') || bodyText.includes('not found') || bodyText.includes('This page could not be found')) {
                          console.error("File not found (404) in iframe content:", normalizedPdfUrl);
                          toast.error("File not found (404). The file may have been moved or deleted.");
                        } else {
                          console.log("File loaded successfully:", normalizedPdfUrl);
                        }
                      } else {
                        console.log("File loaded successfully:", normalizedPdfUrl);
                      }
                    } catch (err) {
                      // Cross-origin error - assume success if no error thrown
                      console.log("File loaded (cross-origin check skipped):", normalizedPdfUrl);
                    }
                  }}
                />
                {/* Canvas overlay for annotations - only interactive when needed */}
                <canvas
                  ref={canvasRef}
                  className={cn(
                    "absolute top-0 left-0",
                    selectedTool === "select"
                      ? "pointer-events-auto cursor-pointer"
                      : selectedTool && !userPermissions.isViewOnly
                      ? "pointer-events-auto cursor-crosshair"
                      : "pointer-events-none"
                  )}
                  style={{ zIndex: 2 }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={() => {
                    isDrawingRef.current = false;
                    drawingStartRef.current = null;
                    penPointsRef.current = [];
                  }}
                />
              </div>

              {/* Page Navigation */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <HistoryDialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <HistoryDialogContent className="max-w-2xl">
          <HistoryDialogHeader>
            <HistoryDialogTitle>Version History</HistoryDialogTitle>
            <HistoryDialogDescription>
              View and restore previous versions of annotations
            </HistoryDialogDescription>
          </HistoryDialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {versionHistoryManagerRef.current
              ?.getAllVersions()
              .map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted"
                >
                  <div>
                    <div className="font-medium">Version {version.versionNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(version.createdAt).toLocaleString()} by {version.createdBy}
                    </div>
                    {version.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {version.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {version.annotations.length} annotations
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const restored = versionHistoryManagerRef.current?.restoreVersion(
                        version.versionNumber
                      );
                      if (restored) {
                        setAnnotations(restored);
                        setShowHistoryDialog(false);
                        toast.success(`Restored version ${version.versionNumber}`);
                      }
                    }}
                  >
                    Restore
                  </Button>
                </div>
              )) || (
              <div className="text-center py-8 text-muted-foreground">
                No version history available
              </div>
            )}
          </div>
        </HistoryDialogContent>
      </HistoryDialog>
    </>
  );
}

