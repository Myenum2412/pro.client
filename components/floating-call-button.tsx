"use client";

import * as React from "react";
import { Phone } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingCallButtonProps {
  phoneNumber?: string;
  className?: string;
}

export function FloatingCallButton({ 
  phoneNumber = "+1-800-123-4567",
  className 
}: FloatingCallButtonProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCall = () => {
    // Open phone dialer or initiate call
    window.location.href = `tel:${phoneNumber}`;
  };

  // Don't render until mounted to avoid hydration issues
  if (!isMounted) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={cn("fixed bottom-6 left-6 z-50", className)}
    >
      <Button
        onClick={handleCall}
        size="lg"
        className="h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Call support"
        title={`Call ${phoneNumber}`}
      >
        <Phone className="h-20 w-20" />
      </Button>
    </motion.div>
  );
}

