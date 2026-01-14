/**
 * Google Calendar Holidays Utility
 * Checks if a date is a holiday using Google Calendar's public holiday calendar
 */

// Cache for holiday dates to avoid repeated API calls
const holidayCache = new Map<string, boolean>();
const holidayDatesCache = new Set<string>();
// Cache for holiday names: date -> holiday name
const holidayNamesCache = new Map<string, string>();

// Google Calendar public holiday calendar URL (US holidays)
const GOOGLE_CALENDAR_HOLIDAY_URL = 
  "https://calendar.google.com/calendar/ical/en.usa%23holiday%40group.v.calendar.google.com/public/basic.ics";

/**
 * Formats a date as YYYY-MM-DD for comparison
 */
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses iCal format and extracts holiday dates and names
 */
function parseICal(icalData: string): { dates: Set<string>; names: Map<string, string> } {
  const holidays = new Set<string>();
  const names = new Map<string, string>();
  const lines = icalData.split("\n");
  
  let currentDate: string | null = null;
  let currentName: string | null = null;
  let inEvent = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      currentDate = null;
      currentName = null;
    } else if (line === "END:VEVENT") {
      if (inEvent && currentDate) {
        holidays.add(currentDate);
        if (currentName) {
          names.set(currentDate, currentName);
        }
      }
      inEvent = false;
      currentDate = null;
      currentName = null;
    } else if (inEvent && line.startsWith("DTSTART")) {
      // Extract date from DTSTART:VALUE=DATE:20240101 or DTSTART;VALUE=DATE:20240101
      const dateMatch = line.match(/DTSTART[^:]*:(\d{8})/);
      if (dateMatch) {
        const dateStr = dateMatch[1];
        // Format as YYYY-MM-DD
        const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
        currentDate = formattedDate;
      }
    } else if (inEvent && line.startsWith("SUMMARY")) {
      // Extract holiday name from SUMMARY:New Year's Day
      const summaryMatch = line.match(/SUMMARY[^:]*:(.+)/);
      if (summaryMatch) {
        currentName = summaryMatch[1].trim();
      }
    }
  }
  
  return { dates: holidays, names };
}

/**
 * Fetches holidays from Google Calendar and caches them
 */
async function fetchHolidays(): Promise<Set<string>> {
  // Check if we already have holidays cached for the current year
  const currentYear = new Date().getFullYear();
  const cacheKey = `holidays-${currentYear}`;
  
  if (holidayDatesCache.size > 0) {
    return holidayDatesCache;
  }
  
  try {
    const response = await fetch(GOOGLE_CALENDAR_HOLIDAY_URL, {
      cache: "force-cache", // Cache the response
    });
    
    if (!response.ok) {
      console.warn("Failed to fetch Google Calendar holidays");
      return new Set();
    }
    
    const icalData = await response.text();
    const { dates, names } = parseICal(icalData);
    
    // Cache the holidays and names
    dates.forEach((date) => holidayDatesCache.add(date));
    names.forEach((name, date) => holidayNamesCache.set(date, name));
    
    return dates;
  } catch (error) {
    console.warn("Error fetching Google Calendar holidays:", error);
    return new Set();
  }
}

/**
 * Checks if a date is a holiday using Google Calendar
 * @param date - The date to check
 * @returns true if the date is a holiday, false otherwise
 */
export async function isHoliday(date: Date): Promise<boolean> {
  const dateKey = formatDateKey(date);
  
  // Check cache first
  if (holidayCache.has(dateKey)) {
    return holidayCache.get(dateKey) ?? false;
  }
  
  // Fetch holidays if not cached
  const holidays = await fetchHolidays();
  const isHolidayDate = holidays.has(dateKey);
  
  // Cache the result
  holidayCache.set(dateKey, isHolidayDate);
  
  return isHolidayDate;
}

/**
 * Synchronous version that uses cached holidays
 * Call fetchHolidays() first to populate the cache
 */
export function isHolidaySync(date: Date): boolean {
  const dateKey = formatDateKey(date);
  return holidayDatesCache.has(dateKey);
}

/**
 * Preloads holidays for a given year
 * Call this early in the app lifecycle for better performance
 */
export async function preloadHolidays(year?: number): Promise<void> {
  await fetchHolidays();
}

/**
 * Gets the holiday name for a specific date
 * @param date - The date to get the holiday name for
 * @returns The holiday name or null if not a holiday
 */
export function getHolidayName(date: Date): string | null {
  const dateKey = formatDateKey(date);
  return holidayNamesCache.get(dateKey) || null;
}

/**
 * Clears the holiday cache
 */
export function clearHolidayCache(): void {
  holidayCache.clear();
  holidayDatesCache.clear();
  holidayNamesCache.clear();
}

