"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { CalendarIcon, Upload } from "lucide-react";
import { formatDate } from "@/lib/utils/date-format";
import { cn } from "@/lib/utils";
import type { DayButton } from "react-day-picker";
import { FilePreviewList } from "@/components/chat/file-preview";
import { ScrollArea } from "@/components/ui/scroll-area";
import { preloadHolidays, isHolidaySync, getHolidayName } from "@/lib/utils/google-calendar-holidays";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UploadDropzoneProgress } from "@/components/ui/upload-dropzone-progress";
import { useUploadFiles } from "@better-upload/client";

type ProjectAllocationFormData = {
  projectName: string;
  projectNumber: string;
  dueDate: Date | undefined;
  description: string;
  files: File[];
};

interface ProjectAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: ProjectAllocationFormData) => Promise<void> | void;
  isSubmitting?: boolean;
}



export function ProjectAllocationDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: ProjectAllocationDialogProps) {
  const [projectNumber, setProjectNumber] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Better Upload hook for file handling with progress
  // We use a placeholder endpoint since we handle files locally
  const uploadControl = useUploadFiles({
    route: "/api/upload-placeholder",
    onUploadComplete: () => {
      // Files are handled via uploadOverride, so this won't be called
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectAllocationFormData>({
    defaultValues: {
      projectName: "",
      projectNumber: "",
      dueDate: undefined,
      description: "",
      files: [],
    },
  });

  // Preload holidays when dialog opens
  useEffect(() => {
    if (open) {
      preloadHolidays();
    }
  }, [open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      // Reset form when closed
      reset();
      setSelectedDate(undefined);
      setUploadedFiles([]);
      setProjectNumber("");
    }
  }, [open, reset]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setValue("dueDate", date);
  };

  // Handle file upload - accept all files
  const handleFileUpload = React.useCallback((files: File[], metadata?: Record<string, unknown>) => {
    // Accept all files
    if (files.length > 0) {
      setUploadedFiles((prev) => {
        const newFiles = [...prev, ...files];
        setValue("files", newFiles);
        return newFiles;
      });
    }
  }, [setValue]);

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setValue("files", newFiles);
  };

  const onFormSubmit = async (data: ProjectAllocationFormData) => {
    const formData = {
      ...data,
      projectNumber,
      dueDate: selectedDate,
      files: uploadedFiles,
    };

    if (onSubmit) {
      await onSubmit(formData);
    } else {
      alert("Project allocated successfully!");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-2xl font-semibold">
            Project Allocation
          </DialogTitle>
          <DialogDescription>
            Create and allocate a new project with team assignments
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 h-full overflow-y-auto">
          <div className="px-6 py-4">
            <form
              id="project-allocation-form"
              onSubmit={handleSubmit(onFormSubmit)}
              className="space-y-6 rounded-2xl"
            >
              {/* Row 1: Project Name & Project Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="text-sm font-semibold">
                    Project Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="projectName"
                    placeholder="Enter project name"
                    {...register("projectName", {
                      required: "Project name is required",
                    })}
                    className={cn(
                      errors.projectName && "border-destructive"
                    )}
                  />
                  {errors.projectName && (
                    <p className="text-xs text-destructive">
                      {errors.projectName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectNumber" className="text-sm font-semibold">
                    Project Number
                  </Label>
                  <Input
                    id="projectNumber"
                    value={projectNumber}
                     onChange={(e) => {
                       setProjectNumber(e.target.value);
                       setValue("projectNumber", e.target.value);
                     }}
                     placeholder="Enter project number"
                     className={errors.projectNumber && "border-destructive"}
                   />
                   {errors.projectNumber && (
                     <p className="text-xs text-destructive">
                       {errors.projectNumber.message}
                     </p>
                   )}
                </div>
              </div>

              {/* Row 2: Expected Submission date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-semibold">
                  Expected Submission Date
                </Label>
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
                      {selectedDate ? (
                        formatDate(selectedDate)
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
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
              </div>

              {/* Row 3: Detailing Notes */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">
                  Detailing Notes if any
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter detailing notes if any..."
                  rows={4}
                  {...register("description")}
                  className="resize-none"
                />
              </div>

              {/* Row 4: File Upload */}
              <div className="space-y-2">
                <Label htmlFor="files" className="text-sm font-semibold">
                  File Upload
                </Label>
                <UploadDropzoneProgress
                  control={uploadControl}
                  description="All file types are supported"
                  uploadOverride={(files) => {
                    // Handle files locally without server upload
                    const normalized = Array.isArray(files) ? files : Array.from(files);
                    handleFileUpload(normalized);
                  }}
                />
                {uploadedFiles.length > 0 && (
                  <div className="mt-2">
                    <FilePreviewList
                      files={uploadedFiles}
                      onRemove={handleRemoveFile}
                    />
                  </div>
                )}
              </div>
            </form>
          </div>
        </ScrollArea>

        {/* Footer with Submit and Cancel buttons */}
        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="project-allocation-form"
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

