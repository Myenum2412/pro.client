"use client";

/**
 * Project Details Comprehensive Component
 * HMR Cache Fix: Activity icon removed - cache cleared
 * Version: 2.0.0
 */
import { useQuery } from "@tanstack/react-query";
import { useProject } from "@/lib/hooks/use-api";
import { queryKeys } from "@/lib/query/keys";
import type { ProjectDetails } from "@/lib/api/services";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";


function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b shrink-0 bg-emerald-50/70 p-6">
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusPill({ label }: { label: string }) {
  const normalized = label.toLowerCase();
  if (normalized.includes("released completely")) {
    return (
      <Badge className="bg-emerald-600 text-white border-transparent">
        {label}
      </Badge>
    );
  }
  if (normalized.includes("completed")) {
    return (
      <Badge className="bg-emerald-600 text-white border-transparent">
        {label}
      </Badge>
    );
  }
  return (
    <Badge variant="outline">
      {label}
    </Badge>
  );
}

export function ProjectDetailsComprehensive({ projectId }: { projectId: string }) {
  // Use centralized TanStack Query hook for project details
  const { data, isLoading, error } = useProject(projectId, {
    staleTime: 30_000, // 30 seconds - TanStack Query handles caching
    gcTime: 10 * 60_000, // 10 minutes
    refetchInterval: 60_000, // Refetch every minute
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: { errorMessage: "Failed to load project details." },
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !data) {
    return null;
  }

  // Safely extract project data - ProjectDetails extends Project directly
  if (!data) {
    return null;
  }

  // Calculate percentages
  const approvalPct = data.estimatedTons && data.detailedTonsPerApproval
    ? Math.round((data.detailedTonsPerApproval / data.estimatedTons) * 100)
    : null;
  
  const releasedPct = data.estimatedTons && data.releasedTons
    ? Math.round((data.releasedTons / data.estimatedTons) * 100)
    : null;

  // Calculate Yet to Release Tons
  // Formula: Estimated Tons - Detailed Tons Per Approval dwgs
  let yetToReleaseTons: number | null = null;
  
  if (data.estimatedTons != null && data.detailedTonsPerApproval != null) {
    yetToReleaseTons = Math.max(0, data.estimatedTons - data.detailedTonsPerApproval); // Ensure non-negative
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b shrink-0 bg-emerald-50/70 p-6">
          <CardTitle className="text-lg font-semibold text-emerald-900">{data.projectName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Job Number */}
            <div>
              <div className="text-sm text-muted-foreground mb-1">Job Number</div>
              <div className="text-base font-medium">{data.projectNumber}</div>
            </div>

            {/* Fabricator Name */}
            <div>
              <div className="text-sm text-muted-foreground mb-1">Fabricator Name</div>
              <div className="text-base font-medium">{data.fabricatorName || "—"}</div>
            </div>

            {/* Contractor Name */}
            <div>
              <div className="text-sm text-muted-foreground mb-1">Contractor Name</div>
              <div className="text-base font-medium">{data.contractorName || "—"}</div>
            </div>

            {/* Project Location */}
            <div>
              <div className="text-sm text-muted-foreground mb-1">Project Location</div>
              <div className="text-base font-medium">{data.projectLocation || "—"}</div>
            </div>

            {/* Estimated Tons */}
            <div>
              <div className="text-sm text-muted-foreground mb-1">Estimated Tons</div>
              <div className="text-base font-medium">
                {data.estimatedTons != null ? data.estimatedTons.toFixed(1) : "—"}
              </div>
            </div>

            {/* Detailed Tons per Approval dwgs */}
            <div>
              <div className="text-sm text-muted-foreground mb-1">Detailed Tons per Approval dwgs</div>
              <div className="text-base font-medium flex items-center gap-2">
                {data.detailedTonsPerApproval != null ? data.detailedTonsPerApproval.toFixed(2) : "—"}
                {approvalPct != null && (
                  <Badge variant="outline" className="text-xs">
                    {approvalPct}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Detailed Tons per latest Rev/FFU */}
            <div>
              <div className="text-sm text-muted-foreground mb-1">Detailed Tons per latest Rev/FFU</div>
              <div className="text-base font-medium">
                {data.detailedTonsPerLatestRev != null ? data.detailedTonsPerLatestRev.toFixed(2) : "—"}
              </div>
            </div>

            {/* Released Tons (so far) */}
            <div>
              <div className="text-sm text-muted-foreground mb-1">Released Tons (so far)</div>
              <div className="text-base font-medium flex items-center gap-2">
                {data.releasedTons != null ? data.releasedTons.toFixed(2) : "—"}
                {releasedPct != null && (
                  <Badge variant="outline" className="text-xs">
                    {releasedPct}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Yet to Release Tons */}
            <div>
              <div className="text-sm text-muted-foreground mb-1">Yet to Release Tons</div>
              <div className="text-base font-medium">
                {yetToReleaseTons != null ? yetToReleaseTons.toFixed(2) : "—"}
              </div>
            </div>

            {/* Detailing Status */}
            <div>
              <div className="text-sm text-muted-foreground mb-1">Detailing Status</div>
              <div className="mt-1">
                <StatusPill label={data.detailingStatus || "—"} />
              </div>
            </div>

            {/* Revision Status */}
            <div>
              <div className="text-sm text-muted-foreground mb-1">Revision Status</div>
              <div className="mt-1">
                <StatusPill label={data.revisionStatus || "—"} />
              </div>
            </div>

            {/* Release Status */}
            <div>
              <div className="text-sm text-muted-foreground mb-1">Release Status</div>
              <div className="mt-1">
                <StatusPill label={data.releaseStatus || "—"} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

