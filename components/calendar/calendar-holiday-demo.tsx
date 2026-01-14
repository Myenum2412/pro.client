"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarWithHolidays } from "@/components/ui/calendar-with-holidays";
import { CalendarLegend } from "@/components/ui/calendar-legend";
import { CalendarHolidayToggle } from "@/components/ui/calendar-holiday-toggle";
import { Button } from "@/components/ui/button";
import { loadHolidaysFromAPI, addHoliday, type HolidayType } from "@/lib/utils/holidays";
import { Calendar as CalendarIcon } from "lucide-react";
import { formatDate } from "@/lib/utils/date-format";
import { toast } from "sonner";

/**
 * Demo component showing Calendar with holiday highlighting
 */
export function CalendarHolidayDemo() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showHolidays, setShowHolidays] = useState(true);
  const [holidayTypes, setHolidayTypes] = useState<HolidayType[]>([
    "national",
    "state",
    "custom",
  ]);
  const [region, setRegion] = useState<string | undefined>(undefined);

  const handleHolidayClick = (date: Date, holidays: any[]) => {
    const holidayNames = holidays.map((h) => h.name).join(", ");
    toast.info(`Holiday${holidays.length > 1 ? "s" : ""} on ${formatDate(date)}`, {
      description: holidayNames,
    });
  };

  const handleLoadFromJSON = async () => {
    try {
      await loadHolidaysFromAPI("/api/holidays");
      toast.success("Holidays loaded from API");
    } catch (error) {
      toast.error("Failed to load holidays from API");
    }
  };

  const handleAddCustomHoliday = () => {
    const today = new Date();
    const nextYear = today.getFullYear() + 1;
    addHoliday({
      date: `${nextYear}-12-31`,
      name: "New Year's Eve",
      type: "custom",
      recurring: false,
      year: nextYear,
    });
    toast.success("Custom holiday added");
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calendar with Holiday Highlighting</CardTitle>
              <CardDescription>
                Select dates to see holidays. Hover over highlighted dates to see holiday names.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <CalendarHolidayToggle
                showHolidays={showHolidays}
                onShowHolidaysChange={setShowHolidays}
                holidayTypes={holidayTypes}
                onHolidayTypesChange={setHolidayTypes}
              />
              <Button variant="outline" size="sm" onClick={handleLoadFromJSON}>
                Load from JSON
              </Button>
              <Button variant="outline" size="sm" onClick={handleAddCustomHoliday}>
                Add Custom
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <CalendarWithHolidays
                mode="single"
                selected={selectedDate}
                onSelect={(date: Date | Date[] | { from: Date; to?: Date } | undefined) => {
                  if (date instanceof Date) {
                    setSelectedDate(date);
                  } else if (date === undefined) {
                    setSelectedDate(undefined);
                  }
                }}
                showHolidays={showHolidays}
                region={region}
                holidayTypes={holidayTypes}
                onHolidayClick={handleHolidayClick}
                className="rounded-md border"
              />
            </div>
            <div className="lg:w-64 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Selected Date</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        {formatDate(selectedDate)}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {selectedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No date selected
                    </p>
                  )}
                </CardContent>
              </Card>
              <CalendarLegend
                showHolidays={showHolidays}
                showWeekends={true}
                showToday={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
