"use client";

import * as React from "react";
import { Printer, FileText, Settings, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface PrintOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint: (options: PrintOptions) => void;
  title?: string;
  fileName?: string;
}

export interface PrintOptions {
  printType: "all" | "current" | "pdf";
  orientation: "portrait" | "landscape";
  margins: "default" | "minimal" | "none";
  scale: number;
  pages?: string; // For custom page ranges like "1-3,5,7-9"
}

export function PrintOptionsDialog({
  open,
  onOpenChange,
  onPrint,
  title = "Print Options",
  fileName = "document",
}: PrintOptionsDialogProps) {
  const [printType, setPrintType] = React.useState<"all" | "current" | "pdf">("all");
  const [orientation, setOrientation] = React.useState<"portrait" | "landscape">("portrait");
  const [margins, setMargins] = React.useState<"default" | "minimal" | "none">("default");
  const [scale, setScale] = React.useState<number>(100);
  const [customPages, setCustomPages] = React.useState<string>("");

  const handlePrint = () => {
    const options: PrintOptions = {
      printType,
      orientation,
      margins,
      scale,
      pages: printType === "current" ? customPages : undefined,
    };
    onPrint(options);
    onOpenChange(false);
  };

  const handleQuickPrint = () => {
    const options: PrintOptions = {
      printType: "all",
      orientation: "portrait",
      margins: "default",
      scale: 100,
    };
    onPrint(options);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Configure print settings for {fileName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Print Type */}
          <div className="space-y-2">
            <Label>Print Type</Label>
            <Select value={printType} onValueChange={(value: "all" | "current" | "pdf") => setPrintType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Print All Pages
                  </div>
                </SelectItem>
                <SelectItem value="current">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Print Current Page
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Save as PDF
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Pages Input (only show for current page type) */}
          {printType === "current" && (
            <div className="space-y-2">
              <Label htmlFor="customPages">Page Range (e.g., 1-3,5,7-9)</Label>
              <input
                id="customPages"
                type="text"
                value={customPages}
                onChange={(e) => setCustomPages(e.target.value)}
                placeholder="1-3,5,7-9"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}

          <Separator />

          {/* Orientation */}
          <div className="space-y-2">
            <Label>Orientation</Label>
            <Select
              value={orientation}
              onValueChange={(value: "portrait" | "landscape") => setOrientation(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">Portrait</SelectItem>
                <SelectItem value="landscape">Landscape</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Margins */}
          <div className="space-y-2">
            <Label>Margins</Label>
            <Select
              value={margins}
              onValueChange={(value: "default" | "minimal" | "none") => setMargins(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scale */}
          <div className="space-y-2">
            <Label>Scale: {scale}%</Label>
            <input
              type="range"
              min="50"
              max="200"
              step="10"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50%</span>
              <span>100%</span>
              <span>200%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleQuickPrint}
            className="flex-1"
          >
            <Printer className="h-4 w-4 mr-2" />
            Quick Print
          </Button>
          <Button
            onClick={handlePrint}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
