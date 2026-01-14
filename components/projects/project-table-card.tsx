"use client";

import { useState, useMemo } from "react";
import { CheckCircle2, Eye, Search, ChevronDown } from "lucide-react";
import { PaginationControls } from "@/components/ui/pagination-controls";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type MaterialListBarListRow = {
  id?: string;
  dwgNo: string;
  releaseDescription: string;
  ctrlCode: string;
  relNo: string | number;
  weightLbs: string | number;
  date: string;
  varyingBars: string;
  remarks: string;
  rowElement?: string;
  barGrade?: string;
};

export type MaterialListField = { id?: string; label: string; value: string };

export type MaterialListBlock = {
  id?: string;
  heading: string;
  status: "released" | "under_review" | string;
  priority: "High" | "Medium" | string;
  note?: string;
  barList: MaterialListBarListRow[];
  additionalFields: MaterialListField[];
};

export function MaterialListManagementCard({
  title = "Material List Management",
  blocks,
  isExpanded: isExpandedProp,
  onToggle,
}: {
  title?: string;
  blocks: MaterialListBlock[];
  /** Controlled expansion state (optional) */
  isExpanded?: boolean;
  /** Toggle handler (optional) */
  onToggle?: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpandedInternal, setIsExpandedInternal] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const isExpanded = isExpandedProp ?? isExpandedInternal;

  const handleToggle = () => {
    if (onToggle) return onToggle();
    setIsExpandedInternal((prev) => !prev);
  };

  // Filter blocks based on search query
  const allFilteredBlocks = useMemo(() => {
    if (!searchQuery.trim() || !blocks || blocks.length === 0) {
      return blocks;
    }

    try {
      const query = searchQuery.toLowerCase();
      return blocks.filter((block) => {
        if (!block) return false;
        
        try {
          // Search in heading
          if (block.heading?.toLowerCase().includes(query)) return true;
          
          // Search in status
          if (block.status?.toLowerCase().includes(query)) return true;
          
          // Search in priority
          if (block.priority?.toLowerCase().includes(query)) return true;
          
          // Search in note
          if (block.note?.toLowerCase().includes(query)) return true;
          
          // Search in bar list items
          if (block.barList && Array.isArray(block.barList)) {
            const hasMatchingBarItem = block.barList.some((row) => {
              if (!row) return false;
              try {
                return (
                  row.dwgNo?.toLowerCase().includes(query) ||
                  row.releaseDescription?.toLowerCase().includes(query) ||
                  row.ctrlCode?.toLowerCase().includes(query) ||
                  String(row.relNo || "").toLowerCase().includes(query) ||
                  String(row.weightLbs || "").toLowerCase().includes(query) ||
                  row.date?.toLowerCase().includes(query) ||
                  row.varyingBars?.toLowerCase().includes(query) ||
                  row.remarks?.toLowerCase().includes(query) ||
                  row.rowElement?.toLowerCase().includes(query) ||
                  row.barGrade?.toLowerCase().includes(query)
                );
              } catch {
                return false;
              }
            });
            
            if (hasMatchingBarItem) return true;
          }
          
          // Search in additional fields
          if (block.additionalFields && Array.isArray(block.additionalFields)) {
            const hasMatchingField = block.additionalFields.some((field) => {
              if (!field) return false;
              try {
                return (
                  field.label?.toLowerCase().includes(query) ||
                  field.value?.toLowerCase().includes(query)
                );
              } catch {
                return false;
              }
            });
            
            if (hasMatchingField) return true;
          }
          
          return false;
        } catch {
          return false;
        }
      });
    } catch {
      return blocks;
    }
  }, [blocks, searchQuery]);

  // Apply pagination to filtered blocks
  const filteredBlocks = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allFilteredBlocks.slice(startIndex, endIndex);
  }, [allFilteredBlocks, page, pageSize]);

  const totalBlocks = allFilteredBlocks.length;

  if (!blocks.length) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b shrink-0 bg-emerald-50/70 p-6">
        <div className="flex items-center justify-between gap-4 w-full">
          {/* Title - Clickable */}
          <button
            type="button"
            onClick={handleToggle}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleToggle();
              }
            }}
            className="flex items-center gap-2 shrink-0 group cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-1 -ml-1"
            aria-expanded={isExpanded}
            aria-controls={`material-list-content-${title.replace(/\s+/g, "-").toLowerCase()}`}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${title}`}
          >
            <CardTitle className="text-lg font-semibold text-emerald-900 group-hover:text-emerald-800 transition-colors">
              {title}
            </CardTitle>
            {blocks.length > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                {blocks.length}
              </Badge>
            )}
          </button>
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md bg-white">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search material lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Expand/Collapse Chevron */}
            <button
              type="button"
              onClick={handleToggle}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleToggle();
                }
              }}
              className="p-1.5 hover:bg-emerald-100 rounded-md transition-all duration-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Collapse card" : "Expand card"}
            >
              <ChevronDown
                className={`h-5 w-5 text-emerald-900 transition-transform duration-300 ease-in-out ${
                  isExpanded ? "rotate-180" : "rotate-0"
                } group-hover:scale-110`}
              />
            </button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
      <CardContent
        id={`material-list-content-${title.replace(/\s+/g, "-").toLowerCase()}`}
        className="pt-6 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-300"
        aria-hidden={!isExpanded}
      >
        {filteredBlocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-1">No results found</p>
            <p className="text-xs text-muted-foreground">
              Try searching with different keywords
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {filteredBlocks.map((block: MaterialListBlock, idx: number) => (
            <div key={block.id ?? block.heading}>
              <div className="flex items-start justify-between gap-4">
                <div className="text-lg font-semibold">{block.heading}</div>
                <div className="flex items-center gap-2">
                  {String(block.status).toLowerCase() === "released" ? (
                    <>
                      <CheckCircle2 className="size-5 text-emerald-600" />
                      <Badge className="bg-emerald-600 text-white border-transparent px-4 py-1.5">
                        Released
                      </Badge>
                      <Badge className="bg-white text-red-600 border border-red-200 px-4 py-1.5">
                        {block.priority}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Eye className="size-5 text-blue-600" />
                      <Badge className="bg-blue-600 text-white border-transparent px-4 py-1.5">
                        Under Review
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-800 border border-amber-200 px-4 py-1.5">
                        {block.priority}
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {block.note ? (
                <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-blue-700">
                  <span className="font-semibold">Note:</span> {block.note}
                </div>
              ) : null}

              <div className="mt-8 text-base font-semibold">Bar List Summary</div>

              <div className="mt-4 overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-background">
                      <TableHead className="px-4 py-4">DWG #</TableHead>
                      <TableHead className="px-4 py-4">
                        Release Description
                      </TableHead>
                      <TableHead className="px-4 py-4">CTRL Code</TableHead>
                      <TableHead className="px-4 py-4">REL #</TableHead>
                      <TableHead className="px-4 py-4">WT (LBS)</TableHead>
                      <TableHead className="px-4 py-4">Date</TableHead>
                      <TableHead className="px-4 py-4">Varying Bars</TableHead>
                      <TableHead className="px-4 py-4">Element</TableHead>
                      <TableHead className="px-4 py-4">Bar Grade</TableHead>
                      <TableHead className="px-4 py-4">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {block.barList.map((row: MaterialListBarListRow) => (
                      <TableRow key={row.id ?? `${row.dwgNo}-${row.relNo}`}>
                        <TableCell className="px-4 py-4 font-medium">
                          {row.dwgNo}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {row.releaseDescription}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <Badge className="bg-white border border-zinc-200 text-foreground px-3 py-1">
                            {row.ctrlCode}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-4">{row.relNo}</TableCell>
                        <TableCell className="px-4 py-4">
                          {row.weightLbs}
                        </TableCell>
                        <TableCell className="px-4 py-4">{row.date}</TableCell>
                        <TableCell className="px-4 py-4">
                          <Badge className="bg-zinc-100 text-zinc-900 border-transparent px-4 py-1">
                            {row.varyingBars}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {row.rowElement || "—"}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {row.barGrade || "—"}
                        </TableCell>
                        <TableCell className="px-4 py-4 font-medium">
                          {row.remarks}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {idx < filteredBlocks.length - 1 ? <Separator className="mt-10" /> : null}
            </div>
            ))}
          </div>
        )}
        
        {/* Pagination Controls */}
        {totalBlocks > 0 && (
          <div className="mt-6 border-t pt-4">
            <PaginationControls
              page={page}
              pageSize={pageSize}
              total={totalBlocks}
              totalPages={Math.ceil(totalBlocks / pageSize)}
              onPageChange={(newPage) => {
                setPage(newPage);
                // Scroll to top of card content
                const contentElement = document.getElementById(`material-list-content-${title.replace(/\s+/g, "-").toLowerCase()}`);
                if (contentElement) {
                  contentElement.scrollTop = 0;
                }
              }}
              onPageSizeChange={(newPageSize) => {
                setPageSize(newPageSize);
                setPage(1);
              }}
              itemLabel="blocks"
            />
          </div>
        )}
      </CardContent>
      )}
    </Card>
  );
}


