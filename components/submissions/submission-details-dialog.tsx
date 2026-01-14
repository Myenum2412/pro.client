"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { SubmissionRow } from "@/components/projects/sections";
import { 
  FileText, 
  Building2, 
  Calendar, 
  User,
  Download,
  Printer,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/utils/date-format";
import { getSubmissionTypeColor } from "@/lib/utils/submission-colors";

type SubmissionDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: SubmissionRow | null;
};

function getSubmissionTypeBadge(type: string) {
  const color = getSubmissionTypeColor(type);
  return <Badge className={color}>{type}</Badge>;
}

export function SubmissionDetailsDialog({
  open,
  onOpenChange,
  submission,
}: SubmissionDetailsDialogProps) {
  if (!submission) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate PDF download (placeholder - implement actual PDF generation)
    alert("PDF download functionality - to be implemented with actual PDF generation");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-xl w-full min-w-[95vw] max-h-[95vh] h-[90vh] p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 w-full border-b bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6 text-emerald-600" />
                Submission Details - {submission.drawingNo || "N/A"}
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Project: {submission.projectName} | Job No: {submission.jobNo}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {getSubmissionTypeBadge(submission.submissionType)}
            </div>
          </div>
        </DialogHeader>

        {/* Content - Full Screen View */}
        <div className="flex-1 px-6 pb-6 min-h-0 overflow-hidden">
          <div className="w-full h-full border rounded-md bg-white dark:bg-gray-950 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Project Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Building2 className="h-5 w-5" />
                  Project Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Project Name</p>
                    <p className="text-base font-semibold">{submission.projectName || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Job Number</p>
                    <p className="text-base font-semibold">{submission.jobNo || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Proultima PM</p>
                    <p className="text-base font-semibold flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {submission.proultimaPm || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Submission Date</p>
                    <p className="text-base font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {submission.submissionDate ? formatDate(submission.submissionDate) : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Submission Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <FileText className="h-5 w-5" />
                  Submission Details
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Submission Type</p>
                    <div className="mt-1">
                      {getSubmissionTypeBadge(submission.submissionType)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Drawing Number</p>
                    <p className="text-base font-semibold">{submission.drawingNo || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Work Description</p>
                    <p className="text-base whitespace-pre-wrap bg-muted/50 p-4 rounded-md border">
                      {submission.workDescription || "No description available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* PDF Preview if available */}
              {submission.pdfPath && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Attached Documents
                    </h3>
                    <div className="bg-muted/50 p-4 rounded-md border">
                      <p className="text-sm text-muted-foreground mb-2">PDF Document</p>
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 shrink-0 border-t bg-muted/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            {submission.pdfPath && (
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
