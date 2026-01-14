"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { DrawingLogVersionHistory } from "./drawing-log-version-history-dialog";

interface DrawingLogVersionHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drawingLogId: string;
  drawingDwgNo?: string;
}

export function DrawingLogVersionHistorySheet({
  open,
  onOpenChange,
  drawingLogId,
  drawingDwgNo,
}: DrawingLogVersionHistorySheetProps) {
  const [versionHistory, setVersionHistory] = useState<DrawingLogVersionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && drawingLogId) {
      fetchVersionHistory();
    }
  }, [open, drawingLogId]);

  const fetchVersionHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/drawing-log/${encodeURIComponent(drawingLogId)}/version-history`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch version history");
      }
      const data = await response.json();
      setVersionHistory(data.versionHistory || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case "INSERT":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "UPDATE":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "DELETE":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Drawing Revision History</SheetTitle>
          <SheetDescription>
            {drawingDwgNo
              ? `Complete revision history for drawing ${drawingDwgNo}`
              : "Complete revision history for this drawing"}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="mt-6 pr-4" style={{ maxHeight: "calc(100vh - 120px)" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-sm text-destructive mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchVersionHistory}>
                  Retry
                </Button>
              </div>
            </div>
          ) : versionHistory.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">No revision history available</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Rev</TableHead>
                    <TableHead className="text-center">DOS</TableHead>
                    <TableHead className="text-center">Weight</TableHead>
                    <TableHead className="text-center">AE mark-ups rec'd date</TableHead>
                    <TableHead className="text-center">WD</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versionHistory.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell className="font-medium text-center">
                        Rev {version.revision !== undefined ? version.revision : version.version_number - 1}
                      </TableCell>
                      <TableCell className="text-center">
                        {version.dos 
                          ? format(new Date(version.dos), "MM-dd-yy")
                          : format(new Date(version.created_at), "MM-dd-yy")}
                      </TableCell>
                      <TableCell className="text-center">
                        {version.weight !== undefined ? version.weight.toLocaleString() : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {version.aeMarkupDate 
                          ? format(new Date(version.aeMarkupDate), "MM-dd-yy")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {version.weightDifference !== undefined 
                          ? version.weightDifference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
