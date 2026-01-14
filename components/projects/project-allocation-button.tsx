"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectAllocationDialog } from "./project-allocation-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";

export function ProjectAllocationButton() {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: data.projectName,
          projectNumber: data.projectNumber,
          dueDate: data.dueDate,
          description: data.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      const result = await response.json();
      
      // Invalidate projects query to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
      
      toast.success("Project allocated successfully!");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to allocate project"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-white hover:bg-gray-100 text-emerald-600 border border-emerald-600 rounded-2xl"
      >
        <Plus className="mr-2 h-4 w-4" />
        Allocate Project
      </Button>
      <ProjectAllocationDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}

