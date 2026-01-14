import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/submissions/[id]
 * Update a submission's date
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { submissionDate } = body;

    if (!submissionDate) {
      return NextResponse.json(
        { error: "submissionDate is required" },
        { status: 400 }
      );
    }

    // Validate date format
    const date = new Date(submissionDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Update submission date
    const { data: updatedSubmission, error } = await supabase
      .from("submissions")
      .update({
        submission_date: date.toISOString().split("T")[0], // YYYY-MM-DD format
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to update submission date" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Submission date updated successfully", data: updatedSubmission },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating submission date:", error);
    return NextResponse.json(
      { error: "Failed to update submission date" },
      { status: 500 }
    );
  }
}
