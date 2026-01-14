import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parsePaginationParams, createPaginatedResponse } from "@/lib/api/pagination";
import { getSubmissions } from "@/lib/supabase/queries";
import { demoSubmissions } from "@/public/assets";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable caching

export type SubmissionRow = {
  id: string;
  proultimaPm: string;
  jobNo: string;
  projectName: string;
  submissionType: string;
  workDescription: string;
  drawingNo: string;
  submissionDate: string;
};

// Get project name from job number
function getProjectNameFromJobNumber(jobNumber: string): string {
  const projectNames: Record<string, string> = {
    "U2524": "Valley View Business Park Tilt Panels",
    "U2532": "MID-WAY SOUTH LOGISTIC CENTER, PANELS",
    "U3223P": "PANATTONI LEHIGH 309 BUILDING B TILT PANELS",
    "PRO-2025-002": "Commercial Warehouse Complex",
    "PRO-2025-003": "Industrial Manufacturing Facility",
    "PRO-2025-004": "Retail Distribution Center",
    "PRO-2025-005": "Office Building Complex",
  };
  return projectNames[jobNumber] || `Project ${jobNumber}`;
}

// Map submission types to new format
function mapSubmissionType(type: string | null | undefined): string {
  if (!type) return "For Approval (APP)";
  
  const upperType = type.toUpperCase().trim();
  
  // Map legacy types to new format
  if (upperType === "APP" || upperType.includes("APPROVAL") || upperType.includes("FOR APPROVAL")) {
    return "For Approval (APP)";
  }
  if (upperType.includes("MATERIAL") || upperType.includes("MATERIAL LIST") || upperType === "MATERIAL LIST") {
    return "Material List";
  }
  
  // Map other common types
  if (upperType === "RR" || upperType === "R&R" || upperType.includes("REVIEW")) {
    return "For Approval (APP)"; // Map R&R to For Approval
  }
  if (upperType === "FFU" || upperType.includes("FIELD USE")) {
    return "For Approval (APP)"; // Map FFU to For Approval
  }
  if (upperType === "RFI" || upperType.includes("RFI")) {
    return "For Approval (APP)"; // Map RFI to For Approval
  }
  if (upperType === "ENQUIRY" || upperType.includes("ENQUIRY")) {
    return "For Approval (APP)"; // Map Enquiry to For Approval
  }
  if (upperType === "SUBMITTAL" || upperType.includes("SUBMITTAL")) {
    return "Material List"; // Map Submittal to Material List
  }
  
  // If already in new format, return as is
  if (type === "For Approval (APP)" || type === "Material List") {
    return type;
  }
  
  // Default: map unknown types to "For Approval (APP)"
  return "For Approval (APP)";
}

// Transform database submission to SubmissionRow format
function transformSubmissionFromDB(dbRow: any): SubmissionRow {
  // Extract project data from the nested projects object
  const project = dbRow.projects;
  
  return {
    id: dbRow.id || "",
    proultimaPm: project?.client_name || "PROULTIMA PM",
    jobNo: project?.project_number || "",
    projectName: project?.project_name || "",
    submissionType: mapSubmissionType(dbRow.submission_type),
    workDescription: dbRow.work_description || "",
    drawingNo: dbRow.drawing_number || "",
    submissionDate: dbRow.submission_date || new Date().toISOString(),
  };
}

// Transform demo submission to SubmissionRow format
function transformDemoSubmission(sub: any, index: number): SubmissionRow {
  return {
    id: `demo-submission-${index + 1}`,
    proultimaPm: sub.proultimaPm || "Vel, Rajesh",
    jobNo: sub.jobNumber || "U2524",
    projectName: getProjectNameFromJobNumber(sub.jobNumber || "U2524"),
    submissionType: mapSubmissionType(sub.submissionType),
    workDescription: sub.workDescription || "",
    drawingNo: sub.drawingNo || "",
    submissionDate: sub.submissionDate || new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePaginationParams(searchParams);
    
    console.log(`[Submissions API] Fetching submissions - page: ${page}, pageSize: ${pageSize}`);
    
    // Try to fetch from Supabase database first
    let submissionRows: SubmissionRow[] = [];
    let useDatabase = false;
    
    try {
      const supabase = await createSupabaseServerClient();
      const result = await getSubmissions(supabase, page, pageSize);
      
      console.log(`[Submissions API] Database query result: ${result.data?.length || 0} records`);
      
      // Check if we have actual data from database
      if (result.data && result.data.length > 0) {
        submissionRows = result.data.map((row: any) => transformSubmissionFromDB(row));
        useDatabase = true;
        console.log(`[Submissions API] Using database data: ${submissionRows.length} submissions`);
      } else {
        console.log("[Submissions API] Database is empty, falling back to demo data");
      }
    } catch (dbError) {
      console.error("[Submissions API] Database query failed:", dbError);
      console.log("[Submissions API] Falling back to demo data");
    }
    
    // Fallback to demo data if database is empty or failed
    if (!useDatabase) {
      submissionRows = demoSubmissions.map((sub, index) => transformDemoSubmission(sub, index));
      console.log(`[Submissions API] Using demo data: ${submissionRows.length} submissions`);
    }

    // Return paginated response with no-cache headers
    const paginated = createPaginatedResponse(submissionRows, page, pageSize);
    return NextResponse.json(paginated, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("[Submissions API] Unexpected error:", error);
    
    // Final fallback to demo data on any unexpected error
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePaginationParams(searchParams);
    const demoRows = demoSubmissions.map((sub, index) => transformDemoSubmission(sub, index));
    
    const paginated = createPaginatedResponse(demoRows, page, pageSize);
    return NextResponse.json(paginated, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}

