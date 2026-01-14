"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { ProjectsListItem } from "@/app/api/projects/route";
import { FileText, Building2, Hash, Calendar, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

function getStatusVariant(status: string | null | undefined): "default" | "secondary" | "destructive" | "outline" {
  if (!status) return "outline";
  const upperStatus = status.toUpperCase();
  if (upperStatus.includes("COMPLETED") || upperStatus.includes("RELEASED")) {
    return "default";
  }
  if (upperStatus.includes("CANCELLED") || upperStatus.includes("REJECTED")) {
    return "destructive";
  }
  return "outline";
}

function getStatusColor(status: string | null | undefined): string {
  if (!status) return "";
  const upperStatus = status.toUpperCase();
  if (upperStatus.includes("COMPLETED")) {
    return "bg-emerald-600 text-white border-emerald-600";
  }
  if (upperStatus.includes("RELEASED COMPLETELY")) {
    return "bg-emerald-600 text-white border-emerald-600";
  }
  if (upperStatus.includes("RELEASED")) {
    return "bg-blue-600 text-white border-blue-600";
  }
  if (upperStatus.includes("CANCELLED") || upperStatus.includes("REJECTED")) {
    return "bg-red-600 text-white border-red-600";
  }
  return "";
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

export function AllocatedProjectsTable() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [isExpanded, setIsExpanded] = React.useState(true);

  const { data: projects = [], isLoading, refetch } = useQuery({
    queryKey: queryKeys.projects(),
    queryFn: () => fetchJson<ProjectsListItem[]>("/api/projects"),
    staleTime: 30_000,
  });

  // Sort by detailing status (IN PROCESS first), then by project number
  const sortedProjects = React.useMemo(() => {
    return [...projects].sort((a, b) => {
      // Get detailing status (normalize to uppercase for comparison)
      const statusA = (a.detailingStatus || "IN PROCESS").toUpperCase();
      const statusB = (b.detailingStatus || "IN PROCESS").toUpperCase();
      
      // Check if status is "IN PROCESS"
      const isInProcessA = statusA.includes("IN PROCESS") || statusA === "IN PROCESS";
      const isInProcessB = statusB.includes("IN PROCESS") || statusB === "IN PROCESS";
      
      // If one is IN PROCESS and the other isn't, IN PROCESS comes first
      if (isInProcessA && !isInProcessB) {
        return -1; // a comes before b
      }
      if (!isInProcessA && isInProcessB) {
        return 1; // b comes before a
      }
      
      // If both have the same IN PROCESS status, sort by job number
      return a.jobNumber.localeCompare(b.jobNumber);
    });
  }, [projects]);

  // Calculate pagination
  const total = sortedProjects.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProjects = sortedProjects.slice(startIndex, endIndex);

  // Reset to page 1 if current page is out of bounds
  React.useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(1);
    }
  }, [totalPages, page]);

  // Handle row click to navigate to project details
  const handleRowClick = (projectId: string) => {
    // Use query parameter to match projects page routing
    router.push(`/client/projects?project=${projectId}`);
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg overflow-hidden">
        <CardHeader className="border-b shrink-0 bg-emerald-50/70 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold text-emerald-900">
                  Recently Allocated Projects
                </CardTitle>
                {total > 0 && (
                  <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                    {total}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Projects allocated through the allocation form
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg overflow-hidden">
      <CardHeader className="border-b shrink-0 bg-emerald-50/70 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold text-emerald-900">
                Recently Allocated Projects
              </CardTitle>
              {total > 0 && (
                <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                  {total}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Projects allocated through the allocation form
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-emerald-100 rounded-md transition-colors shrink-0"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <ChevronDown 
              className={`h-5 w-5 text-emerald-900 transition-transform duration-300 ${
                isExpanded ? "rotate-0" : "-rotate-90"
              }`}
            />
          </button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="overflow-hidden animate-in slide-in-from-top-2 fade-in duration-300">
        {sortedProjects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
              <FileText className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-base font-medium mb-1">No projects allocated yet</p>
            <p className="text-sm">Use the "Allocate Project" button to create one</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border bg-background/50 backdrop-blur-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50/70 hover:bg-emerald-50/70">
                    <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <Hash className="h-4 w-4" />
                        Project Number
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Project Name
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">
                      Detailing Status
                    </TableHead>
                    <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">
                      Revision Status
                    </TableHead>
                    <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">
                      Release Status
                    </TableHead>
                    <TableHead className="px-4 py-4 text-center text-emerald-900 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProjects.map((project, index) => (
                    <TableRow
                      key={project.id}
                      className="hover:bg-emerald-50/30 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(project.id)}
                    >
                      <TableCell className="px-4 py-4 text-center font-semibold text-emerald-900">
                        {project.jobNumber}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center max-w-xs">
                        <div
                          className="truncate font-medium"
                          title={project.name}
                        >
                          {project.name}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center">
                        <Badge
                          variant={getStatusVariant(project.detailingStatus)}
                          className={getStatusColor(project.detailingStatus)}
                        >
                          {project.detailingStatus || "IN PROCESS"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center">
                        <Badge
                          variant={getStatusVariant(project.revisionStatus)}
                          className={getStatusColor(project.revisionStatus)}
                        >
                          {project.revisionStatus || "IN PROCESS"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center">
                        <Badge
                          variant={getStatusVariant(project.releaseStatus)}
                          className={getStatusColor(project.releaseStatus)}
                        >
                          {project.releaseStatus || "IN PROCESS"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center text-sm">
                        {formatDate(project.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4">
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
                itemLabel="projects"
              />
            </div>
          </>
        )}
        </CardContent>
      )}
    </Card>
  );
}

