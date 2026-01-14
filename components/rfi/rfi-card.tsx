"use client";

import { useMemo, useCallback, memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitleWithDropdown } from "@/components/ui/card-title-with-dropdown";
import { Eye, Filter, RefreshCw, Download } from "lucide-react";
import { useRFIList } from "@/lib/hooks/use-api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { RFIRow } from "./rfi-columns";

function RfiCardInner() {
  const queryClient = useQueryClient();

  // Use centralized RFI hook - fetch all for stats (large pageSize for dashboard)
  const { data: rfiData, isLoading, refetch } = useRFIList({
    page: 1,
    pageSize: 1000, // Get all for stats calculation
    staleTime: 60_000, // 1 minute - TanStack Query handles caching automatically
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: { errorMessage: "Failed to load RFI data." },
  });

  const rfis = useMemo(() => rfiData?.data ?? [], [rfiData?.data]);
  const total = rfis.length;

  // Memoize status count calculations for performance
  const { openCount, answeredCount, closedCount } = useMemo(() => {
    const open = rfis.filter((rfi) => {
      const status = (rfi.status || "").toLowerCase();
      return status.includes("open") || status.includes("pending") || status.includes("in progress");
    }).length;

    const answered = rfis.filter((rfi) => {
      const status = (rfi.status || "").toLowerCase();
      return status.includes("answered") || status.includes("review") || status.includes("approved");
    }).length;

    const closed = rfis.filter((rfi) => {
      const status = (rfi.status || "").toLowerCase();
      return status.includes("closed") || status.includes("completed");
    }).length;

    return { openCount: open, answeredCount: answered, closedCount: closed };
  }, [rfis]);

  // Memoize refresh handler
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.rfi() });
    refetch();
  }, [queryClient, refetch]);

  // Memoize metrics array
  const metrics = useMemo(() => [
    {
      label: "Total RFIs",
      value: isLoading ? "—" : total.toString(),
      unit: "",
    },
    {
      label: "Open",
      value: isLoading ? "—" : openCount.toString(),
      unit: "",
      labelColor: "text-amber-700 dark:text-amber-400",
    },
    {
      label: "Answered",
      value: isLoading ? "—" : answeredCount.toString(),
      unit: "",
      labelColor: "text-blue-700 dark:text-blue-400",
    },
    {
      label: "Closed",
      value: isLoading ? "—" : closedCount.toString(),
      unit: "",
      labelColor: "text-emerald-700 dark:text-emerald-400",
    },
  ], [isLoading, total, openCount, answeredCount, closedCount]);

  return (
    <Card className="w-full shadow-lg overflow-hidden">
      <CardHeader className="border-b shrink-0 bg-emerald-50/70 p-6">
        <CardTitleWithDropdown
          className="text-lg font-semibold text-emerald-900"
          menuItems={[
            {
              label: "View All RFIs",
              icon: Eye,
              onClick: () => {
                window.location.href = "/rfi";
              },
            },
            {
              label: "Filter RFIs",
              icon: Filter,
              onClick: () => {
                // Filter action
              },
            },
            { separator: true },
            {
              label: "Refresh Data",
              icon: RefreshCw,
              onClick: handleRefresh,
            },
            {
              label: "Export RFIs",
              icon: Download,
              onClick: () => {
                // Export action
              },
            },
          ]}
          triggerBadge={total > 0 ? total : undefined}
        >
          RFI Management
        </CardTitleWithDropdown>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="flex flex-col p-4 rounded-lg border bg-background/50 backdrop-blur-sm"
            >
              <div
                className={`text-sm mb-2 font-medium ${
                  metric.labelColor || "text-muted-foreground"
                }`}
              >
                {metric.label}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{metric.value}</span>
                {metric.unit && (
                  <span className="text-sm text-muted-foreground">
                    {metric.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Memoized component to prevent unnecessary re-renders
export const RfiCard = memo(RfiCardInner);
RfiCard.displayName = "RfiCard";

