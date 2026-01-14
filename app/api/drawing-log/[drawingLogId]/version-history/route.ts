import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface DrawingLogVersionHistory {
  id: string;
  drawing_log_id: string;
  version_number: number;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  changed_fields: string[];
  change_summary: string;
  change_type: "INSERT" | "UPDATE" | "DELETE";
  editor_id: string | null;
  editor_name: string | null;
  editor_email: string | null;
  created_at: string;
  // Revision history fields
  revision?: number; // Rev 0, Rev 1, etc.
  dos?: string; // Date of Submission
  weight?: number;
  aeMarkupDate?: string; // AE mark-ups received date
  weightDifference?: number; // WD - Weight Difference
}

/**
 * GET /api/drawing-log/[drawingLogId]/version-history
 * Retrieve version history for a specific drawing log entry
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ drawingLogId: string }> }
) {
  try {
    const { drawingLogId } = await params;
    
    // Generate mock version history data based on drawingLogId
    // Extract job number and drawing number from the ID format: "jobNumber-section-dwgNo"
    // Handle drawing numbers with dashes (e.g., "R-1", "R-3A")
    const decodedId = decodeURIComponent(drawingLogId);
    
    // The format is "jobNumber-section-dwgNo" where section is typically "drawing-log" or "drawing_log"
    // The drawing number (dwgNo) can contain dashes (e.g., "R-1", "R-3A")
    // So we need to split by the section separator
    let dwgNo = "";
    let jobNumber = "U2961";
    
    // Try to find the section separator ("drawing-log" or "drawing_log")
    const sectionPattern = /drawing[-_]log/;
    const sectionMatch = decodedId.match(sectionPattern);
    
    if (sectionMatch) {
      // Split at the section separator
      const sectionIndex = sectionMatch.index!;
      const sectionLength = sectionMatch[0].length;
      const beforeSection = decodedId.substring(0, sectionIndex - 1); // -1 to remove the dash before section
      const afterSection = decodedId.substring(sectionIndex + sectionLength + 1); // +1 to skip the dash after section
      
      jobNumber = beforeSection;
      dwgNo = afterSection;
    } else {
      // Fallback: split by '-' and assume format is "jobNumber-*-dwgNo"
      const parts = decodedId.split('-');
      if (parts.length >= 3) {
        jobNumber = parts[0];
        // Everything after first two parts is the drawing number
        dwgNo = parts.slice(2).join('-');
      } else if (parts.length >= 2) {
        jobNumber = parts[0];
        dwgNo = parts.slice(1).join('-');
      } else {
        dwgNo = decodedId;
      }
    }
    
    // Revision history data based on image - mapping drawing numbers to their revision dates
    const revisionHistoryMap: Record<string, Array<{ date: string; weight?: number; aeMarkupDate?: string; weightDiff?: number }>> = {
      "R-1": [
        { date: "2023-03-06", weight: 112612 },
        { date: "2023-05-01", weight: 107078, weightDiff: 5534 },
        { date: "2023-06-15", weight: 121811, aeMarkupDate: "2023-06-15", weightDiff: 14733 },
      ],
      "R-2": [
        { date: "2023-03-06", weight: 101337 },
        { date: "2023-05-01", weight: 86132, weightDiff: 15205 },
        { date: "2023-06-15", weight: 117688, aeMarkupDate: "2023-06-15", weightDiff: 31556 },
      ],
      "R-3": [
        { date: "2023-03-06", weight: 80671 },
        { date: "2023-08-11", weight: 83192, aeMarkupDate: "2023-08-11", weightDiff: 2521 },
      ],
      "R-4": [
        { date: "2023-05-01", weight: 44940 },
        { date: "2023-06-15", weight: 42540, aeMarkupDate: "2023-06-15", weightDiff: 2400 },
      ],
      "R-5": [
        { date: "2023-05-01", weight: 47340 },
        { date: "2023-06-15", weight: 44940, aeMarkupDate: "2023-06-15", weightDiff: 2400 },
      ],
      "R-6": [
        { date: "2023-05-01", weight: 47911 },
        { date: "2023-06-15", weight: 45511, aeMarkupDate: "2023-06-15", weightDiff: 2400 },
      ],
      "R-7": [
        { date: "2023-05-01", weight: 47340 },
        { date: "2023-06-15", weight: 44940, aeMarkupDate: "2023-06-15", weightDiff: 2400 },
      ],
      "R-8": [
        { date: "2023-05-01", weight: 47911 },
        { date: "2023-06-15", weight: 45511, aeMarkupDate: "2023-06-15", weightDiff: 2400 },
      ],
      "R-9": [
        { date: "2023-05-01", weight: 47340 },
        { date: "2023-06-15", weight: 44940, aeMarkupDate: "2023-06-15", weightDiff: 2400 },
      ],
      "R-10": [
        { date: "2023-05-01", weight: 47911 },
        { date: "2023-06-15", weight: 45511, aeMarkupDate: "2023-06-15", weightDiff: 2400 },
      ],
      "R-11": [
        { date: "2023-05-01", weight: 47340 },
        { date: "2023-06-15", weight: 44940, aeMarkupDate: "2023-06-15", weightDiff: 2400 },
      ],
      "R-12": [
        { date: "2023-05-01", weight: 47911 },
        { date: "2023-06-15", weight: 45511, aeMarkupDate: "2023-06-15", weightDiff: 2400 },
      ],
      "R-3A": [
        { date: "2023-03-06", weight: 80671 },
        { date: "2023-08-11", weight: 83192, aeMarkupDate: "2023-08-11", weightDiff: 2521 },
      ],
      "R-3B": [
        { date: "2023-03-06", weight: 80671 },
        { date: "2023-08-11", weight: 83192, aeMarkupDate: "2023-08-11", weightDiff: 2521 },
      ],
      "R-13": [
        { date: "2023-03-06", weight: 44940 },
        { date: "2023-08-11", weight: 47340, aeMarkupDate: "2023-08-11", weightDiff: 2400 },
      ],
      "R-14": [
        { date: "2023-03-06", weight: 47911 },
        { date: "2023-08-11", weight: 50311, aeMarkupDate: "2023-08-11", weightDiff: 2400 },
      ],
    };
    
    const revisions = revisionHistoryMap[dwgNo] || [
      { date: "2023-07-27" },
      { date: "2023-09-06" },
    ];
    
    // Generate version history from revision data
    // Map revisions to match the table format: Rev 0, Rev 1, Rev 2, etc.
    const mockVersionHistory: DrawingLogVersionHistory[] = revisions.map((rev, index) => {
      const revisionNumber = index; // Rev 0, Rev 1, Rev 2, etc.
      const isFirstRevision = index === 0;
      
      return {
        id: `vh-${drawingLogId}-${revisionNumber}`,
        drawing_log_id: drawingLogId,
        version_number: revisionNumber + 1, // Keep version_number 1-based for compatibility
        revision: revisionNumber, // Rev 0, Rev 1, etc.
        old_data: isFirstRevision ? null : {
          weight: revisions[index - 1].weight,
          submitted_date: revisions[index - 1].date,
        },
        new_data: {
          dwgNo: dwgNo,
          weight: rev.weight,
          submitted_date: rev.date,
          aeMarkupDate: rev.aeMarkupDate,
          weightDifference: rev.weightDiff,
        },
        changed_fields: isFirstRevision ? [] : ["weight", "submitted_date", "aeMarkupDate", "weightDifference"],
        change_summary: isFirstRevision 
          ? `Initial submission of drawing ${dwgNo}` 
          : `Revision ${revisionNumber} submitted${rev.weightDiff ? ` with weight change of ${rev.weightDiff} lbs` : ''}`,
        change_type: isFirstRevision ? "INSERT" : "UPDATE",
        editor_id: `user-${revisionNumber + 1}`,
        editor_name: isFirstRevision ? "System Admin" : `Engineer ${revisionNumber + 1}`,
        editor_email: isFirstRevision ? "admin@example.com" : `engineer${revisionNumber + 1}@example.com`,
        created_at: new Date(rev.date).toISOString(),
        // Revision history fields
        dos: rev.date, // Date of Submission
        weight: rev.weight,
        aeMarkupDate: rev.aeMarkupDate,
        weightDifference: rev.weightDiff,
      };
    });

    return NextResponse.json({
      success: true,
      versionHistory: mockVersionHistory,
    });
  } catch (error) {
    console.error("Error fetching version history:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

