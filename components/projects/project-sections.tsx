"use client";

/**
 * Project Sections Component
 * HMR Cache Fix: Plus icon removed - cache cleared
 */

import { useMemo, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import { queryKeys } from "@/lib/query/keys";
import { useProjectSection as useProjectSectionHook } from "@/lib/hooks/use-api";
import type { PaginatedResponse } from "@/lib/api/pagination";
import { SectionTableCard } from "@/components/projects/section-table-card";
import { DrawingPdfDialog } from "@/components/projects/drawing-pdf-dialog";
import { InvoiceDetailsDialog } from "@/components/billing/invoice-details-dialog";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import PDF viewer to avoid SSR issues with pdf.js
// Using optimized lazy loading utility
import { LazyDrawingPdfViewerAdvanced } from "@/lib/utils/lazy-loading";
const DrawingPdfViewerAdvanced = LazyDrawingPdfViewerAdvanced;
import {
  changeOrderColumns,
  drawingsColumns,
  invoiceColumns,
  upcomingSubmissionColumns,
  rfiColumns,
  type ChangeOrderRow,
  type DrawingsRow,
  type InvoiceRow,
  type SubmissionRow,
  type RFIRow,
} from "@/components/projects/sections";
import { RFIQADialog } from "@/components/rfi/rfi-qa-dialog";
import { DrawingLogVersionHistorySheet } from "@/components/projects/drawing-log-version-history-sheet";

type SectionKey =
  | "drawings_yet_to_return"
  | "drawings_yet_to_release"
  | "drawing_log"
  | "invoice_history"
  | "upcoming_submissions"
  | "change_orders"
  | "rfi_submissions";

// Use centralized TanStack Query hook for project sections
function useProjectSection<T>(projectId: string, section: SectionKey, page = 1, pageSize = 20) {
  return useProjectSectionHook<T>(projectId, section, page, pageSize, {
    staleTime: 60_000, // 1 minute - TanStack Query handles caching
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: { errorMessage: "Failed to load section data." },
  });
}

function SectionTableCardSkeleton({ title }: { title: string }) {
  return (
    <div className="rounded-xl border bg-background">
      <div className="flex items-center justify-between gap-4 border-b p-4">
        <div className="font-medium">{title}</div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProjectSections({
  projectId,
  expandedCard: expandedCardProp,
  onToggleCard,
  insertMaterialListAfter,
  materialListComponent,
}: {
  projectId: string;
  expandedCard?: string | null;
  onToggleCard?: (cardTitle: string) => void;
  insertMaterialListAfter?: number;
  materialListComponent?: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  // Accordion state (internal fallback): track which card is expanded (null = all collapsed)
  const [expandedCardInternal, setExpandedCardInternal] = useState<string | null>(
    null
  );
  const expandedCard = expandedCardProp ?? expandedCardInternal;

  const [pdfDialog, setPdfDialog] = useState<{
    open: boolean;
    pdfUrl: string;
    title: string;
    description?: string;
    drawingId?: string;
    dwgNo?: string;
    sourceSection?: string; // Track which section opened the PDF
  }>({
    open: false,
    pdfUrl: "",
    title: "",
    drawingId: undefined,
    dwgNo: undefined,
    sourceSection: undefined,
  });

  // Toggle card expansion (accordion behavior: only one card open at a time)
  const handleCardToggle = useCallback(
    (cardTitle: string) => {
      if (onToggleCard) {
        onToggleCard(cardTitle);
        return;
      }
      setExpandedCardInternal((prev) => (prev === cardTitle ? null : cardTitle));
    },
    [onToggleCard]
  );

  // Unified handler for all PDF viewing - uses iframe-based desktop view (same as Drawing Log)
  // This ensures all tables use the same PDF viewer method
  const handleDrawingPdfRowClick = useCallback((row: any, sectionTitle?: string) => {
    const pdfPath = row.pdfPath || (row as any).pdf_path || (row as any).pdfUrl || (row as any).pdf_url;
    if (pdfPath) {
      let title = "PDF Document";
      let description = "";
      let drawingId: string | undefined;
      let dwgNo: string | undefined;

      // Handle DrawingsRow type
      if (row.dwgNo) {
        title = `Drawing ${row.dwgNo}${row.description ? ` - ${row.description}` : ""}`;
        description = `${row.status ? `Status: ${row.status}` : ""}${row.releaseStatus ? ` | Release Status: ${row.releaseStatus}` : ""}`;
        drawingId = row.id;
        dwgNo = row.dwgNo;
      }
      // Handle other row types
      else if (row.drawingNo) {
        title = `Drawing ${row.drawingNo}`;
        description = row.workDescription || row.description || "";
      }
      else if (row.changeOrderId) {
        title = `Change Order ${row.changeOrderId}`;
        description = row.description || "";
      }
      else if (row.rfiNo) {
        title = `RFI ${row.rfiNo}`;
        description = row.question || row.description || "";
      }
      else if (row.invoiceId || row.invoice_id) {
        title = `Billing ${row.invoiceId || row.invoice_id}`;
        description = row.projectName || row.project_name || "";
      }
      else {
        title = row.title || row.name || "PDF Document";
        description = row.description || "";
      }

      setPdfDialog({
        open: true,
        pdfUrl: pdfPath,
        title,
        description,
        drawingId,
        dwgNo,
        sourceSection: sectionTitle, // Track which section opened it
      });
    }
  }, []);

  const [invoiceDetailsDialog, setInvoiceDetailsDialog] = useState<{
    open: boolean;
    invoice: InvoiceRow | null;
  }>({
    open: false,
    invoice: null,
  });

  const [rfiDialog, setRfiDialog] = useState<{
    open: boolean;
    rfi: RFIRow | null;
  }>({
    open: false,
    rfi: null,
  });

  const [drawingHistorySheet, setDrawingHistorySheet] = useState<{
    open: boolean;
    drawingLogId: string;
    drawingDwgNo?: string;
  }>({
    open: false,
    drawingLogId: "",
    drawingDwgNo: undefined,
  });

  const drawingsYetToReturn = useProjectSection<DrawingsRow>(
    projectId,
    "drawings_yet_to_return"
  );
  const drawingsYetToRelease = useProjectSection<DrawingsRow>(
    projectId,
    "drawings_yet_to_release"
  );
  const drawingLog = useProjectSection<DrawingsRow>(projectId, "drawing_log");
  const invoiceHistory = useProjectSection<InvoiceRow>(projectId, "invoice_history");
  const upcomingSubmissions = useProjectSection<SubmissionRow>(
    projectId,
    "upcoming_submissions"
  );
  const changeOrders = useProjectSection<ChangeOrderRow>(projectId, "change_orders");
  const rfiSubmissions = useProjectSection<RFIRow>(projectId, "rfi_submissions");

  // Generic handler to open PDF for any row that has a pdfPath
  const handlePdfRowClick = useCallback((row: any) => {
    const pdfPath = row.pdfPath || (row as any).pdf_path || (row as any).pdfUrl || (row as any).pdf_url;
    if (pdfPath) {
      // Determine title and description based on row type
      let title = "PDF Document";
      let description = "";
      let drawingId: string | undefined;
      let dwgNo: string | undefined;

      // Handle DrawingsRow type
      if (row.dwgNo) {
        title = `Drawing ${row.dwgNo}${row.description ? ` - ${row.description}` : ""}`;
        description = `${row.status ? `Status: ${row.status}` : ""}${row.releaseStatus ? ` | Release Status: ${row.releaseStatus}` : ""}`;
        drawingId = row.id;
        dwgNo = row.dwgNo;
      }
      // Handle other row types
      else if (row.drawingNo) {
        title = `Drawing ${row.drawingNo}`;
        description = row.workDescription || row.description || "";
      }
      else if (row.changeOrderId) {
        // changeOrderId already includes "U2524 - CO #001" format
        title = `Change Order ${row.changeOrderId}`;
        description = row.description || "";
      }
      else if (row.rfiNo) {
        title = `RFI ${row.rfiNo}`;
        description = row.question || row.description || "";
      }
      else if (row.invoiceId || row.invoice_id) {
        title = `Billing ${row.invoiceId || row.invoice_id}`;
        description = row.projectName || row.project_name || "";
      }
      else {
        title = row.title || row.name || "PDF Document";
        description = row.description || "";
      }

      setPdfDialog({
        open: true,
        pdfUrl: pdfPath,
        title,
        description,
        drawingId,
        dwgNo,
      });
    }
  }, []);

  const handleViewInvoiceDetails = useCallback((row: InvoiceRow) => {
    setInvoiceDetailsDialog({
      open: true,
      invoice: row,
    });
  }, []);

  const handleViewRfi = useCallback((row: RFIRow) => {
    setRfiDialog({
      open: true,
      rfi: row,
    });
  }, []);

  const handleEditRfi = useCallback((row: RFIRow) => {
    setRfiDialog({
      open: true,
      rfi: row,
    });
  }, []);

  const handleRfiRowClick = useCallback((row: RFIRow) => {
    // Check if RFI has a PDF, otherwise show RFI dialog
    const pdfPath = row.pdfPath || (row as any).pdf_path || (row as any).pdfUrl || (row as any).pdf_url;
    if (pdfPath) {
      // Use the same PDF viewer method as Drawing Log (iframe-based desktop view)
      handleDrawingPdfRowClick(row, "RFI Submissions");
    } else {
      setRfiDialog({
        open: true,
        rfi: row,
      });
    }
  }, [handleDrawingPdfRowClick]);

  const handleViewDrawingHistory = useCallback((row: DrawingsRow) => {
    setDrawingHistorySheet({
      open: true,
      drawingLogId: row.id,
      drawingDwgNo: row.dwgNo,
    });
  }, []);



  const handleSaveAnnotations = useCallback(async (annotations: any[], pdfBlob: Blob) => {
    if (!pdfDialog.drawingId) return;

    try {
      const formData = new FormData();
      formData.append("annotations", JSON.stringify(annotations));
      formData.append("pdfBlob", pdfBlob, "drawing.pdf");
      formData.append("revisionNumber", "1");
      formData.append("revisionStatus", "REVISION");

      const response = await fetch(
        `/api/drawings/${encodeURIComponent(pdfDialog.drawingId)}/annotations`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save annotations");
      }

      // Invalidate queries to refresh drawing log
      queryClient.invalidateQueries({ queryKey: queryKeys.projectSection(projectId, "drawing_log") });
    } catch (error) {
      throw error;
    }
  }, [pdfDialog.drawingId, projectId, queryClient]);

  // Helper function to extract data from paginated or non-paginated responses
  const getData = useCallback((query: ReturnType<typeof useProjectSection<any>>) => {
    // Check if the response is paginated (has data.data structure)
    if (query.data && typeof query.data === 'object' && 'data' in query.data) {
      return (query.data as { data: any[] }).data;
    }
    // Fallback to direct array if not paginated
    return (query.data as any[] | undefined) ?? [];
  }, []);

  // Memoize cards configuration to prevent unnecessary re-renders
  // Ordered as: 1. Upcoming Submissions, 2. RFI, 3. Drawing Log, 4. Material list, 5. Change Orders, 6. Approved Drawing yet to release, 7. Drawings Yet to Approve (APP/R&R), 8. Invoice History
  const cards = useMemo(
    () => [
      {
        title: "Upcoming Submissions",
        query: upcomingSubmissions,
        columns: upcomingSubmissionColumns,
        exportFilename: "upcoming-submissions.csv",
        // Use the same PDF viewer method as Drawing Log (iframe-based desktop view)
        onRowClick: (row: any) => handleDrawingPdfRowClick(row, "Upcoming Submissions"),
      },
      {
        title: "RFI",
        query: rfiSubmissions,
        columns: rfiColumns,
        exportFilename: "rfi-submissions.csv",
        onRowClick: handleRfiRowClick,
        onViewDetails: handleViewRfi,
        onEdit: handleEditRfi,
        defaultColumnVisibility: { date: false }, // Hide date column by default
      },
      {
        title: "Drawing Log",
        query: drawingLog,
        columns: drawingsColumns,
        exportFilename: "drawing-log.csv",
        // Drawing Log PDF viewer - iframe-based desktop view
        onRowClick: (row: any) => handleDrawingPdfRowClick(row, "Drawing Log"),
        onViewHistory: handleViewDrawingHistory,
      },
      {
        title: "Change Orders",
        query: changeOrders,
        columns: changeOrderColumns,
        exportFilename: "change-orders.csv",
        // Use the same PDF viewer method as Drawing Log (iframe-based desktop view)
        onRowClick: (row: any) => handleDrawingPdfRowClick(row, "Change Orders"),
      },
      {
        title: "Drawings Yet to Approve (APP/R&R)",
        query: drawingsYetToReturn,
        columns: drawingsColumns,
        exportFilename: "drawings-yet-to-return.csv",
        // Use the same PDF viewer method as Drawing Log (iframe-based desktop view)
        onRowClick: (row: any) => handleDrawingPdfRowClick(row, "Drawings Yet to Approve (APP/R&R)"),
        onViewHistory: handleViewDrawingHistory,
      },
      {
        title: "Approved Drawing yet to release ",
        query: drawingsYetToRelease,
        columns: drawingsColumns,
        exportFilename: "drawings-yet-to-release.csv",
        // Use the same PDF viewer method as Drawing Log (iframe-based desktop view)
        onRowClick: (row: any) => handleDrawingPdfRowClick(row, "Approved Drawing yet to release "),
        onViewHistory: handleViewDrawingHistory,
      },
      {
        title: "Billing History",
        query: invoiceHistory,
        columns: invoiceColumns,
        exportFilename: "invoice-history.csv",
        onRowClick: (row: any) => {
          // Check if row has PDF path, otherwise show invoice details
          const pdfPath = row.pdfPath || (row as any).pdf_path || (row as any).pdfUrl || (row as any).pdf_url;
          if (pdfPath) {
            // Use the same PDF viewer method as Drawing Log (iframe-based desktop view)
            handleDrawingPdfRowClick(row, "Billing History");
          } else {
            handleViewInvoiceDetails(row);
          }
        },
        onViewDetails: handleViewInvoiceDetails, // Also keep for the View Details button
      },
    ],
    [
      drawingsYetToReturn.data,
      drawingsYetToRelease.data,
      drawingLog.data,
      invoiceHistory.data,
      upcomingSubmissions.data,
      changeOrders.data,
      rfiSubmissions.data,
      handleViewInvoiceDetails,
      handleViewRfi,
      handleEditRfi,
      handleRfiRowClick,
      handleDrawingPdfRowClick,
      handleViewDrawingHistory,
    ]
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        {cards.map((card, index) => (
          <div key={card.title} className="flex flex-col gap-6">
            <div
              className="animate-in fade-in slide-in-from-bottom-1 duration-300"
            >
              {card.query.isLoading ? (
                <SectionTableCardSkeleton title={card.title} />
              ) : (
                <div
                  className={`transition-opacity duration-200 ${card.query.isFetching ? "opacity-70" : "opacity-100"
                    }`}
                >
                  <SectionTableCard
                    title={card.title}
                    data={getData(card.query) as any}
                    columns={
                      typeof card.columns === 'function'
                        ? card.columns()
                        : (card.columns as any)
                    }
                    exportFilename={card.exportFilename}
                    onRowClick={(card as any).onRowClick}
                    onViewDetails={(card as any).onViewDetails}
                    onEdit={(card as any).onEdit}
                    onViewHistory={(card as any).onViewHistory}
                    enablePdfExport={card.title === "Drawing Log"}
                    headerAction={(card as any).headerAction}
                    defaultColumnVisibility={(card as any).defaultColumnVisibility}
                    isExpanded={expandedCard === "__all__" || expandedCard === card.title}
                    onToggle={() => handleCardToggle(card.title)}
                    projectId={projectId}
                  />
                </div>
              )}
            </div>
            {/* Insert Material List after Drawing Log (index 2) */}
            {insertMaterialListAfter !== undefined && index === insertMaterialListAfter && materialListComponent && (
              <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                {materialListComponent}
              </div>
            )}
          </div>
        ))}
      </div>

      <DrawingPdfViewerAdvanced
        open={pdfDialog.open}
        onOpenChange={(open) => setPdfDialog((prev) => ({ ...prev, open }))}
        pdfUrl={pdfDialog.pdfUrl}
        title={pdfDialog.title}
        description={pdfDialog.description}
        drawingId={pdfDialog.drawingId}
        dwgNo={pdfDialog.dwgNo}
        onSave={handleSaveAnnotations}
        userPermissions={{
          canEdit: true,
          canDelete: true,
          canCreateLayers: true,
          canManageRevisions: true,
          canDownload: true, // Allow downloads by default
          isViewOnly: false,
        }}
      />

      <InvoiceDetailsDialog
        open={invoiceDetailsDialog.open}
        onOpenChange={(open) =>
          setInvoiceDetailsDialog((prev) => ({ ...prev, open }))
        }
        invoice={invoiceDetailsDialog.invoice}
      />

      <RFIQADialog
        open={rfiDialog.open}
        onOpenChange={(open) =>
          setRfiDialog((prev) => ({ ...prev, open }))
        }
        rfi={rfiDialog.rfi ? {
          ...rfiDialog.rfi,
          // Add dummy answer if not present
          answer: rfiDialog.rfi.answer || "This is a sample answer for the RFI question. The response addresses the concerns raised and provides detailed information about the requested clarification. Additional technical details and specifications are included to ensure complete understanding of the solution.",
        } : null}
      />

      <DrawingLogVersionHistorySheet
        open={drawingHistorySheet.open}
        onOpenChange={(open) =>
          setDrawingHistorySheet((prev) => ({ ...prev, open }))
        }
        drawingLogId={drawingHistorySheet.drawingLogId}
        drawingDwgNo={drawingHistorySheet.drawingDwgNo}
      />
    </>
  );
}


