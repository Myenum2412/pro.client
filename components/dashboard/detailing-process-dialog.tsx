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
import { FileText } from "lucide-react";
import { format } from "date-fns";
import type { ProjectsListItem } from "@/app/api/projects/route";

type DetailingProcessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: ProjectsListItem[];
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
  if (normalized.includes("in process") || normalized.includes("partially")) {
    return "secondary"; // Blue/in-progress color
  }
  if (normalized.includes("pending") || normalized.includes("not released")) {
    return "outline"; // Gray/pending color
  }
  return "outline";
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy");
  } catch {
    return "—";
  }
}

export function DetailingProcessDialog({
  open,
  onOpenChange,
  projects,
}: DetailingProcessDialogProps) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  // Component state

  const detailingProjects = React.useMemo(() => {
    return projects.filter((p) => p.detailingStatus === "IN PROCESS");
  }, [projects]);

  // Calculate pagination
  const total = detailingProjects.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProjects = detailingProjects.slice(startIndex, endIndex);

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
          <DialogTitle>Detailing Process Details</DialogTitle>
          <DialogDescription>
            List of all projects currently in detailing process
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 px-6 py-4 min-h-0 flex flex-col gap-4">
          {detailingProjects.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No projects in detailing process</p>
                <p className="text-sm mt-2">
                  All projects have completed detailing or are pending start
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto min-h-0">
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50/70 hover:bg-emerald-50/70">
                        <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">Job Number</TableHead>
                        <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">Project Name</TableHead>
                        <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">Estimated Tons</TableHead>
                        <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">Detailing Status</TableHead>
                        <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">Revision Status</TableHead>
                        <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">Release Status</TableHead>
                        <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProjects.map((project) => (
                        <TableRow key={project.id} className="hover:bg-emerald-50/30 transition-colors">
                          <TableCell className="px-4 py-4 text-center font-medium">{project.jobNumber}</TableCell>
                          <TableCell className="px-4 py-4 text-center max-w-xs truncate" title={project.name}>
                            {project.name}
                          </TableCell>
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
                          <TableCell className="px-4 py-4 text-center">{formatDate(project.dueDate)}</TableCell>
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

