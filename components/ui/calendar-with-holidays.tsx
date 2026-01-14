"use client";

import * as React from "react";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  getHolidaysForDate,
  getPrimaryHolidayName,
  type Holiday,
  type HolidayType,
} from "@/lib/utils/holidays";
import type { DayPickerProps } from "react-day-picker";

export type CalendarWithHolidaysProps = Omit<
  DayPickerProps,
  "modifiers" | "modifiersClassNames" | "components"
> & {
  showHolidays?: boolean;
  region?: string;
  holidayTypes?: HolidayType[];
  onHolidayClick?: (date: Date, holidays: Holiday[]) => void;
} & Record<string, any>; // Allow any additional props for flexibility

/**
 * Enhanced Calendar component with holiday highlighting
 */
export function CalendarWithHolidays({
  showHolidays = true,
  region,
  holidayTypes = ["national", "state", "custom"],
  onHolidayClick,
  className,
  ...props
}: CalendarWithHolidaysProps) {
  const getHolidayModifier = React.useCallback(
    (date: Date) => {
      if (!showHolidays) return false;
      const holidays = getHolidaysForDate(date, region);
      return (
        holidays.length > 0 &&
        holidays.some((h) => holidayTypes.includes(h.type))
      );
    },
    [showHolidays, region, holidayTypes]
  );

  const getHolidayClassName = React.useCallback(
    (date: Date, modifiers: { holiday?: boolean }) => {
      if (!modifiers.holiday) return "";
      const holidays = getHolidaysForDate(date, region);
      const dateHolidays = getHolidaysForDate(date, region).filter((h) =>
        holidayTypes.includes(h.type)
      );
      const hasNational = dateHolidays.some((h) => h.type === "national");
      const hasState = dateHolidays.some((h) => h.type === "state");
      const hasCustom = dateHolidays.some((h) => h.type === "custom");

      // Priority: national > state > custom
      if (hasNational) {
        return "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 border-2 hover:bg-blue-200 dark:hover:bg-blue-900/50";
      }
      if (hasState) {
        return "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 border-2 hover:bg-purple-200 dark:hover:bg-purple-900/50";
      }
      if (hasCustom) {
        return "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 border-2 hover:bg-amber-200 dark:hover:bg-amber-900/50";
      }
      return "bg-muted border-2";
    },
    [region, holidayTypes]
  );

  // Extract our custom props and pass the rest to Calendar
  const { showHolidays: _, region: __, holidayTypes: ___, onHolidayClick: ____, ...calendarProps } = props;

  return (
    <Calendar
      className={className}
      {...(calendarProps as any)}
      modifiers={{
        holiday: getHolidayModifier,
        ...calendarProps.modifiers,
      }}
      modifiersClassNames={{
        holiday: (date: Date, modifiers: any) =>
          getHolidayClassName(date, modifiers as { holiday?: boolean }),
        ...calendarProps.modifiersClassNames,
      }}
      components={{
        DayButton: ({ day, className, modifiers, ...dayProps }) => {
          const holidays = showHolidays
            ? getHolidaysForDate(day.date, region).filter((h) =>
                holidayTypes.includes(h.type)
              )
            : [];
          const isHoliday = holidays.length > 0;
          const holidayName = isHoliday
            ? getPrimaryHolidayName(day.date, region)
            : null;
          const allHolidayNames = holidays.map((h) => h.name).join(", ");

          const dayButton = (
            <CalendarDayButton
              day={day}
              className={cn(className)}
              modifiers={modifiers}
              onClick={(e) => {
                if (isHoliday && onHolidayClick) {
                  onHolidayClick(day.date, holidays);
                }
                dayProps.onClick?.(e);
              }}
              {...dayProps}
            />
          );

          if (isHoliday && holidayName) {
            return (
              <Tooltip key={day.date.toISOString()}>
                <TooltipTrigger asChild>{dayButton}</TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold">Holiday{holidays.length > 1 ? "s" : ""}</p>
                    {holidays.length === 1 ? (
                      <p>{holidayName}</p>
                    ) : (
                      <ul className="list-disc list-inside space-y-0.5">
                        {holidays.map((h, idx) => (
                          <li key={idx} className="text-sm">
                            {h.name} <span className="text-muted-foreground">({h.type})</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          }

          return dayButton;
        },
        ...props.components,
      }}
      {...props}
    />
  );
}
