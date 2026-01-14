"use client";

import { Building2, MapPin, FolderOpen } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function PercentPill({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center rounded-lg bg-emerald-200 px-2.5 py-1 text-sm font-semibold text-emerald-900">
      {value}
    </span>
  );
}

function StatusPill({
  label,
  variant = "success",
}: {
  label: string;
  variant?: "success" | "neutral";
}) {
  const normalizedLabel = label.toLowerCase();
  
  // Check if it's "RELEASED COMPLETELY" and use green color
  if (normalizedLabel.includes("released completely")) {
    return (
      <Badge className="bg-emerald-600 text-white border-transparent px-4 py-1">
        {label}
      </Badge>
    );
  }
  
  if (variant === "success") {
    return (
      <Badge className="bg-emerald-600 text-white border-transparent px-4 py-1">
        {label}
      </Badge>
    );
  }
  return (
    <Badge className="bg-slate-600 text-white border-transparent px-4 py-1">
      {label}
    </Badge>
  );
}

export type ProjectOverviewData = {
  projectName: string;
  jobNumber: string;
  fabricatorName?: string | null;
  contractorName?: string | null;
  projectLocation?: string | null;
  estimatedTons?: number | null;
  approvalTons?: number | null;
  latestRevTons?: number | null;
  releasedTons?: number | null;
  detailingStatus?: string | null;
  revisionStatus?: string | null;
  releaseStatus?: string | null;
};

export function ProjectOverview({ data }: { data: ProjectOverviewData }) {
  const estimated = data.estimatedTons ?? null;
  const approval = data.approvalTons ?? null;
  const latest = data.latestRevTons ?? null;
  const released = data.releasedTons ?? null;

  const pct = (numerator: number | null, denom: number | null) => {
    if (!numerator || !denom || denom === 0) return null;
    return Math.round((numerator / denom) * 100);
  };

  const approvalPct = pct(approval, estimated);
  const releasedPct = pct(released, estimated);

  // Calculate Yet to Release Tons
  // Formula: Estimated Tons - Detailed Tons Per Approval dwgs
  let yetToReleaseTons: number | null = null;
  
  if (estimated != null && approval != null) {
    yetToReleaseTons = Math.max(0, estimated - approval); // Ensure non-negative
  }

  return (
    <Card className="overflow-hidden border-none">
      <CardContent >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-lg font-semibold break-words" title={data.projectName}>
              {data.projectName}
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <Link href={`/client/files/${encodeURIComponent(data.jobNumber)}`}>
              <FolderOpen className="h-4 w-4 mr-2" />
              Access Files
            </Link>
          </Button>
        </div>

        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-sm text-muted-foreground">Job Number</div>
            <div className="mt-1 text-base font-semibold">{data.jobNumber}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Fabricator Name</div>
            <div className="mt-1 text-base font-semibold">
              {data.fabricatorName ?? "—"}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Contractor Name</div>
            <div className="mt-1 flex items-center gap-2 text-base font-semibold">
              <Building2 className="size-4 text-muted-foreground" />
              {data.contractorName ?? "—"}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Project Location</div>
            <div className="mt-1 flex items-center gap-2 text-base font-semibold">
              <MapPin className="size-4 text-muted-foreground" />
              {data.projectLocation ?? "—"}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Estimated Tons</div>
            <div className="mt-1 text-base font-semibold">
              {estimated == null ? "—" : estimated.toFixed(1)}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">
              Detailed Tons per Approval dwgs
            </div>
            <div className="mt-1 flex items-center gap-3 text-base font-semibold">
              {approval == null ? "—" : approval.toFixed(2)}{" "}
              {approvalPct == null ? null : <PercentPill value={`${approvalPct}%`} />}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">
              Detailed Tons per latest Rev/FFU
            </div>
            <div className="mt-1 text-base font-semibold">
              {latest == null ? "—" : latest.toFixed(2)}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">
              Released Tons (so far)
            </div>
            <div className="mt-1 flex items-center gap-3 text-base font-semibold">
              {released == null ? "—" : released.toFixed(2)}{" "}
              {releasedPct == null ? null : <PercentPill value={`${releasedPct}%`} />}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Yet to Release Tons</div>
            <div className="mt-1 text-base font-semibold">
              {yetToReleaseTons != null ? yetToReleaseTons.toFixed(2) : "—"}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Detailing Status</div>
            <div className="mt-2">
              <StatusPill label={data.detailingStatus ?? "—"} variant="success" />
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Revision Status</div>
            <div className="mt-2">
              <StatusPill label={data.revisionStatus ?? "—"} variant="success" />
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Release Status</div>
            <div className="mt-2">
              <StatusPill label={data.releaseStatus ?? "—"} variant="neutral" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


