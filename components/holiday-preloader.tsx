"use client";

import { useEffect } from "react";
import { preloadHolidays } from "@/lib/utils/google-calendar-holidays";

/**
 * Preloads Google Calendar holidays when the app starts
 * This ensures holidays are available for calendar components
 */
export function HolidayPreloader() {
  useEffect(() => {
    // Preload holidays in the background
    preloadHolidays().catch((error) => {
      console.warn("Failed to preload holidays:", error);
    });
  }, []);

  return null;
}

