"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Clock, User, FileEdit, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export interface DrawingLogVersionHistory {
  id: string;
  drawing_log_id: string;
  version_number: number;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  changed_fields: string[];
  change_summary: string;
  change_type: "INSERT" | "UPDATE" | "DELETE";
  editor_id: string | null;
  editor_name: string | null;
  editor_email: string | null;
  created_at: string;
  // Revision history fields
  revision?: number; // Rev 0, Rev 1, etc.
  dos?: string; // Date of Submission
  weight?: number;
  aeMarkupDate?: string; // AE mark-ups received date
  weightDifference?: number; // WD - Weight Difference
}

interface DrawingLogVersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drawingLogId: string;
  drawingDwgNo?: string;
}

export function DrawingLogVersionHistoryDialog({
  open,
  onOpenChange,
  drawingLogId,
  drawingDwgNo,
}: DrawingLogVersionHistoryDialogProps) {
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

  const formatFieldName = (fieldName: string) => {
    return fieldName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getFieldValue = (data: Record<string, any> | null, field: string) => {
    if (!data) return null;
    return data[field] ?? null;
  };

  const renderFieldChange = (version: DrawingLogVersionHistory, field: string) => {
    const oldValue = getFieldValue(version.old_data, field);
    const newValue = getFieldValue(version.new_data, field);

    return (
      <div key={field} className="space-y-1">
        <div className="text-sm font-medium text-muted-foreground">
          {formatFieldName(field)}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex-1 rounded-md bg-red-50 dark:bg-red-950/20 p-2 border border-red-200 dark:border-red-900">
            <div className="text-xs text-red-600 dark:text-red-400 mb-1">Old Value</div>
            <div className="text-sm">
              {oldValue === null || oldValue === undefined
                ? "(empty)"
                : typeof oldValue === "object"
                ? JSON.stringify(oldValue)
                : String(oldValue)}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 rounded-md bg-green-50 dark:bg-green-950/20 p-2 border border-green-200 dark:border-green-900">
            <div className="text-xs text-green-600 dark:text-green-400 mb-1">New Value</div>
            <div className="text-sm">
              {newValue === null || newValue === undefined
                ? "(empty)"
                : typeof newValue === "object"
                ? JSON.stringify(newValue)
                : String(newValue)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            {drawingDwgNo
              ? `View all changes made to drawing ${drawingDwgNo}`
              : "View all changes made to this drawing log entry"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
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
              <p className="text-sm text-muted-foreground">No version history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {versionHistory.map((version, index) => (
                <div
                  key={version.id}
                  className="rounded-lg border bg-card p-4 space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={getChangeTypeColor(version.change_type)}
                      >
                        {version.change_type}
                      </Badge>
                      <span className="text-sm font-medium">
                        Version {version.version_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(version.created_at), "PPpp")}
                    </div>
                  </div>

                  <Separator />

                  {/* Editor Information */}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Edited by:</span>
                    <span className="font-medium">
                      {version.editor_name || version.editor_email || "Unknown"}
                    </span>
                    {version.editor_email && version.editor_name && (
                      <span className="text-muted-foreground">
                        ({version.editor_email})
                      </span>
                    )}
                  </div>

                  {/* Change Summary */}
                  <div className="flex items-start gap-2 text-sm">
                    <FileEdit className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground">Change:</span>
                      <span className="ml-2 font-medium">{version.change_summary}</span>
                    </div>
                  </div>

                  {/* Field Changes */}
                  {version.changed_fields && version.changed_fields.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div className="text-sm font-medium">Changed Fields:</div>
                        {version.changed_fields.map((field) =>
                          renderFieldChange(version, field)
                        )}
                      </div>
                    </>
                  )}

                  {/* Full Data (for INSERT) */}
                  {version.change_type === "INSERT" && version.new_data && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Initial Data:</div>
                        <div className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">
                          <pre>{JSON.stringify(version.new_data, null, 2)}</pre>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

