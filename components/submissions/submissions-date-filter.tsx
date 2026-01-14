"use client";

import * as React from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/lib/utils/date-format";

type DateRange = {
  from?: Date;
  to?: Date;
};

type SubmissionsDateFilterProps = {
  dateRange?: DateRange;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
};

export function SubmissionsDateFilter({
  dateRange,
  onDateRangeChange,
}: SubmissionsDateFilterProps) {
  const [startDateOpen, setStartDateOpen] = React.useState(false);
  const [endDateOpen, setEndDateOpen] = React.useState(false);

  const getButtonText = (type: "start" | "end") => {
    if (type === "start") {
      return dateRange?.from ? formatDate(dateRange.from) : "Start date";
    }
    return dateRange?.to ? formatDate(dateRange.to) : "End date";
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    onDateRangeChange({
      from: date,
      to: dateRange?.to,
    });
    setStartDateOpen(false);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Ensure end date is not before start date
    if (dateRange?.from && date < dateRange.from) {
      // If end date is before start date, swap them
      onDateRangeChange({
        from: date,
        to: dateRange.from,
      });
    } else {
      onDateRangeChange({
        from: dateRange?.from,
        to: date,
      });
    }
    setEndDateOpen(false);
  };

  const handleClear = () => {
    onDateRangeChange(undefined);
  };

  const hasActiveFilter = dateRange?.from || dateRange?.to;

  return (
    <div className="flex items-center gap-2">
      {/* Start Date Picker */}
      <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[180px] justify-start text-left font-normal",
              !dateRange?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getButtonText("start")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateRange?.from}
            onSelect={handleStartDateSelect}
            initialFocus
            disabled={(date) => {
              // Disable dates after end date if end date is set
              if (dateRange?.to) {
                return date > dateRange.to;
              }
              return false;
            }}
          />
        </PopoverContent>
      </Popover>

      {/* End Date Picker */}
      <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[180px] justify-start text-left font-normal",
              !dateRange?.to && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getButtonText("end")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateRange?.to}
            onSelect={handleEndDateSelect}
            initialFocus
            disabled={(date) => {
              // Disable dates before start date if start date is set
              if (dateRange?.from) {
                return date < dateRange.from;
              }
              return false;
            }}
          />
        </PopoverContent>
      </Popover>

      {/* Clear Button */}
      {hasActiveFilter && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={handleClear}
          aria-label="Clear date filter"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
