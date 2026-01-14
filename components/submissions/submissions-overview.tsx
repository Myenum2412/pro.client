"use client";

import { useMemo, memo } from "react";
import { useSubmissions } from "@/lib/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubmissionRow } from "@/components/projects/sections";
import { OptimizedBackgroundImage } from "@/lib/utils/optimized-background-image";

// Memoize metric card to prevent unnecessary re-renders
const MetricCard = memo(
  ({
    label,
    value,
    unit,
  }: {
    label: string;
    value: string;
    unit: string;
  }) => (
    <div className="flex flex-col p-4 rounded-lg border bg-background/50 backdrop-blur-sm">
      <div className="text-sm mb-2 font-medium text-muted-foreground">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        {unit && (
          <span className="text-sm text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  )
);
MetricCard.displayName = "MetricCard";

export function SubmissionsOverview() {
  // Fetch all submissions for overview (use large pageSize to get all)
  const { data: submissionsData } = useSubmissions({
    page: 1,
    pageSize: 1000, // Large page size to get all submissions for overview calculations
    staleTime: 60_000,
    meta: { errorMessage: "Failed to load submissions." },
  });

  // Extract data array from paginated response
  const data = submissionsData?.data ?? [];

  // Memoize all calculations
  const metrics = useMemo(() => {
    const totalSubmissions = data.length;

    // Count submissions by type
    const appSubmissions = data.filter(
      (s: SubmissionRow) => s.submissionType === "For Approval (APP)"
    ).length;
    const materialListSubmissions = data.filter(
      (s: SubmissionRow) => s.submissionType === "Material List"
    ).length;

    // Count recent submissions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSubmissions = data.filter((s: SubmissionRow) => {
      const submissionDate = new Date(s.submissionDate);
      return submissionDate >= thirtyDaysAgo;
    }).length;

    return [
      {
        label: "Material List",
        value: totalSubmissions.toString(),
        unit: "",
      },
      {
        label: "Approval Submission",
        value: appSubmissions.toString(),
        unit: "",
      },
      {
        label: "Revise and Resubmit",
        value: materialListSubmissions.toString(),
        unit: "",
      },
      {
        label: "Change Order",
        value: recentSubmissions.toString(),
        unit: "",
      },
    ];
  }, [data]);

  return (
    <Card className="w-full shadow-lg overflow-hidden relative">
    <div className="absolute inset-0 bg-section opacity-70 " />
      <CardHeader className="relative border-b shrink-0 bg-emerald-50/70 p-6">
        <div className="flex items-center justify-between gap-4 w-full">
          <CardTitle className="text-lg font-semibold text-emerald-900 shrink-0">Submissions Overview</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative p-6">
        <div className="grid grid-cols-6 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              label={metric.label}
              value={metric.value}
              unit={metric.unit}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

