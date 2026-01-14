"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Mail, User, MessageCircle } from "lucide-react";

type JobAvailabilityDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function JobAvailabilityDialog({
  open,
  onOpenChange,
}: JobAvailabilityDialogProps) {
  const router = useRouter();

  const handleCall = () => {
    // Open phone dialer with Vel's number
    window.location.href = "tel:+1234567890"; // Replace with actual phone number
  };

  const handleChat = () => {
    // Navigate to chat page
    onOpenChange(false); // Close the dialog first
    router.push("/chat");
  };

  const handleEmail = () => {
    // Open email client
    window.location.href = "mailto:vel@proultimaengineering.com";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 w-full">
          <DialogTitle>Job Availability</DialogTitle>
          <DialogDescription>
            Contact Vel for job availability information
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 px-6 pb-6 min-h-0">
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900">
                  <User className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Vel</h3>
                  <p className="text-sm text-muted-foreground">Job Availability Contact</p>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleCall}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="lg"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Call to Vel
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleChat}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Chat
                  </Button>
                  <Button
                    onClick={handleEmail}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    Send Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

