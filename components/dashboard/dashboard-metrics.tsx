"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePerformanceMeasure } from "@/lib/utils/performance-monitor";
import { OptimizedBackgroundImage } from "@/lib/utils/optimized-background-image";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  Settings,
  Send,
  Scale,
  Phone,
  DollarSign,
  Package,
} from "lucide-react";
import dynamic from "next/dynamic";
import { ProjectAllocationButton } from "@/components/projects/project-allocation-button";

// Lazy load dialog components - they're only needed when opened
const ActiveProjectsDialog = dynamic(
  () =>
    import("@/components/dashboard/active-projects-dialog").then(
      (mod) => mod.ActiveProjectsDialog
    ),
  { ssr: false }
);
const OutstandingPaymentDialog = dynamic(
  () =>
    import("@/components/dashboard/outstanding-payment-dialog").then(
      (mod) => mod.OutstandingPaymentDialog
    ),
  { ssr: false }
);
const DetailingProcessDialog = dynamic(
  () =>
    import("@/components/dashboard/detailing-process-dialog").then(
      (mod) => mod.DetailingProcessDialog
    ),
  { ssr: false }
);
const RevisionProcessDialog = dynamic(
  () =>
    import("@/components/dashboard/revision-process-dialog").then(
      (mod) => mod.RevisionProcessDialog
    ),
  { ssr: false }
);
const ReleasedJobsDialog = dynamic(
  () =>
    import("@/components/dashboard/released-jobs-dialog").then(
      (mod) => mod.ReleasedJobsDialog
    ),
  { ssr: false }
);
const JobAvailabilityDialog = dynamic(
  () =>
    import("@/components/dashboard/job-availability-dialog").then(
      (mod) => mod.JobAvailabilityDialog
    ),
  { ssr: false }
);
import type { ProjectsListItem } from "@/app/api/projects/route";
import type { BillingInvoiceRow } from "@/components/billing/invoice-columns";

// Memoize metric card component to prevent unnecessary re-renders
type MetricType = {
  label: string;
  value: string;
  unit: string;
  icon?: React.ComponentType<{ className?: string }>;
  clickable: boolean;
  onClick?: () => void;
  labelColor?: string;
};

const MetricCard = memo(
  ({ metric, index }: { metric: MetricType; index: number }) => {
    const IconComponent = metric.icon;
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (
          metric.clickable &&
          metric.onClick &&
          (e.key === "Enter" || e.key === " ")
        ) {
          e.preventDefault();
          metric.onClick();
        }
      },
      [metric]
    );

    return (
      <div
        className={`flex flex-col p-4 rounded-lg border justify-between bg-background/50 backdrop-blur-sm relative ${
          metric.clickable
            ? "cursor-pointer hover:bg-background/70 transition-colors group"
            : ""
        }`}
        onClick={metric.onClick}
        role={metric.clickable ? "button" : undefined}
        tabIndex={metric.clickable ? 0 : undefined}
        onKeyDown={handleKeyDown}
      >
       <div className="flex justify-between items-center gap-2">
      
        <div
          className={`text-xs mb-2 font-medium transition-colors ${
            metric.labelColor || "text-muted-foreground"
          } ${metric.clickable ? "group-hover:text-white" : ""}`}
        >
          {metric.label}
        </div>
        {IconComponent && (
          <div className="">
            <IconComponent className={`h-5 w-5 text-muted-foreground/60 transition-colors ${metric.clickable ? "group-hover:text-white" : ""}`} />
          </div>
        )}
       </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold transition-colors ${metric.clickable ? "group-hover:text-white" : ""}`}>{metric.value}</span>
          {metric.unit && (
            <span className={`text-sm text-muted-foreground transition-colors ${metric.clickable ? "group-hover:text-white" : ""}`}>{metric.unit}</span>
          )}
        </div>
      </div>
    );
  }
);
MetricCard.displayName = "MetricCard";

export function DashboardMetrics() {
  // Performance monitoring (development only)
  usePerformanceMeasure("DashboardMetrics");

  const [isActiveProjectsOpen, setIsActiveProjectsOpen] = useState(false);
  const [isOutstandingPaymentOpen, setIsOutstandingPaymentOpen] =
    useState(false);
  const [isDetailingProcessOpen, setIsDetailingProcessOpen] = useState(false);
  const [isRevisionProcessOpen, setIsRevisionProcessOpen] = useState(false);
  const [isReleasedJobsOpen, setIsReleasedJobsOpen] = useState(false);
  const [isJobAvailabilityOpen, setIsJobAvailabilityOpen] = useState(false);

  // Fetch projects from Supabase
  const { data: projects = [], refetch: refetchProjects } = useQuery({
    queryKey: queryKeys.projects(),
    queryFn: () => fetchJson<ProjectsListItem[]>("/api/projects"),
    staleTime: 60_000,
  });

  // Fetch invoices from Supabase
  const { data: invoicesData, refetch: refetchInvoices } = useQuery({
    queryKey: queryKeys.billingInvoices(),
    queryFn: () =>
      fetchJson<{ data: BillingInvoiceRow[]; pagination: any }>(
        "/api/billing/invoices?page=1&pageSize=1000"
      ),
    staleTime: 60_000,
  });

  const invoices = invoicesData?.data ?? [];

  // Memoize money formatter to avoid recreating on every render
  const money = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    []
  );

  // Memoize all calculations to prevent unnecessary recalculations
  const metricsData = useMemo(() => {
    const totalActiveProjects = projects.length;

    const detailingInProcess = projects.filter(
      (p) => p.detailingStatus === "IN PROCESS"
    ).length;

    const revisionInProcess = projects.filter(
      (p) => p.revisionStatus === "IN PROCESS"
    ).length;

    const releasedInProcess = projects.filter(
      (p) => p.releaseStatus === "IN PROCESS"
    ).length;

    // Calculate total estimated tons for projects not yet detailed
    const yetToBeDetailedTons = projects
      .filter((p) => p.detailingStatus !== "COMPLETED")
      .reduce((sum, p) => sum + (p.estimatedTons ?? 0), 0);

    // Calculate total released tons from projects (use releasedTons field)
    const totalReleasedTons = projects.reduce(
      (sum, p) => sum + (p.releasedTons ?? 0),
      0
    );

    // Calculate total estimated tons
    const totalEstimatedTons = projects.reduce(
      (sum, p) => sum + (p.estimatedTons ?? 0),
      0
    );

    // Calculate outstanding payments (total amount billed from all invoices)
    const outstandingPayment = invoices.reduce(
      (sum, inv) => sum + inv.totalAmountBilled,
      0
    );

    return {
      totalActiveProjects,
      detailingInProcess,
      revisionInProcess,
      releasedInProcess,
      yetToBeDetailedTons,
      totalReleasedTons,
      totalEstimatedTons,
      outstandingPayment,
    };
  }, [projects, invoices]);

  // Memoize callback functions to prevent recreation on every render
  const handleActiveProjectsClick = useCallback(
    () => setIsActiveProjectsOpen(true),
    []
  );
  const handleDetailingProcessClick = useCallback(
    () => setIsDetailingProcessOpen(true),
    []
  );
  const handleRevisionProcessClick = useCallback(
    () => setIsRevisionProcessOpen(true),
    []
  );
  const handleReleasedJobsClick = useCallback(
    () => setIsReleasedJobsOpen(true),
    []
  );
  const handleJobAvailabilityClick = useCallback(
    () => setIsJobAvailabilityOpen(true),
    []
  );
  const handleOutstandingPaymentClick = useCallback(
    () => setIsOutstandingPaymentOpen(true),
    []
  );

  // Memoize metrics array to prevent recreation - Now with 7 items
  const metrics = useMemo(
    () => [
      {
        label: "Total Active Projects",
        value: metricsData.totalActiveProjects.toString(),
        unit: "",
        icon: Briefcase,
        clickable: true,
        onClick: handleActiveProjectsClick,
      },
      {
        label: "Detailing in Process",
        value: metricsData.detailingInProcess.toString(),
        unit: "",
        icon: Settings,
        clickable: true,
        onClick: handleDetailingProcessClick,
      },
      {
        label: "Revision in Process",
        value: metricsData.revisionInProcess.toString(),
        unit: "",
        icon: Package,
        clickable: true,
        onClick: handleRevisionProcessClick,
      },
      {
        label: "Release in Process",
        value: metricsData.releasedInProcess.toString(),
        unit: "",
        icon: Send,
        clickable: true,
        onClick: handleReleasedJobsClick,
      },
      {
        label: "Tons yet to be Detailed",
        value: metricsData.yetToBeDetailedTons.toFixed(1),
        unit: "Tons",
        icon: Scale,
        clickable: true,
      },
      {
        label: "Job Availability",
        value: "Call to Vel",
        unit: "",
        icon: Phone,
        labelColor: "text-green-700 dark:text-green-400",
        clickable: true,
        onClick: handleJobAvailabilityClick,
      },
      {
        label: "Outstanding Payment",
        value: money.format(metricsData.outstandingPayment),
        unit: "",
        icon: DollarSign,
        labelColor: "text-red-700 dark:text-red-400",
        clickable: true,
        onClick: handleOutstandingPaymentClick,
      },
    ],
    [
      metricsData,
      money,
      handleActiveProjectsClick,
      handleDetailingProcessClick,
      handleRevisionProcessClick,
      handleReleasedJobsClick,
      handleJobAvailabilityClick,
      handleOutstandingPaymentClick,
    ]
  );

  return (
    <Card className="w-full shadow-lg overflow-hidden relative">
      {/* Background Image */}
      <div className="absolute inset-0 h-full w-full bg-section opacity-70 " />
      {/* <div className="absolute inset-0 opacity-10 pointer-events-none z-0 bg-section" /> */}
      <OptimizedBackgroundImage src="/image/dashboard-bg.png" opacity={0.1} />
      <CardHeader className="relative border-b shrink-0 bg-emerald-50/70 p-6 z-10">
        <div className="flex items-center justify-between gap-2 w-full">
          <CardTitle className="text-lg font-semibold text-emerald-900">
            Dashboard Overview
          </CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <ProjectAllocationButton />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative p-6 z-10">
        {/* 7 metric cards in a single row on large screens */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} index={index} />
          ))}
        </div>
      </CardContent>
      <ActiveProjectsDialog
        open={isActiveProjectsOpen}
        onOpenChange={setIsActiveProjectsOpen}
      />
      <OutstandingPaymentDialog
        open={isOutstandingPaymentOpen}
        onOpenChange={setIsOutstandingPaymentOpen}
      />
      <DetailingProcessDialog
        open={isDetailingProcessOpen}
        onOpenChange={setIsDetailingProcessOpen}
        projects={projects}
      />
      <RevisionProcessDialog
        open={isRevisionProcessOpen}
        onOpenChange={setIsRevisionProcessOpen}
        projects={projects}
      />
      <ReleasedJobsDialog
        open={isReleasedJobsOpen}
        onOpenChange={setIsReleasedJobsOpen}
        projects={projects}
      />
      <JobAvailabilityDialog
        open={isJobAvailabilityOpen}
        onOpenChange={setIsJobAvailabilityOpen}
      />
    </Card>
  );
}