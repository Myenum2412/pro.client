"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CalendarIcon, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils/date-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import {
  Widget,
  WidgetContent,
  WidgetTitle,
} from "@/components/ui/widget";
import { cn } from "@/lib/utils";
import { demoProjects } from "@/public/assets";
import { preloadHolidays, isHolidaySync, getHolidayName } from "@/lib/utils/google-calendar-holidays";
import type { DayButton } from "react-day-picker";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type MeetingFormData = {
  meetingTitle: string;
  date: Date | undefined;
  time: string;
  member: string;
  projects: string[];
  description: string;
};

export function ScheduleMeetingForm() {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [showErrors, setShowErrors] = useState(false);
  const [time, setTime] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState<number>(new Date().getHours() % 12 || 12);
  const [selectedMinute, setSelectedMinute] = useState<number>(new Date().getMinutes());
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(
    new Date().getHours() >= 12 ? "PM" : "AM"
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [timePopoverOpen, setTimePopoverOpen] = useState(false);

  // Preload holidays when component mounts
  useEffect(() => {
    preloadHolidays();
  }, []);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MeetingFormData>({
    defaultValues: {
      meetingTitle: "",
      date: undefined,
      time: "",
      member: "",
      projects: [],
      description: "",
    },
  });

  const selectedDate = watch("date");
  const selectedMember = watch("member");

  // Live clock update
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatTime = (num: number) => String(num).padStart(2, "0");

  const minutes = formatTime(time.getMinutes());
  const hours = time.getHours() % 12 || 12;

  const handleTimeSelection = () => {
    // Convert 12-hour to 24-hour format
    let hours24 = selectedHour;
    if (selectedPeriod === "PM" && selectedHour !== 12) {
      hours24 = selectedHour + 12;
    } else if (selectedPeriod === "AM" && selectedHour === 12) {
      hours24 = 0;
    }
    
    const timeString = `${formatTime(hours24)}:${formatTime(selectedMinute)}`;
    setSelectedTime(timeString);
    setValue("time", timeString);
    setTimePopoverOpen(false); // Close the popover
  };

  const handleUseCurrentTime = () => {
    const now = new Date();
    const currentHour = now.getHours() % 12 || 12;
    const currentMinute = now.getMinutes();
    const currentPeriod = now.getHours() >= 12 ? "PM" : "AM";
    
    setSelectedHour(currentHour);
    setSelectedMinute(currentMinute);
    setSelectedPeriod(currentPeriod);
    
    const hours24 = formatTime(now.getHours());
    const mins = formatTime(now.getMinutes());
    const timeString = `${hours24}:${mins}`;
    setSelectedTime(timeString);
    setValue("time", timeString);
    setTimePopoverOpen(false); // Close the popover
  };

  const projects = React.useMemo(
    () =>
      demoProjects.map((p, index) => ({
        id: `proj-${index + 1}`,
        jobNumber: p.jobNumber,
        name: p.name,
      })),
    []
  );

  const onSubmit = (data: MeetingFormData) => {
    setShowErrors(true);
    
    if (!selectedDate || !selectedMember || !data.meetingTitle || !data.time || !selectedProject) {
      return;
    }
    // Here you would typically send the data to an API
    alert("Meeting scheduled successfully!");
    // Reset form
    setValue("meetingTitle", "");
    setValue("date", undefined);
    setValue("time", "");
    setValue("member", "");
    setValue("description", "");
    setSelectedProject("");
    setShowErrors(false);
  };

  return (
    <Card className="w-full shadow-lg overflow-hidden">
      <CardHeader className="border-b shrink-0 bg-emerald-50/70 p-6">
        <CardTitle className="text-lg font-semibold text-emerald-900">Schedule Meeting</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Meeting Title */}
          <div className="space-y-2">
            <Label htmlFor="meetingTitle">Meeting Title</Label>
            <Input
              id="meetingTitle"
              placeholder="Enter meeting title"
              {...register("meetingTitle", { required: "Meeting title is required" })}
            />
            {errors.meetingTitle && (
              <p className="text-sm text-red-500">{errors.meetingTitle.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? formatDate(selectedDate) : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => setValue("date", date)}
                    initialFocus
                    components={{
                      DayButton: ({ day, className, ...props }) => {
                        const dayOfWeek = day.date.getDay();
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday (0) or Saturday (6)
                        const isHoliday = isHolidaySync(day.date);
                        const holidayName = isHoliday ? getHolidayName(day.date) : null;
                        
                        // Holiday takes priority over weekend
                        const dayColorClass = isHoliday
                          ? "text-red-600 hover:text-red-700"
                          : isWeekend
                          ? "text-red-600 hover:text-red-700"
                          : "text-green-600 hover:text-green-700";
                        
                        const dayButton = (
                          <CalendarDayButton
                            day={day}
                            className={cn(dayColorClass, className)}
                            {...props}
                          />
                        );

                        if (isHoliday && holidayName) {
                          return (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {dayButton}
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium">{holidayName}</p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        }

                        return dayButton;
                      },
                    }}
                  />
                </PopoverContent>
              </Popover>
              {showErrors && !selectedDate && (
                <p className="text-sm text-red-500">Date is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Popover open={timePopoverOpen} onOpenChange={setTimePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedTime && "text-muted-foreground"
                    )}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {selectedTime || "Select time"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <div className="space-y-4">
                    {/* Live Clock Widget */}
                    <Widget>
                      <WidgetContent className="flex-col gap-4">
                        <WidgetTitle className="text-5xl tracking-widest">
                          {hours}:{minutes}
                        </WidgetTitle>
                      </WidgetContent>
                    </Widget>

                    {/* Time Selection Controls */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {/* Hour Selection */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Hour</Label>
                          <Select
                            value={selectedHour.toString()}
                            onValueChange={(value) => setSelectedHour(parseInt(value))}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                                <SelectItem key={hour} value={hour.toString()}>
                                  {hour}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Minute Selection */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Minute</Label>
                          <Select
                            value={selectedMinute.toString()}
                            onValueChange={(value) => setSelectedMinute(parseInt(value))}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                                <SelectItem key={minute} value={minute.toString()}>
                                  {formatTime(minute)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* AM/PM Selection */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Period</Label>
                          <Select
                            value={selectedPeriod}
                            onValueChange={(value: "AM" | "PM") => setSelectedPeriod(value)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AM">AM</SelectItem>
                              <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleUseCurrentTime}
                          className="flex-1"
                        >
                          Current Time
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleTimeSelection}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        >
                          Set Time
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {errors.time && (
                <p className="text-sm text-red-500">{errors.time.message}</p>
              )}
            </div>
          </div>

          {/* Member and Project Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="member">Member</Label>
              <Select
                value={selectedMember}
                onValueChange={(value) => setValue("member", value)}
              >
                <SelectTrigger id="member">
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vel">Vel</SelectItem>
                  <SelectItem value="rajesh">Rajesh</SelectItem>
                </SelectContent>
              </Select>
              {showErrors && !selectedMember && (
                <p className="text-sm text-red-500">Member selection is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Select Project</Label>
              <Select
                value={selectedProject}
                onValueChange={(value) => {
                  setSelectedProject(value);
                  setValue("projects", [value]);
                }}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.jobNumber} - {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showErrors && !selectedProject && (
                <p className="text-sm text-red-500">Project selection is required</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter meeting description"
              rows={2}
              {...register("description")}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setValue("meetingTitle", "");
                setValue("date", undefined);
                setValue("time", "");
                setValue("member", "");
                setValue("description", "");
                setSelectedProject("");
                setShowErrors(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Schedule Meeting
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

