import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser();
    
    const { id } = await params;
    const body = await request.json();
    const {
      project_id,
      submission_date,
      work_description,
      drawing_number,
      notes,
      status,
    } = body;

    // Validate work_description is JSON
    let rfiData: any = {};
    try {
      if (work_description) {
        rfiData = JSON.parse(work_description);
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid work_description format. Must be valid JSON." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data: updatedRFI, error } = await supabase
      .from("submissions")
      .update({
        project_id,
        submission_date,
        work_description,
        drawing_number: drawing_number || rfiData.placingDrawingReference || null,
        notes: notes || rfiData.question || null,
        status: status || "OPEN",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("submission_type", "RFI")
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return NextResponse.json(
      { message: "RFI updated successfully", data: updatedRFI },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating RFI:", error);
    return NextResponse.json(
      { error: "Failed to update RFI submission" },
      { status: 500 }
    );
  }
}

