"use client";

import * as React from "react";
import { Phone, Video, Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface FABOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color?: string;
  show?: boolean;
}

export interface FloatingActionButtonProps {
  // Main button props
  phoneNumber?: string;
  position?: "bottom-right" | "middle-right";
  className?: string;
  
  // Options configuration
  showCall?: boolean;
  showMeeting?: boolean;
  showNotification?: boolean;
  
  // Callbacks
  onCall?: () => void;
  onMeeting?: () => void;
  onNotification?: () => void;
  
  // Notification badge
  notificationCount?: number;
  
  // Theme customization
  primaryColor?: string;
  iconColor?: string;
  shadowStyle?: "soft" | "medium" | "strong";
  
  // Role-based visibility
  userRole?: string;
  allowedRoles?: string[];
  
  // Meeting URL
  meetingUrl?: string;
}

export function FloatingActionButton({
  phoneNumber = "+1-800-123-4567",
  position = "bottom-right",
  className,
  showCall = true,
  showMeeting = true,
  showNotification = true,
  onCall,
  onMeeting,
  onNotification,
  notificationCount = 0,
  primaryColor = "emerald",
  iconColor = "white",
  shadowStyle = "medium",
  userRole,
  allowedRoles,
  meetingUrl,
  ...props
}: FloatingActionButtonProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showCallConfirm, setShowCallConfirm] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close on outside click
  React.useEffect(() => {
    if (isExpanded) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsExpanded(false);
          setShowCallConfirm(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isExpanded]);

  // Keyboard navigation
  React.useEffect(() => {
    if (isExpanded) {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsExpanded(false);
          setShowCallConfirm(false);
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isExpanded]);

  // Role-based visibility check
  const isVisible = React.useMemo(() => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return userRole && allowedRoles.includes(userRole);
  }, [userRole, allowedRoles]);

  // Shadow styles
  const shadowClasses = {
    soft: "shadow-md hover:shadow-lg",
    medium: "shadow-lg hover:shadow-xl",
    strong: "shadow-xl hover:shadow-2xl",
  };

  // Color classes
  const colorClasses = {
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    indigo: "bg-indigo-600 hover:bg-indigo-700",
  };

  const handleCall = () => {
    if (onCall) {
      onCall();
    } else {
      setShowCallConfirm(true);
    }
  };

  const handleConfirmCall = () => {
    window.location.href = `tel:${phoneNumber}`;
    setShowCallConfirm(false);
    setIsExpanded(false);
  };

  const handleMeeting = () => {
    if (onMeeting) {
      onMeeting();
    } else if (meetingUrl) {
      window.open(meetingUrl, "_blank");
    } else {
      // Default: redirect to meeting page or open scheduling modal
      window.location.href = "/dashboard";
    }
    setIsExpanded(false);
  };

  const handleNotification = () => {
    if (onNotification) {
      onNotification();
    } else {
      // Default: could open notification drawer
      // Notification action can be implemented here
    }
    setIsExpanded(false);
  };

  // Build options array
  const options: FABOption[] = React.useMemo(() => {
    const opts: FABOption[] = [];
    
    if (showCall) {
      opts.push({
        id: "call",
        label: "Call",
        icon: Phone,
        onClick: handleCall,
        color: "emerald",
        show: true,
      });
    }
    
    if (showMeeting) {
      opts.push({
        id: "meeting",
        label: "Meeting",
        icon: Video,
        onClick: handleMeeting,
        color: "blue",
        show: true,
      });
    }
    
    if (showNotification) {
      opts.push({
        id: "notification",
        label: "Notifications",
        icon: Bell,
        onClick: handleNotification,
        color: "purple",
        show: true,
      });
    }
    
    return opts;
  }, [showCall, showMeeting, showNotification]);

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "middle-right": "top-1/2 -translate-y-1/2 right-6",
  };

  if (!isMounted || !isVisible) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed z-50 flex flex-col items-end gap-3",
        positionClasses[position],
        className
      )}
      role="group"
      aria-label="Floating action menu"
      {...props}
    >
      {/* Expanded Options */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="flex flex-col-reverse gap-3 mb-2"
          >
            {options.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{
                  duration: 0.15,
                  delay: index * 0.05,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={option.onClick}
                      size="icon"
                      className={cn(
                        "h-12 w-12 rounded-full text-white transition-all duration-200",
                        shadowClasses[shadowStyle],
                        option.color === "emerald" && "bg-emerald-500 hover:bg-emerald-600",
                        option.color === "blue" && "bg-blue-500 hover:bg-blue-600",
                        option.color === "purple" && "bg-purple-500 hover:bg-purple-600",
                        option.id === "notification" && notificationCount > 0 && "relative"
                      )}
                      aria-label={option.label}
                    >
                      <option.icon className="h-5 w-5" />
                      {option.id === "notification" && notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white border-2 border-white">
                          {notificationCount > 99 ? "99+" : notificationCount}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="bg-foreground text-background">
                    <p>{option.label}</p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

        {/* Call Confirmation Modal */}
        <AnimatePresence>
          {showCallConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
              onClick={() => setShowCallConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-background rounded-lg border p-6 max-w-sm w-full shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Confirm Call</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCallConfirm(false)}
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Do you want to call <strong>{phoneNumber}</strong>?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCallConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className={cn("flex-1", colorClasses[primaryColor as keyof typeof colorClasses] || colorClasses.emerald)}
                    onClick={handleConfirmCall}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Main FAB Button */}
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 17,
            }}
          >
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              size="lg"
              className={cn(
                "h-16 w-16 rounded-full text-white transition-all duration-200 relative",
                shadowClasses[shadowStyle],
                colorClasses[primaryColor as keyof typeof colorClasses] || colorClasses.emerald,
                isExpanded && "bg-opacity-90"
              )}
              aria-label={isExpanded ? "Close menu" : "Open action menu"}
              aria-expanded={isExpanded}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isExpanded ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Phone className="h-6 w-6" />
                )}
              </motion.div>
              {!isExpanded && notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white border-2 border-white">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-foreground text-background">
          <p>Quick Actions</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

