"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

export interface CalendarLegendProps {
  showHolidays?: boolean;
  showWeekends?: boolean;
  showToday?: boolean;
  className?: string;
}

/**
 * Calendar Legend Component
 * Displays color-coded legend for calendar elements
 */
export function CalendarLegend({
  showHolidays = true,
  showWeekends = true,
  showToday = true,
  className,
}: CalendarLegendProps) {
  const items: Array<{
    label: string;
    color: string;
    bgColor: string;
    borderColor?: string;
  }> = [];

  if (showHolidays) {
    items.push(
      {
        label: "National Holiday",
        color: "text-blue-700 dark:text-blue-300",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        borderColor: "border-blue-300 dark:border-blue-700",
      },
      {
        label: "State Holiday",
        color: "text-purple-700 dark:text-purple-300",
        bgColor: "bg-purple-100 dark:bg-purple-900/30",
        borderColor: "border-purple-300 dark:border-purple-700",
      },
      {
        label: "Custom Holiday",
        color: "text-amber-700 dark:text-amber-300",
        bgColor: "bg-amber-100 dark:bg-amber-900/30",
        borderColor: "border-amber-300 dark:border-amber-700",
      }
    );
  }

  if (showWeekends) {
    items.push({
      label: "Weekend",
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
    });
  }

  if (showToday) {
    items.push({
      label: "Today",
      color: "text-accent-foreground",
      bgColor: "bg-accent",
    });
  }

  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 p-3 text-sm border-t",
        className
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span className="font-medium">Legend:</span>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <div
            className={cn(
              "h-4 w-4 rounded border",
              item.bgColor,
              item.borderColor || "border-transparent"
            )}
          />
          <span className={cn("text-xs", item.color)}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
