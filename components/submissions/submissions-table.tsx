"use client";

import { useState, useCallback, useMemo } from "react";
import { useSubmissions } from "@/lib/hooks/use-api";
import { useQueryClient } from "@tanstack/react-query";
import { SectionTableCard } from "@/components/projects/section-table-card";
import {
  upcomingSubmissionColumns,
  type SubmissionRow,
} from "@/components/projects/sections";
import { SubmissionDetailsDialog } from "@/components/submissions/submission-details-dialog";
import { SubmissionsDateFilter } from "@/components/submissions/submissions-date-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function SubmissionsTable() {
  const [page] = useState(1);
  const [pageSize] = useState(100000); // Very large page size to show all data
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>(undefined);
  const [submissionDetailsDialog, setSubmissionDetailsDialog] = useState<{
    open: boolean;
    submission: SubmissionRow | null;
  }>({
    open: false,
    submission: null,
  });

  const queryClient = useQueryClient();
  const { data: submissionsData, isLoading } = useSubmissions({
    page,
    pageSize,
    staleTime: 60_000,
    meta: { errorMessage: "Failed to load submissions." },
  });

  const allSubmissions = submissionsData?.data ?? [];

  // Handler for updating submission date
  const handleDateUpdate = useCallback(async (submissionId: string, date: Date | null) => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionDate: date ? date.toISOString() : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update submission date");
      }

      // Invalidate and refetch submissions
      await queryClient.invalidateQueries({ queryKey: ["submissions"] });
      
      toast.success("Submission date updated successfully");
    } catch (error) {
      console.error("Error updating submission date:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update submission date");
      throw error;
    }
  }, [queryClient]);

  // Filter submissions by date range
  const submissions = useMemo(() => {
    if (!dateRange || (!dateRange.from && !dateRange.to)) {
      return allSubmissions;
    }

    return allSubmissions.filter((submission) => {
      if (!submission.submissionDate) return false;
      
      const submissionDate = new Date(submission.submissionDate);
      // Reset time to midnight for accurate date comparison
      submissionDate.setHours(0, 0, 0, 0);
      
      // Check if submission date is within the range
      if (dateRange.from && dateRange.to) {
        // Both start and end dates are set - check if submission date is in range
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999); // Include the entire end date
        
        return submissionDate >= fromDate && submissionDate <= toDate;
      } else if (dateRange.from) {
        // Only start date is set - show submissions from start date onwards
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        return submissionDate >= fromDate;
      } else if (dateRange.to) {
        // Only end date is set - show submissions up to end date
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999); // Include the entire end date
        return submissionDate <= toDate;
      }
      
      return true;
    });
  }, [allSubmissions, dateRange]);

  // Handler for viewing submission details
  const handleViewSubmissionDetails = useCallback((submission: SubmissionRow) => {
    setSubmissionDetailsDialog({ open: true, submission });
  }, []);

  // Add state for expand/collapse
  const [isExpanded, setIsExpanded] = useState(true);

  // Handler for toggling expand/collapse
  const handleToggle = useCallback(() => {
    console.log('[SubmissionsTable] Toggle clicked, current state:', isExpanded);
    setIsExpanded(prev => {
      console.log('[SubmissionsTable] New state:', !prev);
      return !prev;
    });
  }, [isExpanded]);

  return (
    <>
    <SectionTableCard
      title="All Submissions"
      data={submissions}
      columns={upcomingSubmissionColumns}
      exportFilename="submissions.csv"
      search={{ columnId: "workDescription", placeholder: "Search submissions..." }}
      isLoading={isLoading}
      onRowClick={handleViewSubmissionDetails}
      onViewDetails={handleViewSubmissionDetails}
      isExpanded={isExpanded}
      onToggle={handleToggle}
      onDateUpdate={handleDateUpdate}
      headerAction={
        <SubmissionsDateFilter
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      }
    />

      <SubmissionDetailsDialog
        open={submissionDetailsDialog.open}
        onOpenChange={(open) =>
          setSubmissionDetailsDialog((prev) => ({ ...prev, open }))
        }
        submission={submissionDetailsDialog.submission}
    />
    </>
  );
}

