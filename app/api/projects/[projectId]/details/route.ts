import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getProjectById,
  getProjectMetrics,
  getDrawingsYetToReturnByProject,
  getDrawingsYetToReleaseByProject,
  getDrawingLogByProject,
  getInvoicesByProjectNumber,
  getSubmissionsByProject,
  getChangeOrdersByProject,
  getMaterialListsByProject,
} from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

/**
 * GET /api/projects/[projectId]/details
 * 
 * Fetches comprehensive project details including:
 * - Project overview
 * - Key metrics
 * - Drawings (yet to return, yet to release, log)
 * - Invoices
 * - Submissions
 * - Change orders
 * - Material lists
 * - Activity summary
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const supabase = await createSupabaseServerClient();

    // Fetch project
    const project = await getProjectById(supabase, projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Fetch all related data in parallel for better performance
    const [
      metrics,
      drawingsYetToReturn,
      drawingsYetToRelease,
      drawingLog,
      invoices,
      submissions,
      changeOrders,
      materialLists,
    ] = await Promise.all([
      getProjectMetrics(supabase, projectId),
      getDrawingsYetToReturnByProject(supabase, projectId),
      getDrawingsYetToReleaseByProject(supabase, projectId),
      getDrawingLogByProject(supabase, projectId),
      getInvoicesByProjectNumber(supabase, project.project_number),
      getSubmissionsByProject(supabase, projectId),
      getChangeOrdersByProject(supabase, projectId),
      getMaterialListsByProject(supabase, projectId),
    ]);

    // Calculate activity summary
    const recentActivity = [
      ...drawingLog.slice(0, 5).map((d) => ({
        type: "drawing_log",
        date: d.latest_submitted_date || d.created_at,
        description: `Drawing ${d.dwg} - ${d.description}`,
      })),
      ...submissions.slice(0, 5).map((s) => ({
        type: "submission",
        date: s.submission_date || s.created_at,
        description: `${s.submission_type} submission - ${s.drawing_number || 'N/A'}`,
      })),
      ...changeOrders.slice(0, 5).map((co) => ({
        type: "change_order",
        date: co.submitted_date || co.created_at,
        description: `Change Order ${co.change_order_id} - ${co.drawing_no}`,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    // Calculate additional metrics
    const approvedDrawings = submissions.filter(s => 
      s.submission_type?.toUpperCase() === 'APP' || s.status?.toUpperCase() === 'APPROVED'
    ).length;

    // Prepare response
    const projectData = project as any;
    const response = {
      project: {
        id: project.id,
        projectNumber: project.project_number,
        projectName: project.project_name,
        fabricatorName: projectData.fabricator_name || null,
        contractorName: project.contractor_name,
        projectLocation: projectData.project_location || null,
        estimatedTons: project.estimated_tons,
        detailedTonsPerApproval: projectData.detailed_tons_per_approval || null,
        detailedTonsPerLatestRev: projectData.detailed_tons_per_latest_rev || null,
        releasedTons: project.released_tons,
        detailingStatus: project.detailing_status,
        revisionStatus: project.revision_status,
        releaseStatus: project.release_status,
        dueDate: project.due_date,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      },
      metrics: {
        totalDrawings: metrics.totalDrawings,
        approvedDrawings: approvedDrawings,
        releasedDrawings: metrics.releasedDrawings,
        pendingDrawings: metrics.pendingDrawings,
        yetToReleaseCount: metrics.yetToReleaseCount,
        totalInvoices: metrics.totalInvoices,
        totalBilled: metrics.totalBilled,
        paidAmount: metrics.paidAmount,
        outstandingAmount: metrics.outstandingAmount,
      },
      counts: {
        drawingsYetToReturn: drawingsYetToReturn.length,
        drawingsYetToRelease: drawingsYetToRelease.length,
        drawingLogEntries: drawingLog.length,
        invoices: invoices.length,
        submissions: submissions.length,
        changeOrders: changeOrders.length,
        materialLists: materialLists.length,
      },
      recentActivity,
      summary: {
        completionPercentage: metrics.totalDrawings > 0 
          ? Math.round((metrics.releasedDrawings / metrics.totalDrawings) * 100) 
          : 0,
        approvalRate: metrics.totalDrawings > 0 
          ? Math.round((approvedDrawings / metrics.totalDrawings) * 100) 
          : 0,
        billingStatus: metrics.totalBilled > 0 
          ? Math.round((metrics.paidAmount / metrics.totalBilled) * 100) 
          : 0,
        activeSubmissions: submissions.filter(s => 
          s.submission_type === 'APP' || s.submission_type === 'RR'
        ).length,
        pendingChangeOrders: changeOrders.filter(co => 
          co.status === 'Pending' || co.status === 'APP'
        ).length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching project details:", error);
    return NextResponse.json(
      { error: "Failed to fetch project details" },
      { status: 500 }
    );
  }
}

