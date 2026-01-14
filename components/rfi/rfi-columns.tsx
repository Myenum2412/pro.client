"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate as formatStandardDate } from "@/lib/utils/date-format";

export type RFIRow = {
  id: string;
  rfiNo: string;
  projectName: string;
  jobNo: string;
  client: string;
  impactedElement: string;
  drawingReference: string;
  date: string;
  status: string;
  // Additional fields for actions
  projectId?: string;
  proRfiNo?: string;
  placingDrawingReference?: string;
  contractDrawingReference?: string;
  question?: string;
  answer?: string;
  pdfPath?: string;
};

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  try {
    return formatStandardDate(dateString) || "—";
  } catch {
    return "—";
  }
}

function statusBadge(status: string) {
  const normalized = status.toLowerCase();
  
  if (normalized.includes("approved") || normalized.includes("closed")) {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-transparent">
        {status}
      </Badge>
    );
  }
  if (normalized.includes("pending") || normalized.includes("open")) {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-transparent">
        {status}
      </Badge>
    );
  }
  if (normalized.includes("reject") || normalized.includes("cancelled")) {
    return (
      <Badge className="bg-red-100 text-red-700 border-transparent">
        {status}
      </Badge>
    );
  }
  if (normalized.includes("review") || normalized.includes("in progress")) {
    return (
      <Badge className="bg-blue-100 text-blue-700 border-transparent">
        {status}
      </Badge>
    );
  }
  return (
    <Badge className="bg-zinc-100 text-zinc-700 border-transparent">
      {status}
    </Badge>
  );
}

export const rfiColumns: ColumnDef<RFIRow>[] = [
  {
    accessorKey: "rfiNo",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="mx-auto"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        RFI No
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-semibold text-emerald-700">
        {row.getValue("rfiNo")}
      </div>
    ),
    meta: { align: "center" },
    enableHiding: false, // Always visible
  },
  {
    accessorKey: "impactedElement",
    header: "Impacted Element",
    cell: ({ row }) => (
      <div className="max-w-md truncate" title={row.getValue("impactedElement")}>
        {row.getValue("impactedElement") || "—"}
      </div>
    ),
    meta: { align: "center" },
    enableHiding: false, // Always visible
  },
  {
    accessorKey: "drawingReference",
    header: "Drawing Reference",
    cell: ({ row }) => {
      const drawingRef = row.getValue("drawingReference") as string;
      return (
        <div className="font-medium flex items-center justify-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-xs truncate" title={drawingRef}>
            {drawingRef || "—"}
          </span>
        </div>
      );
    },
    meta: { align: "center" },
    enableHiding: false, // Always visible
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="mx-auto"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        {formatDate(row.getValue("date"))}
      </div>
    ),
    meta: { align: "center" },
    // Date column can be hidden (not in the required list)
  },
];

