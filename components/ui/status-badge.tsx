"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/utils/submission-colors";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
  variant?: "default" | "outline";
}

/**
 * Unified Status Badge Component
 * 
 * Displays status with consistent color coding:
 * - APP: Yellow
 * - RR: Orange
 * - FFU: Green
 * 
 * Works for:
 * - Submission types
 * - Drawing statuses
 * - Any status that uses APP/RR/FFU
 */
export function StatusBadge({ status, className, variant = "default" }: StatusBadgeProps) {
  if (!status) return null;

  const colorClasses = getStatusColor(status);

  return (
    <Badge
      className={cn(
        colorClasses,
        variant === "outline" && "border",
        className
      )}
    >
      {status}
    </Badge>
  );
}

/**
 * Status Indicator Dot
 * Small colored dot for compact status display
 */
export function StatusDot({ status, className }: { status: string; className?: string }) {
  const upperStatus = status?.toUpperCase().trim();
  
  let dotColor = "bg-gray-500";
  
  if (upperStatus === "APP" || upperStatus === "APPROVAL") {
    dotColor = "bg-yellow-500";
  } else if (upperStatus === "RR" || upperStatus?.includes("R&R") || upperStatus?.includes("REVIEW")) {
    dotColor = "bg-orange-500";
  } else if (upperStatus === "FFU" || upperStatus?.includes("FIELD")) {
    dotColor = "bg-green-500";
  }

  return (
    <div className={cn("w-2 h-2 rounded-full", dotColor, className)} />
  );
}

/**
 * Status Label with Dot
 * Text label with colored dot indicator
 */
export function StatusLabel({ status, className }: { status: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <StatusDot status={status} />
      <span>{status}</span>
    </div>
  );
}

