import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/search?q=query
 * 
 * Searches across all application data:
 * - Projects
 * - Drawings
 * - Invoices
 * - Submissions
 * - Change Orders
 * - RFI
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    const supabase = await createSupabaseServerClient();
    const searchPattern = `%${query}%`;

    // Search across multiple tables in parallel
    const [
      projectsResult,
      drawingsResult,
      invoicesResult,
      submissionsResult,
      changeOrdersResult,
      rfiResult,
    ] = await Promise.all([
      // Search Projects
      supabase
        .from("projects")
        .select("id, project_number, project_name, contractor_name, detailing_status")
        .or(`project_number.ilike.${searchPattern},project_name.ilike.${searchPattern},contractor_name.ilike.${searchPattern}`)
        .limit(10),

      // Search Drawing Log
      supabase
        .from("drawing_log")
        .select("id, project_id, dwg, description, status, projects(project_name, project_number)")
        .or(`dwg.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .limit(10),

      // Search Invoices
      supabase
        .from("invoices")
        .select("id, invoice_id, project_number, project_name, total_amount_billed, status")
        .or(`invoice_id.ilike.${searchPattern},project_number.ilike.${searchPattern},project_name.ilike.${searchPattern}`)
        .limit(10),

      // Search Submissions
      supabase
        .from("submissions")
        .select("id, project_id, drawing_number, submission_type, work_description, status, projects(project_name, project_number)")
        .or(`drawing_number.ilike.${searchPattern},work_description.ilike.${searchPattern}`)
        .limit(10),

      // Search Change Orders
      supabase
        .from("change_orders")
        .select("id, project_id, change_order_id, drawing_no, status, projects(project_name, project_number)")
        .or(`change_order_id.ilike.${searchPattern},drawing_no.ilike.${searchPattern}`)
        .limit(10),

      // Search RFI (if exists)
      supabase
        .from("submissions")
        .select("id, project_id, drawing_number, work_description, status, projects(project_name, project_number)")
        .eq("submission_type", "RFI")
        .or(`drawing_number.ilike.${searchPattern},work_description.ilike.${searchPattern}`)
        .limit(10),
    ]);

    // Check for errors and log them (but continue processing even if some queries fail)
    if (projectsResult.error) console.error("Projects search error:", projectsResult.error);
    if (drawingsResult.error) console.error("Drawings search error:", drawingsResult.error);
    if (invoicesResult.error) console.error("Invoices search error:", invoicesResult.error);
    if (submissionsResult.error) console.error("Submissions search error:", submissionsResult.error);
    if (changeOrdersResult.error) console.error("Change orders search error:", changeOrdersResult.error);
    if (rfiResult.error) console.error("RFI search error:", rfiResult.error);

    const results: any[] = [];

    // Format Projects
    if (projectsResult.data) {
      projectsResult.data.forEach((project) => {
        results.push({
          id: `project-${project.id}`,
          label: project.project_name,
          icon: "folder",
          description: `${project.project_number} • ${project.contractor_name || "N/A"}`,
          short: project.detailing_status || "",
          end: "Project",
          url: `/projects/${project.id}`,
          type: "project",
        });
      });
    }

    // Format Drawings
    if (drawingsResult.data) {
      drawingsResult.data.forEach((drawing: any) => {
        results.push({
          id: `drawing-${drawing.id}`,
          label: drawing.dwg,
          icon: "file-text",
          description: drawing.description || drawing.projects?.project_name || "",
          short: drawing.status || "",
          end: "Drawing",
          url: `/projects/${drawing.project_id}`,
          type: "drawing",
        });
      });
    }

    // Format Invoices
    if (invoicesResult.data) {
      invoicesResult.data.forEach((invoice) => {
        results.push({
          id: `invoice-${invoice.id}`,
          label: invoice.invoice_id,
          icon: "dollar-sign",
          description: `${invoice.project_name} • $${invoice.total_amount_billed?.toLocaleString() || 0}`,
          short: invoice.status || "",
          end: "Invoice",
          url: `/billing`,
          type: "invoice",
        });
      });
    }

    // Format Submissions
    if (submissionsResult.data) {
      submissionsResult.data.forEach((submission: any) => {
        results.push({
          id: `submission-${submission.id}`,
          label: submission.drawing_number || "N/A",
          icon: "send",
          description: submission.work_description || submission.projects?.project_name || "",
          short: submission.submission_type || "",
          end: "Submission",
          url: `/submissions`,
          type: "submission",
        });
      });
    }

    // Format Change Orders
    if (changeOrdersResult.data) {
      changeOrdersResult.data.forEach((co: any) => {
        results.push({
          id: `change-order-${co.id}`,
          label: co.change_order_id,
          icon: "alert-circle",
          description: `${co.drawing_no} • ${co.projects?.project_name || ""}`,
          short: co.status || "",
          end: "Change Order",
          url: `/projects/${co.project_id}`,
          type: "change-order",
        });
      });
    }

    // Format RFI
    if (rfiResult.data) {
      rfiResult.data.forEach((rfi: any) => {
        results.push({
          id: `rfi-${rfi.id}`,
          label: rfi.drawing_number || "RFI",
          icon: "help-circle",
          description: rfi.work_description || rfi.projects?.project_name || "",
          short: rfi.status || "",
          end: "RFI",
          url: `/rfi`,
          type: "rfi",
        });
      });
    }

    // Sort by relevance (exact matches first)
    const sortedResults = results.sort((a, b) => {
      const aExact = a.label.toLowerCase().includes(query.toLowerCase());
      const bExact = b.label.toLowerCase().includes(query.toLowerCase());
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    return NextResponse.json({ 
      results: sortedResults.slice(0, 50), // Limit to 50 results for comprehensive search
      total: sortedResults.length,
      query,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search", results: [] },
      { status: 500 }
    );
  }
}

