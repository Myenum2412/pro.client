/**
 * Date formatting utilities for consistent date display across the application
 * Format: "Month, Date, Year" (e.g., "December 26, 2025")
 */

import { format as dateFnsFormat } from "date-fns";

/**
 * Standard date format: "Month, Date, Year"
 * Example: "December 26, 2025"
 */
export const STANDARD_DATE_FORMAT = "MMMM d, yyyy";

/**
 * Format a date to the standard format: "Month, Date, Year"
 * @param date - Date to format (Date object or string)
 * @returns Formatted date string (e.g., "December 26, 2025")
 */
export function formatDate(date: Date | string | undefined | null): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateFnsFormat(dateObj, STANDARD_DATE_FORMAT);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

/**
 * Format a date with time: "Month, Date, Year at HH:MM AM/PM"
 * @param date - Date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string | undefined | null): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateFnsFormat(dateObj, "MMMM d, yyyy 'at' h:mm a");
  } catch (error) {
    console.error("Error formatting date time:", error);
    return "";
  }
}

/**
 * Format a date for display in tables and lists
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatTableDate(date: Date | string | undefined | null): string {
  return formatDate(date);
}

/**
 * Format a date for export files
 * @param date - Date to format
 * @returns Formatted date string for filenames (e.g., "December_26_2025")
 */
export function formatExportDate(date: Date | string | undefined | null): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateFnsFormat(dateObj, "MMMM_d_yyyy");
  } catch (error) {
    console.error("Error formatting export date:", error);
    return "";
  }
}

