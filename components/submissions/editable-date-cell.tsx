"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/lib/utils/date-format";

type EditableDateCellProps = {
  value: string | null | undefined;
  onSave: (date: Date | null) => Promise<void> | void;
  disabled?: boolean;
};

export function EditableDateCell({
  value,
  onSave,
  disabled = false,
}: EditableDateCellProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [isSaving, setIsSaving] = React.useState(false);

  // Update selectedDate when value prop changes
  React.useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    } else {
      setSelectedDate(undefined);
    }
  }, [value]);

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDate(date);
    setIsSaving(true);
    
    try {
      await onSave(date);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save date:", error);
      // Revert to original value on error
      setSelectedDate(value ? new Date(value) : undefined);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    setSelectedDate(undefined);
    setIsSaving(true);
    
    try {
      await onSave(null);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to clear date:", error);
      // Revert to original value on error
      setSelectedDate(value ? new Date(value) : undefined);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto p-1 font-medium hover:bg-muted",
            !selectedDate && "text-muted-foreground",
            disabled && "cursor-not-allowed opacity-50"
          )}
          disabled={disabled || isSaving}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              setIsOpen(true);
            }
          }}
        >
          {selectedDate ? formatDate(selectedDate) : "Click to set date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" onClick={(e) => e.stopPropagation()}>
        <div className="p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
          {selectedDate && (
            <div className="mt-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleClear}
                disabled={isSaving}
              >
                Clear Date
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
