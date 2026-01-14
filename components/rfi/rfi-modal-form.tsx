"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type Project = {
  id: string;
  project_number: string;
  project_name: string;
  client_name?: string | null;
};

type RFIFormData = {
  projectId: string;
  jobNo: string;
  date: string;
  proRfiNo: string;
  client: string;
  impactedElement: string;
  placingDrawingReference: string;
  contractDrawingReference: string;
  question: string;
};

type RFIFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRfi?: {
    id: string;
    projectId: string;
    jobNo: string;
    date: string;
    proRfiNo: string;
    client: string;
    impactedElement: string;
    placingDrawingReference: string;
    contractDrawingReference: string;
    question: string;
  } | null;
  defaultProjectId?: string;
};

export function RfiModalForm({ open, onOpenChange, editingRfi, defaultProjectId }: RFIFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<RFIFormData>({
    projectId: "",
    jobNo: "",
    date: new Date().toISOString().split("T")[0],
    proRfiNo: "",
    client: "",
    impactedElement: "",
    placingDrawingReference: "",
    contractDrawingReference: "",
    question: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RFIFormData, string>>>({});

  // Fetch projects for the dropdown
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: queryKeys.projects(),
    queryFn: () => fetchJson<any[]>("/api/projects"),
    staleTime: 60_000,
  });

  // Update form when editing
  useEffect(() => {
    if (editingRfi) {
      setFormData({
        projectId: editingRfi.projectId,
        jobNo: editingRfi.jobNo,
        date: editingRfi.date,
        proRfiNo: editingRfi.proRfiNo,
        client: editingRfi.client,
        impactedElement: editingRfi.impactedElement,
        placingDrawingReference: editingRfi.placingDrawingReference,
        contractDrawingReference: editingRfi.contractDrawingReference,
        question: editingRfi.question,
      });
    } else {
      // Reset form for new RFI, pre-populate projectId if provided
      setFormData({
        projectId: defaultProjectId || "",
        jobNo: "",
        date: new Date().toISOString().split("T")[0],
        proRfiNo: "",
        client: "",
        impactedElement: "",
        placingDrawingReference: "",
        contractDrawingReference: "",
        question: "",
      });
    }
    setErrors({});
  }, [editingRfi, open]);

  // Update job number and client when project changes
  useEffect(() => {
    if (formData.projectId) {
      const project = projects.find((p) => p.id === formData.projectId);
      if (project) {
        setFormData((prev) => ({
          ...prev,
          jobNo: project.project_number || "",
          client: project.client_name || "",
        }));
      }
    }
  }, [formData.projectId, projects]);

  // Generate PRO RFI # when project and date are available
  useEffect(() => {
    if (formData.projectId && formData.date && !editingRfi) {
      const project = projects.find((p) => p.id === formData.projectId);
      if (project) {
        // Generate format: {JOB_NO}_CO#{NUMBER}
        // For now, use a simple format - in production, you'd query for the next number
        const dateStr = formData.date.replace(/-/g, "");
        const rfiNo = `${project.project_number}_CO#${dateStr.slice(-6)}`;
        setFormData((prev) => ({ ...prev, proRfiNo: rfiNo }));
      }
    }
  }, [formData.projectId, formData.date, projects, editingRfi]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RFIFormData, string>> = {};

    if (!formData.projectId) {
      newErrors.projectId = "Project is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    if (!formData.proRfiNo.trim()) {
      newErrors.proRfiNo = "PRO RFI # is required";
    }
    if (!formData.client.trim()) {
      newErrors.client = "Client is required";
    }
    if (!formData.impactedElement.trim()) {
      newErrors.impactedElement = "Impacted Element is required";
    }
    if (!formData.question.trim()) {
      newErrors.question = "Question is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create/Update RFI mutation
  const rfiMutation = useMutation({
    mutationFn: async (data: RFIFormData) => {
      const url = editingRfi ? `/api/rfi/${editingRfi.id}` : "/api/rfi";
      const method = editingRfi ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: data.projectId,
          submission_type: "RFI",
          submission_date: data.date,
          work_description: JSON.stringify({
            proRfiNo: data.proRfiNo,
            client: data.client,
            impactedElement: data.impactedElement,
            placingDrawingReference: data.placingDrawingReference,
            contractDrawingReference: data.contractDrawingReference,
            question: data.question,
          }),
          drawing_number: data.placingDrawingReference || null,
          notes: data.question,
          submitted_by: "Vel",
          status: "OPEN",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${editingRfi ? "update" : "create"} RFI`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(`RFI ${editingRfi ? "updated" : "created"} successfully`);
      queryClient.invalidateQueries({ queryKey: queryKeys.rfi() });
      
      // Clear localStorage cache
      if (typeof window !== "undefined") {
        // Clear all RFI cache entries
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("rfi_") || key === "rfi_data_cache" || key === "rfi_data_timestamp" || key === "rfi_table_cache" || key === "rfi_table_timestamp") {
            localStorage.removeItem(key);
          }
        });
        // Also clear paginated cache entries
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("rfi_table_cache_")) {
            localStorage.removeItem(key);
          }
        }
        // Dispatch event to notify other components
        window.dispatchEvent(new Event("rfiUpdate"));
        window.dispatchEvent(new Event("localStorageUpdate"));
      }
      
      onOpenChange(false);
      // Reset form
      if (!editingRfi) {
        setFormData({
          projectId: "",
          jobNo: "",
          date: new Date().toISOString().split("T")[0],
          proRfiNo: "",
          client: "",
          impactedElement: "",
          placingDrawingReference: "",
          contractDrawingReference: "",
          question: "",
        });
      }
      setErrors({});
    },
    onError: (error: Error) => {
      toast.error(error.message || `Failed to ${editingRfi ? "update" : "create"} RFI`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    rfiMutation.mutate(formData);
  };

  const handleClose = () => {
    if (!rfiMutation.isPending) {
      onOpenChange(false);
      setErrors({});
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !rfiMutation.isPending) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, rfiMutation.isPending]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-bold">PRO RFI</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {/* Form Grid - Matching PRO RFI Image Layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project" className="font-semibold">
                    Project <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, projectId: value }))
                    }
                    disabled={isLoadingProjects || rfiMutation.isPending}
                  >
                    <SelectTrigger id="project" className={errors.projectId ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.project_number} - {project.project_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.projectId && (
                    <p className="text-sm text-destructive">{errors.projectId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobNo" className="font-semibold">
                    Job # <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="jobNo"
                    value={formData.jobNo}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, jobNo: e.target.value }))
                    }
                    disabled={rfiMutation.isPending}
                    className={errors.jobNo ? "border-destructive" : ""}
                    required
                  />
                  {errors.jobNo && (
                    <p className="text-sm text-destructive">{errors.jobNo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="impactedElement" className="font-semibold">
                    Impacted Element <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="impactedElement"
                    value={formData.impactedElement}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, impactedElement: e.target.value }))
                    }
                    placeholder="e.g., FERRIC CHLORIDE FACILITY RIO PAD REINFORCEMENT DETAILS"
                    disabled={rfiMutation.isPending}
                    className={errors.impactedElement ? "border-destructive" : ""}
                    required
                  />
                  {errors.impactedElement && (
                    <p className="text-sm text-destructive">{errors.impactedElement}</p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="font-semibold">
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    disabled={rfiMutation.isPending}
                    className={errors.date ? "border-destructive" : ""}
                    required
                  />
                  {errors.date && (
                    <p className="text-sm text-destructive">{errors.date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proRfiNo" className="font-semibold">
                    PRO RFI # <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="proRfiNo"
                    value={formData.proRfiNo}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, proRfiNo: e.target.value }))
                    }
                    placeholder="e.g., L21119_CO#072"
                    disabled={rfiMutation.isPending}
                    className={errors.proRfiNo ? "border-destructive" : ""}
                    required
                  />
                  {errors.proRfiNo && (
                    <p className="text-sm text-destructive">{errors.proRfiNo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client" className="font-semibold">
                    Client <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, client: e.target.value }))
                    }
                    placeholder="e.g., PSG"
                    disabled={rfiMutation.isPending}
                    className={errors.client ? "border-destructive" : ""}
                    required
                  />
                  {errors.client && (
                    <p className="text-sm text-destructive">{errors.client}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Drawing References - Single Row, 2 Columns */}
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="placingDrawingReference" className="font-semibold">
                  Placing Drawing reference
                </Label>
                <Input
                  id="placingDrawingReference"
                  value={formData.placingDrawingReference}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      placingDrawingReference: e.target.value,
                    }))
                  }
                  placeholder="e.g., R-211_APP 01"
                  disabled={rfiMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractDrawingReference" className="font-semibold">
                  Contract Drawing reference
                </Label>
                <Input
                  id="contractDrawingReference"
                  value={formData.contractDrawingReference}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contractDrawingReference: e.target.value,
                    }))
                  }
                  placeholder="e.g., REVISED AS PER FERRIC RIO PAD LIFT DRAWINGS..."
                  disabled={rfiMutation.isPending}
                />
              </div>
            </div>

            {/* Question Section - Full Width */}
            <div className="mt-6 space-y-2">
              <Label htmlFor="question" className="font-semibold text-base">
                Question <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="question"
                value={formData.question}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, question: e.target.value }))
                }
                placeholder="Enter your question or request for information..."
                rows={8}
                disabled={rfiMutation.isPending}
                className={errors.question ? "border-destructive" : ""}
                required
              />
              {errors.question && (
                <p className="text-sm text-destructive">{errors.question}</p>
              )}
            </div>

            <DialogFooter className="px-0 pt-6 pb-4 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={rfiMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={rfiMutation.isPending}>
                {rfiMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingRfi ? "Update RFI" : "Submit RFI"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

