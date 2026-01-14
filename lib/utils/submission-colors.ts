/**
 * Submission Type & Status Color Utilities
 * 
 * Color scheme:
 * - APP (Approval): Yellow
 * - RR (Review & Return): Orange  
 * - FFU (For Field Use): Green
 * 
 * Applied to:
 * - Submission types
 * - Drawing statuses
 * - Status badges
 * - Table indicators
 */

/**
 * Get badge color classes for submission type
 * @param type - Submission type (For Approval (APP), Material List, etc.)
 * @returns Tailwind CSS classes for badge styling
 */
export function getSubmissionTypeColor(type: string): string {
  const upperType = type?.toUpperCase().trim();
  
  // New submission types
  if (upperType.includes("FOR APPROVAL") || upperType.includes("APPROVAL") || upperType === "APP" || upperType.includes("(APP)")) {
    return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200";
  }
  
  if (upperType.includes("MATERIAL LIST") || upperType === "MATERIAL LIST" || upperType.includes("MATERIAL")) {
    return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200";
  }
  
  // Legacy types for backward compatibility
  switch (upperType) {
    case "RR":
    case "R&R":
    case "REVIEW & RETURN":
    case "REVIEW AND RETURN":
      return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200";
    
    case "FFU":
    case "FIELD USE":
    case "FOR FIELD USE":
      return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200";
    
    default:
      return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-gray-200";
  }
}

/**
 * Get text color class for submission type
 * @param type - Submission type
 * @returns Tailwind CSS text color class
 */
export function getSubmissionTypeTextColor(type: string): string {
  const upperType = type?.toUpperCase().trim();
  
  // New submission types
  if (upperType.includes("FOR APPROVAL") || upperType.includes("APPROVAL") || upperType === "APP" || upperType.includes("(APP)")) {
    return "text-yellow-700 dark:text-yellow-300";
  }
  
  if (upperType.includes("MATERIAL LIST") || upperType === "MATERIAL LIST" || upperType.includes("MATERIAL")) {
    return "text-purple-700 dark:text-purple-300";
  }
  
  // Legacy types for backward compatibility
  switch (upperType) {
    case "RR":
    case "R&R":
    case "REVIEW & RETURN":
    case "REVIEW AND RETURN":
      return "text-orange-700 dark:text-orange-300";
    
    case "FFU":
    case "FIELD USE":
    case "FOR FIELD USE":
      return "text-green-700 dark:text-green-300";
    
    default:
      return "text-gray-700 dark:text-gray-300";
  }
}

/**
 * Get background color class for submission type
 * @param type - Submission type
 * @returns Tailwind CSS background color class
 */
export function getSubmissionTypeBgColor(type: string): string {
  const upperType = type?.toUpperCase().trim();
  
  // New submission types
  if (upperType.includes("FOR APPROVAL") || upperType.includes("APPROVAL") || upperType === "APP" || upperType.includes("(APP)")) {
    return "bg-yellow-50 dark:bg-yellow-950";
  }
  
  if (upperType.includes("MATERIAL LIST") || upperType === "MATERIAL LIST" || upperType.includes("MATERIAL")) {
    return "bg-purple-50 dark:bg-purple-950";
  }
  
  // Legacy types for backward compatibility
  switch (upperType) {
    case "RR":
    case "R&R":
    case "REVIEW & RETURN":
    case "REVIEW AND RETURN":
      return "bg-orange-50 dark:bg-orange-950";
    
    case "FFU":
    case "FIELD USE":
    case "FOR FIELD USE":
      return "bg-green-50 dark:bg-green-950";
    
    default:
      return "bg-gray-50 dark:bg-gray-950";
  }
}

/**
 * Get status color for any status type (submission type or drawing status)
 * Unified function that handles APP, RR, FFU consistently
 * @param status - Status string (APP, RR, FFU, etc.)
 * @returns Tailwind CSS classes for badge styling
 */
export function getStatusColor(status: string): string {
  return getSubmissionTypeColor(status);
}

/**
 * Submission type color mapping
 */
export const SUBMISSION_TYPE_COLORS = {
  APP: {
    badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
    text: "text-yellow-700",
    bg: "bg-yellow-50",
    name: "Approval",
  },
  RR: {
    badge: "bg-orange-100 text-orange-800 border-orange-300",
    text: "text-orange-700",
    bg: "bg-orange-50",
    name: "Review & Return",
  },
  FFU: {
    badge: "bg-green-100 text-green-800 border-green-300",
    text: "text-green-700",
    bg: "bg-green-50",
    name: "For Field Use",
  },
} as const;

/**
 * Status color mapping (same as submission types for consistency)
 */
export const STATUS_COLORS = SUBMISSION_TYPE_COLORS;

