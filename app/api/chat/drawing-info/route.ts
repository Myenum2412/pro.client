import { NextResponse } from "next/server";
import { demoDrawings, demoProjects } from "@/public/assets";

export const dynamic = "force-dynamic";

/**
 * GET /api/chat/drawing-info?dwgNo=R-1&projectId=U2961
 * Get drawing information by drawing number and project ID
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dwgNo = searchParams.get("dwgNo");
    const projectId = searchParams.get("projectId");

    if (!dwgNo) {
      return NextResponse.json(
        { error: "Drawing number (dwgNo) is required" },
        { status: 400 }
      );
    }

    // Use projectId or try to find from demoDrawings
    let jobNumber = projectId || "U2961";
    
    // Search for drawing in demoDrawings
    const drawing = demoDrawings.find(
      (d) => d.jobNumber === jobNumber && d.dwgNo === dwgNo.toUpperCase() && d.section === "drawing_log"
    );

    if (!drawing) {
      return NextResponse.json(
        { error: "Drawing not found" },
        { status: 404 }
      );
    }

    // Find project info
    const project = demoProjects.find((p) => p.jobNumber === jobNumber);

    return NextResponse.json({
      dwgNo: drawing.dwgNo,
      status: drawing.status,
      description: drawing.description,
      elements: (drawing as any).elements || "",
      totalWeightTons: drawing.totalWeightTons,
      latestSubmittedDate: drawing.latestSubmittedDate,
      releaseStatus: drawing.releaseStatus,
      pdfPath: (drawing as any).pdfPath || "",
      projectName: project?.name || "",
      jobNumber: jobNumber,
    });
  } catch (error) {
    console.error("Error fetching drawing info:", error);
    return NextResponse.json(
      { error: "Failed to fetch drawing info" },
      { status: 500 }
    );
  }
}
