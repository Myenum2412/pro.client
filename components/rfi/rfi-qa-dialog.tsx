"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils/date-format";
import type { RFIRow } from "./rfi-columns";
import { FileText, Calendar, Building2, Hash, User } from "lucide-react";

type RFIQADialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rfi: RFIRow | null;
};

function statusBadge(status: string) {
  const normalized = status.toLowerCase();
  
  if (normalized.includes("approved") || normalized.includes("closed")) {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-transparent">
        {status}
      </Badge>
    );
  }
  if (normalized.includes("pending") || normalized.includes("open")) {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-transparent">
        {status}
      </Badge>
    );
  }
  if (normalized.includes("reject") || normalized.includes("cancelled")) {
    return (
      <Badge className="bg-red-100 text-red-700 border-transparent">
        {status}
      </Badge>
    );
  }
  if (normalized.includes("review") || normalized.includes("in progress")) {
    return (
      <Badge className="bg-blue-100 text-blue-700 border-transparent">
        {status}
      </Badge>
    );
  }
  return (
    <Badge className="bg-zinc-100 text-zinc-700 border-transparent">
      {status}
    </Badge>
  );
}

export function RFIQADialog({ open, onOpenChange, rfi }: RFIQADialogProps) {
  // Use dummy data if rfi is null or missing fields
  const displayRfi = rfi ? {
    ...rfi,
    question: rfi.question || "What are the specific requirements for the structural connections in the main building frame? Please provide details on the welding specifications, bolt sizes, and any special considerations for the connection design.",
    answer: rfi.answer || "Based on the project specifications and current design standards, the answer to this RFI is as follows:\n\n1. The structural requirements have been reviewed and meet all applicable codes.\n2. The material specifications are in accordance with the project requirements.\n3. Additional clarification has been provided in the attached documentation.\n\nPlease review and confirm if any further information is needed.",
    projectName: rfi.projectName || "Sample Project",
    jobNo: rfi.jobNo || "U2524",
    client: rfi.client || "Sample Client",
    impactedElement: rfi.impactedElement || "Structural Frame Connections",
    drawingReference: rfi.drawingReference || "DWG-001",
    status: rfi.status || "OPEN",
    rfiNo: rfi.rfiNo || "RFI-001",
    date: rfi.date || new Date().toISOString(),
  } : {
    rfiNo: "RFI-001",
    projectName: "Sample Project",
    jobNo: "U2524",
    client: "Sample Client",
    impactedElement: "Structural Frame Connections",
    drawingReference: "DWG-001",
    date: new Date().toISOString(),
    status: "OPEN",
    question: "What are the specific requirements for the structural connections in the main building frame? Please provide details on the welding specifications, bolt sizes, and any special considerations for the connection design.",
    answer: "Based on the project specifications and current design standards, the answer to this RFI is as follows:\n\n1. The structural requirements have been reviewed and meet all applicable codes.\n2. The material specifications are in accordance with the project requirements.\n3. Additional clarification has been provided in the attached documentation.\n\nPlease review and confirm if any further information is needed.",
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              RFI #{displayRfi.rfiNo}
            </DialogTitle>
            {statusBadge(displayRfi.status)}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* RFI Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Project</div>
                  <div className="font-medium">{displayRfi.projectName}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Job Number</div>
                  <div className="font-medium">{displayRfi.jobNo}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Client</div>
                  <div className="font-medium">{displayRfi.client || "—"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Date</div>
                  <div className="font-medium">
                    {formatDate(displayRfi.date) || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Impacted Element */}
            {displayRfi.impactedElement && (
              <div>
                <div className="text-sm font-semibold mb-2">Impacted Element</div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  {displayRfi.impactedElement}
                </div>
              </div>
            )}

            {/* Drawing References */}
            {(displayRfi.drawingReference || (displayRfi as any).placingDrawingReference || (displayRfi as any).contractDrawingReference) && (
              <div>
                <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Drawing References
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {displayRfi.drawingReference && (
                    <div className="p-4 bg-muted/30 rounded-lg min-w-0">
                      <div className="text-xs text-muted-foreground mb-1">Drawing Reference</div>
                      <div className="font-medium break-words">{displayRfi.drawingReference}</div>
                    </div>
                  )}
                  {(displayRfi as any).placingDrawingReference && (
                    <div className="p-4 bg-muted/30 rounded-lg min-w-0">
                      <div className="text-xs text-muted-foreground mb-1">Placing Drawing Reference</div>
                      <div className="font-medium break-words">{(displayRfi as any).placingDrawingReference}</div>
                    </div>
                  )}
                  {(displayRfi as any).contractDrawingReference && (
                    <div className="p-4 bg-muted/30 rounded-lg min-w-0">
                      <div className="text-xs text-muted-foreground mb-1">Contract Drawing Reference</div>
                      <div className="font-medium break-words">{(displayRfi as any).contractDrawingReference}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Question Section */}
            <div>
              <div className="text-lg font-semibold mb-3 text-emerald-700">
                Question
              </div>
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {displayRfi.question}
                </div>
              </div>
            </div>

            {/* Answer Section */}
            <div>
              <div className="text-lg font-semibold mb-3 text-blue-700">
                Answer
              </div>
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {displayRfi.answer}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

