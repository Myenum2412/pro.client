import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAllDrawingLogs, getAllDrawingsYetToRelease, getAllDrawingsYetToReturn, calculateWeeksSince } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export type DrawingData = {
  id: string;
  dwgNo: string;
  status: "APP" | "REV" | "REJ" | "PND" | "FFU";
  description: string;
  totalWeightTons: number;
  latestSubmittedDate: string;
  weeksSinceSent: number;
  releaseStatus?: string;
  projectId?: string;
  projectName?: string;
  pdfPath?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dwgNo = searchParams.get("dwgNo");

    if (!dwgNo) {
      return NextResponse.json(
        { error: "Drawing number (dwgNo) is required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    
    // Fetch all drawings from all three tables
    const [drawingLogs, yetToRelease, yetToReturn] = await Promise.all([
      getAllDrawingLogs(supabase),
      getAllDrawingsYetToRelease(supabase),
      getAllDrawingsYetToReturn(supabase),
    ]);

    // Map status to valid status
    const statusMap: Record<string, DrawingData["status"]> = {
      "APP": "APP",
      "R&R": "REV",
      "REV": "REV",
      "REJ": "REJ",
      "PND": "PND",
      "FFU": "FFU",
    };

    // Search for drawing by dwgNo (case-insensitive)
    const searchDwgNo = dwgNo.trim().toUpperCase();
    
    // Check drawing logs
    const drawingLog = drawingLogs.find(
      (d) => d.dwg?.toUpperCase() === searchDwgNo
    );
    
    // Check yet to release
    const yetToReleaseDrawing = yetToRelease.find(
      (d) => d.dwg_no?.toUpperCase() === searchDwgNo
    );
    
    // Check yet to return
    const yetToReturnDrawing = yetToReturn.find(
      (d) => d.dwg_no?.toUpperCase() === searchDwgNo
    );

    let drawingData: DrawingData | null = null;

    if (drawingLog) {
      const logData = drawingLog as any;
      drawingData = {
        id: drawingLog.id,
        dwgNo: drawingLog.dwg,
        status: drawingLog.status ? (statusMap[drawingLog.status] ?? "PND") : "PND",
        description: drawingLog.description || "",
        totalWeightTons: drawingLog.total_weight || 0,
        latestSubmittedDate: drawingLog.latest_submitted_date || "",
        weeksSinceSent: calculateWeeksSince(drawingLog.latest_submitted_date),
        releaseStatus: logData.release_status || undefined,
        projectId: drawingLog.project_id || undefined,
        pdfPath: logData.pdf_path || undefined,
      };
    } else if (yetToReleaseDrawing) {
      const releaseData = yetToReleaseDrawing as any;
      drawingData = {
        id: yetToReleaseDrawing.id,
        dwgNo: yetToReleaseDrawing.dwg_no,
        status: "FFU" as const,
        description: yetToReleaseDrawing.description || "",
        totalWeightTons: yetToReleaseDrawing.total_weight_tons || 0,
        latestSubmittedDate: yetToReleaseDrawing.latest_submitted_date || "",
        weeksSinceSent: calculateWeeksSince(yetToReleaseDrawing.latest_submitted_date),
        releaseStatus: releaseData.release_status || undefined,
        projectId: yetToReleaseDrawing.project_id || undefined,
        pdfPath: releaseData.pdf_path || undefined,
      };
    } else if (yetToReturnDrawing) {
      const returnData = yetToReturnDrawing as any;
      drawingData = {
        id: yetToReturnDrawing.id,
        dwgNo: yetToReturnDrawing.dwg_no,
        status: "PND" as const,
        description: yetToReturnDrawing.description || "",
        totalWeightTons: yetToReturnDrawing.total_weight_tons || 0,
        latestSubmittedDate: yetToReturnDrawing.latest_submitted_date || "",
        weeksSinceSent: calculateWeeksSince(yetToReturnDrawing.latest_submitted_date),
        releaseStatus: returnData.release_status || undefined,
        projectId: yetToReturnDrawing.project_id || undefined,
        pdfPath: returnData.pdf_path || undefined,
      };
    }

    if (!drawingData) {
      return NextResponse.json(
        { error: "Drawing not found" },
        { status: 404 }
      );
    }

    // If we have a projectId, fetch project name
    if (drawingData.projectId) {
      const { data: project } = await supabase
        .from("projects")
        .select("project_name, project_number")
        .eq("id", drawingData.projectId)
        .single();
      
      if (project) {
        drawingData.projectName = project.project_name;
      }
    }

    return NextResponse.json(drawingData);
  } catch (error) {
    console.error("Error searching drawing:", error);
    return NextResponse.json(
      { error: "Failed to search drawing" },
      { status: 500 }
    );
  }
}

