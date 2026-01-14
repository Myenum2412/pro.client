"use client";

import * as React from "react";
import { useProjectMaterialLists } from "@/lib/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MaterialListManagementCard,
  type MaterialListBlock,
} from "@/components/projects/project-table-card";

export function ProjectMaterialListManagement({
  projectId,
  isExpanded = true,
  onToggle,
}: {
  projectId: string;
  /** Controlled expansion state (defaults to expanded to preserve existing behavior) */
  isExpanded?: boolean;
  /** Toggle handler for accordion behavior */
  onToggle?: () => void;
}) {
  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY - NO EARLY RETURNS BEFORE HOOKS
  // Use centralized TanStack Query hook for material lists
  // Use a valid projectId or empty string to ensure hook is always called
  const validProjectId = projectId && projectId.trim() !== "" ? projectId : "";
  const { data, isLoading, error } = useProjectMaterialLists<MaterialListBlock>(validProjectId, {
    staleTime: 60_000, // 1 minute - TanStack Query handles caching
    gcTime: 10 * 60_000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: { errorMessage: "Failed to load material lists." },
  });

  // Memoize blocks and title for performance - MUST be called before any early returns
  const blocks = React.useMemo(() => data?.blocks ?? [], [data?.blocks]);
  const title = React.useMemo(() => data?.title || "Material List Management", [data?.title]);
  
  // Calculate derived values (not hooks, but must be after hooks)
  const hasBlocks = blocks && blocks.length > 0;

  // Guard: Don't render if projectId is invalid (AFTER all hooks)
  if (!projectId || projectId.trim() === "") {
    return null;
  }

  // Now we can do conditional rendering
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-background">
        <div className="border-b p-4">
          <Skeleton className="h-6 w-56" />
        </div>
        <div className="p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }
  
  // Always render Material List section, even if empty
  // This ensures it appears in the project page order
  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
      <MaterialListManagementCard
        title={title}
        blocks={blocks}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
    </div>
  );
}


