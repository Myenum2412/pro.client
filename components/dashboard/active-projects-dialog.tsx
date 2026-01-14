"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { demoProjects } from "@/public/assets";
import { cn } from "@/lib/utils";

type ActiveProjectsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function getStatusVariant(status: string | null | undefined): "default" | "secondary" | "destructive" | "outline" {
  if (!status) return "outline";
  const normalized = status.toLowerCase();
  if (normalized.includes("completed")) {
    return "default"; // Green/success color
  }
  if (normalized.includes("released completely")) {
    return "default"; // Green color for released completely
  }
  if (normalized.includes("in progress") || normalized.includes("partially")) {
    return "secondary"; // Blue/in-progress color
  }
  if (normalized.includes("pending") || normalized.includes("not released")) {
    return "outline"; // Gray/pending color
  }
  return "outline";
}

export function ActiveProjectsDialog({ open, onOpenChange }: ActiveProjectsDialogProps) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  // Calculate pagination
  const total = demoProjects.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProjects = demoProjects.slice(startIndex, endIndex);

  // Reset to page 1 if current page is out of bounds
  React.useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(1);
    }
  }, [totalPages, page]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-xl w-full min-w-[95vw] max-h-[90vh] h-auto p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 w-full border-b">
          <DialogTitle>Active Projects</DialogTitle>
          <DialogDescription>
            List of all ongoing projects and their current status
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 px-6 py-4 min-h-0 flex flex-col gap-4">
          <div className="flex-1 overflow-auto min-h-0">
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50/70 hover:bg-emerald-50/70">
                    <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">Job Number</TableHead>
                    <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">Project Name</TableHead>
                    <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">Contractor</TableHead>
                    <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">Location</TableHead>
                    <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">Estimated Tons</TableHead>
                    <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">Detailing Status</TableHead>
                    <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">Revision Status</TableHead>
                    <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">Release Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProjects.map((project, index) => (
                    <TableRow key={index} className="hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="px-4 py-4 text-center font-medium">{project.jobNumber}</TableCell>
                      <TableCell className="px-4 py-4 text-center max-w-xs truncate" title={project.name}>
                        {project.name}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center">{project.contractorName ?? "—"}</TableCell>
                      <TableCell className="px-4 py-4 text-center">{project.location ?? "—"}</TableCell>
                      <TableCell className="px-4 py-4 text-center">{project.estimatedTons?.toFixed(1) ?? "—"}</TableCell>
                      <TableCell className="px-4 py-4 text-center">
                        <Badge variant={getStatusVariant(project.detailingStatus)}>
                          {project.detailingStatus ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center">
                        <Badge variant={getStatusVariant(project.revisionStatus)}>
                          {project.revisionStatus ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center">
                        <Badge variant={getStatusVariant(project.releaseStatus)}>
                          {project.releaseStatus ?? "—"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="shrink-0 border-t pt-4">
            <PaginationControls
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1); // Reset to first page when changing page size
              }}
              pageSizeOptions={[20, 40, 60, 80, 100, 200, 400, 500]}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

