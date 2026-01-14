import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parsePaginationParams, createPaginatedResponse } from "@/lib/api/pagination";
import { requireUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export type RFIRow = {
  id: string;
  rfiNo: string;
  projectName: string;
  jobNo: string;
  client: string;
  impactedElement: string;
  drawingReference: string;
  date: string;
  status: string;
  // Additional fields for editing
  projectId?: string;
  proRfiNo?: string;
  placingDrawingReference?: string;
  contractDrawingReference?: string;
  question?: string;
  answer?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePaginationParams(searchParams);
    
    const supabase = await createSupabaseServerClient();
    
    // Fetch only RFI submissions with project data
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
        *,
        projects (
          project_number,
          project_name
        )
      `)
      .eq('submission_type', 'RFI')
      .order('submission_date', { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    // Map submissions to the expected format
    const rfiRows: RFIRow[] = (submissions || []).map((s: any) => {
      const project = s.projects as any;
      
      // Parse work_description JSON if it exists
      let rfiData: any = {};
      try {
        if (s.work_description) {
          rfiData = JSON.parse(s.work_description);
        }
      } catch {
        // If not JSON, treat as legacy format
        rfiData = { question: s.work_description || "" };
      }

      // Generate RFI No from PRO RFI # or use a default
      const proRfiNo = rfiData.proRfiNo || `${project?.project_number || ""}_CO#${s.id.slice(0, 6)}`;
      
      // Combine drawing references
      const drawingRef = rfiData.placingDrawingReference 
        ? `${rfiData.placingDrawingReference}${rfiData.contractDrawingReference ? ` / ${rfiData.contractDrawingReference}` : ""}`
        : s.drawing_number || "";

      return {
        id: s.id,
        rfiNo: proRfiNo,
        projectName: project?.project_name ?? "",
        jobNo: project?.project_number ?? "",
        client: rfiData.client || project?.client_name || "",
        impactedElement: rfiData.impactedElement || "",
        drawingReference: drawingRef,
        date: s.submission_date,
        status: s.status || "OPEN",
        // Additional fields for editing
        projectId: s.project_id,
        proRfiNo: rfiData.proRfiNo,
        placingDrawingReference: rfiData.placingDrawingReference || s.drawing_number || "",
        contractDrawingReference: rfiData.contractDrawingReference || "",
        question: rfiData.question || s.notes || "",
        answer: rfiData.answer || s.response || "",
      };
    });

    // Return paginated response
    const paginated = createPaginatedResponse(rfiRows, page, pageSize);
    return NextResponse.json(paginated);
  } catch (error) {
    console.error("Error fetching RFI submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch RFI submissions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Ensure user is authenticated
    await requireUser();
    
    const body = await request.json();
    const {
      project_id,
      submission_date,
      work_description,
      drawing_number,
      notes,
      submitted_by,
      status,
    } = body;

    // Validate required fields
    if (!project_id || !submission_date) {
      return NextResponse.json(
        { error: "Missing required fields: project_id, submission_date" },
        { status: 400 }
      );
    }

    // Validate work_description is JSON with required fields
    let rfiData: any = {};
    try {
      if (work_description) {
        rfiData = JSON.parse(work_description);
        if (!rfiData.proRfiNo || !rfiData.client || !rfiData.impactedElement || !rfiData.question) {
          return NextResponse.json(
            { error: "Missing required RFI fields: proRfiNo, client, impactedElement, question" },
            { status: 400 }
          );
        }
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid work_description format. Must be valid JSON." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Insert new RFI submission
    const { data: newRFI, error } = await supabase
      .from("submissions")
      .insert({
        project_id,
        submission_type: "RFI",
        work_description, // Store as JSON string
        drawing_number: drawing_number || rfiData.placingDrawingReference || null,
        submission_date,
        notes: notes || rfiData.question || null,
        submitted_by: submitted_by || "Vel, Rajesh",
        status: status || "OPEN",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return NextResponse.json(
      { message: "RFI created successfully", data: newRFI },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating RFI:", error);
    return NextResponse.json(
      { error: "Failed to create RFI submission" },
      { status: 500 }
    );
  }
}


