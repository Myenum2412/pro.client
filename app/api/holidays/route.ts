import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

/**
 * API route to fetch holidays
 * Can be extended to fetch from database or external API
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const region = searchParams.get("region");

    // Read holidays from JSON file
    const holidaysPath = join(process.cwd(), "public", "holidays.json");
    const holidaysData = await readFile(holidaysPath, "utf-8");
    const { holidays } = JSON.parse(holidaysData);

    // Filter by year and region if provided
    let filteredHolidays = holidays;

    if (year) {
      const yearNum = parseInt(year, 10);
      filteredHolidays = filteredHolidays.filter((h: any) => {
        if (h.recurring) return true;
        if (h.year) return h.year === yearNum;
        // Check if date starts with the year
        if (h.date.startsWith(year)) return true;
        return false;
      });
    }

    if (region) {
      filteredHolidays = filteredHolidays.filter(
        (h: any) => !h.region || h.region === region
      );
    }

    return NextResponse.json(
      { holidays: filteredHolidays },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return NextResponse.json(
      { error: "Failed to fetch holidays" },
      { status: 500 }
    );
  }
}
