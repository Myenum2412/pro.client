"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SectionTableCard } from "@/components/projects/section-table-card";
import { rfiColumns, type RFIRow } from "./rfi-columns";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useRFIList } from "@/lib/hooks/use-api";
import { queryKeys } from "@/lib/query/keys";
import { RFIQADialog } from "./rfi-qa-dialog";

function RFITableInner() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedRfi, setSelectedRfi] = useState<RFIRow | null>(null);
  const [isQADialogOpen, setIsQADialogOpen] = useState(false);

  // Use centralized RFI hook with optimized caching
  const { data: rfiData, isLoading, error } = useRFIList({
    page,
    pageSize,
    staleTime: 60_000, // 1 minute - TanStack Query handles caching automatically
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: { errorMessage: "Failed to load RFI data." },
  });

  // Invalidate cache on custom events (if needed for RFI updates)
  // TanStack Query will automatically refetch when queries are invalidated
  const handleInvalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.rfi() });
  }, [queryClient]);

  const rfis = useMemo(() => rfiData?.data ?? [], [rfiData?.data]);
  const pagination = rfiData?.pagination;

  const handleRowClick = useCallback((rfi: RFIRow) => {
    setSelectedRfi(rfi);
    setIsQADialogOpen(true);
  }, []);

  const handleDialogClose = useCallback((open: boolean) => {
    setIsQADialogOpen(open);
    if (!open) {
      setSelectedRfi(null);
      // Invalidate RFI cache when dialog closes to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.rfi() });
    }
  }, [queryClient]);

  return (
    <>
      <SectionTableCard
        title="RFI Submissions"
        data={rfis}
        columns={rfiColumns}
        exportFilename="rfi-submissions.csv"
        search={{ columnId: "rfiNo", placeholder: "Search RFI..." }}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        pagination={
          pagination ? (
            <PaginationControls
              page={pagination.page}
              pageSize={pagination.pageSize}
              total={pagination.total}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
            />
          ) : undefined
        }
      />
      <RFIQADialog
        open={isQADialogOpen}
        onOpenChange={handleDialogClose}
        rfi={selectedRfi}
      />
    </>
  );
}

// Memoized component to prevent unnecessary re-renders
export const RFITable = memo(RFITableInner);
RFITable.displayName = "RFITable";

