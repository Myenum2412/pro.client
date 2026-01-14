import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

// DELETE /api/scans/history/[id] - Delete a specific scan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Scan ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("scan_history")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // Ensure user can only delete their own scans

    if (error) {
      console.error("Error deleting scan:", error);
      return NextResponse.json(
        { error: "Failed to delete scan" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in scan DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

