/**
 * Holiday Data Structure and Utilities
 * Supports national, state, and custom holidays
 */

export type HolidayType = "national" | "state" | "custom";

export interface Holiday {
  date: string; // YYYY-MM-DD format
  name: string;
  type: HolidayType;
  region?: string; // For state holidays (e.g., "CA", "NY")
  recurring?: boolean; // If true, applies to all years
  year?: number; // Specific year if not recurring
}

/**
 * Holiday dataset - can be extended with API or JSON config
 */
export const holidays: Holiday[] = [
  // National Holidays (US) - Recurring
  { date: "01-01", name: "New Year's Day", type: "national", recurring: true },
  { date: "01-15", name: "Martin Luther King Jr. Day", type: "national", recurring: true },
  { date: "02-19", name: "Presidents' Day", type: "national", recurring: true },
  { date: "05-27", name: "Memorial Day", type: "national", recurring: true },
  { date: "06-19", name: "Juneteenth", type: "national", recurring: true },
  { date: "07-04", name: "Independence Day", type: "national", recurring: true },
  { date: "09-02", name: "Labor Day", type: "national", recurring: true },
  { date: "10-14", name: "Columbus Day", type: "national", recurring: true },
  { date: "11-11", name: "Veterans Day", type: "national", recurring: true },
  { date: "11-28", name: "Thanksgiving", type: "national", recurring: true },
  { date: "12-25", name: "Christmas", type: "national", recurring: true },

  // State Holidays (Example - California)
  { date: "03-31", name: "Cesar Chavez Day", type: "state", region: "CA", recurring: true },
  { date: "09-09", name: "California Admission Day", type: "state", region: "CA", recurring: true },

  // Custom Holidays (Example)
  { date: "2025-01-20", name: "Company Holiday", type: "custom", recurring: false, year: 2025 },
  { date: "2025-12-24", name: "Christmas Eve", type: "custom", recurring: false, year: 2025 },
];

/**
 * Cache for processed holidays by year
 */
const holidayCache = new Map<number, Map<string, Holiday[]>>();

/**
 * Get the date key for a specific date
 */
function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get the month-day key (MM-DD) for recurring holidays
 */
function getMonthDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

/**
 * Process holidays for a specific year
 */
function processHolidaysForYear(year: number): Map<string, Holiday[]> {
  if (holidayCache.has(year)) {
    return holidayCache.get(year)!;
  }

  const holidaysByDate = new Map<string, Holiday[]>();

  holidays.forEach((holiday) => {
    let dateKey: string;

    if (holiday.recurring) {
      // Recurring holiday - use month-day format
      dateKey = `${year}-${holiday.date}`;
    } else if (holiday.year && holiday.year === year) {
      // Specific year holiday
      dateKey = holiday.date;
    } else if (holiday.year && holiday.year !== year) {
      // Skip holidays for other years
      return;
    } else {
      // Full date format
      dateKey = holiday.date;
    }

    if (!holidaysByDate.has(dateKey)) {
      holidaysByDate.set(dateKey, []);
    }
    holidaysByDate.get(dateKey)!.push(holiday);
  });

  holidayCache.set(year, holidaysByDate);
  return holidaysByDate;
}

/**
 * Get holidays for a specific date
 */
export function getHolidaysForDate(date: Date, region?: string): Holiday[] {
  const year = date.getFullYear();
  const dateKey = getDateKey(date);
  const monthDayKey = getMonthDayKey(date);

  const holidaysByDate = processHolidaysForYear(year);
  const allHolidays: Holiday[] = [];

  // Check for full date match
  if (holidaysByDate.has(dateKey)) {
    allHolidays.push(...holidaysByDate.get(dateKey)!);
  }

  // Check for recurring holidays (month-day match)
  holidays.forEach((holiday) => {
    if (holiday.recurring && holiday.date === monthDayKey) {
      // Filter by region if specified
      if (region && holiday.region && holiday.region !== region) {
        return;
      }
      if (!region || !holiday.region || holiday.region === region) {
        allHolidays.push(holiday);
      }
    }
  });

  return allHolidays;
}

/**
 * Check if a date is a holiday
 */
export function isHoliday(date: Date, region?: string): boolean {
  return getHolidaysForDate(date, region).length > 0;
}

/**
 * Get holiday names for a date (supports multiple holidays)
 */
export function getHolidayNames(date: Date, region?: string): string[] {
  return getHolidaysForDate(date, region).map((h) => h.name);
}

/**
 * Get the primary holiday name (first holiday or most important)
 */
export function getPrimaryHolidayName(date: Date, region?: string): string | null {
  const holidayList = getHolidaysForDate(date, region);
  if (holidayList.length === 0) return null;

  // Prioritize national holidays
  const nationalHoliday = holidayList.find((h) => h.type === "national");
  if (nationalHoliday) return nationalHoliday.name;

  return holidayList[0].name;
}

/**
 * Load holidays from API or JSON
 * @param url - URL to fetch holidays from (e.g., "/holidays.json" or "/api/holidays")
 */
export async function loadHolidaysFromAPI(url: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn("Failed to load holidays from API");
      return;
    }
    const data = await response.json();
    // Handle both direct array and object with holidays property
    const holidaysArray = Array.isArray(data) ? data : (data.holidays || []);
    if (Array.isArray(holidaysArray)) {
      // Avoid duplicates by checking date and name
      const existingKeys = new Set(
        holidays.map((h) => `${h.date}-${h.name}-${h.type}`)
      );
      const newHolidays = holidaysArray.filter(
        (h: Holiday) => !existingKeys.has(`${h.date}-${h.name}-${h.type}`)
      );
      holidays.push(...newHolidays);
      // Clear cache to force reprocessing
      holidayCache.clear();
    }
  } catch (error) {
    console.error("Error loading holidays from API:", error);
  }
}

/**
 * Add a custom holiday
 */
export function addHoliday(holiday: Holiday): void {
  holidays.push(holiday);
  // Clear cache to force reprocessing
  holidayCache.clear();
}

/**
 * Clear holiday cache
 */
export function clearHolidayCache(): void {
  holidayCache.clear();
}

/**
 * Get all holidays for a year
 */
export function getHolidaysForYear(year: number, region?: string): Holiday[] {
  const holidaysByDate = processHolidaysForYear(year);
  const allHolidays: Holiday[] = [];

  holidaysByDate.forEach((holidayList) => {
    holidayList.forEach((holiday) => {
      if (!region || !holiday.region || holiday.region === region) {
        allHolidays.push(holiday);
      }
    });
  });

  // Also include recurring holidays
  holidays.forEach((holiday) => {
    if (holiday.recurring) {
      if (!region || !holiday.region || holiday.region === region) {
        allHolidays.push({ ...holiday, date: `${year}-${holiday.date}` });
      }
    }
  });

  return allHolidays;
}
