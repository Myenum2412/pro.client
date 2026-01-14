"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Filter } from "lucide-react";
import type { HolidayType } from "@/lib/utils/holidays";

export interface CalendarHolidayToggleProps {
  showHolidays: boolean;
  onShowHolidaysChange: (show: boolean) => void;
  holidayTypes: HolidayType[];
  onHolidayTypesChange: (types: HolidayType[]) => void;
}

/**
 * Toggle component for holiday visibility and types
 */
export function CalendarHolidayToggle({
  showHolidays,
  onShowHolidaysChange,
  holidayTypes,
  onHolidayTypesChange,
}: CalendarHolidayToggleProps) {
  const allTypes: HolidayType[] = ["national", "state", "custom"];

  const handleTypeToggle = (type: HolidayType, checked: boolean) => {
    if (checked) {
      onHolidayTypesChange([...holidayTypes, type]);
    } else {
      onHolidayTypesChange(holidayTypes.filter((t) => t !== type));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Holidays</span>
          <Filter className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Holiday Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={showHolidays}
          onCheckedChange={onShowHolidaysChange}
        >
          Show Holidays
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Holiday Types</DropdownMenuLabel>
        {allTypes.map((type) => (
          <DropdownMenuCheckboxItem
            key={type}
            checked={holidayTypes.includes(type)}
            onCheckedChange={(checked) => handleTypeToggle(type, checked)}
            disabled={!showHolidays}
          >
            <span className="capitalize">{type}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
