import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type DrawingData = {
  annotations: string; // JSON string of Fabric.js objects
  layers: Array<{
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    revisionNumber?: number;
    color?: string;
  }>;
  currentRevision: number;
  revisions: Record<number, string>; // revision number -> annotations JSON
};

/**
 * POST /api/drawings/[drawingId]/fabric-drawing
 * Save Fabric.js drawing data and canvas image to Supabase
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ drawingId: string }> }
) {
  try {
    const { drawingId } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const drawingDataJson = formData.get("drawingData") as string;
    const canvasImageBlob = formData.get("canvasImage") as File | null;
    const revisionNumber = formData.get("revisionNumber") as string;
    const revisionStatus = formData.get("revisionStatus") as string || "REVISION";

    if (!drawingDataJson) {
      return NextResponse.json(
        { message: "Missing drawing data" },
        { status: 400 }
      );
    }

    const drawingData: DrawingData = JSON.parse(drawingDataJson);
    const revNumber = parseInt(revisionNumber) || drawingData.currentRevision || 1;

    let imageUrl: string | null = null;

    // Save canvas image to Supabase Storage if provided
    if (canvasImageBlob && canvasImageBlob.size > 0) {
      const imageFileName = `drawing-${drawingId}-rev-${revNumber}-${Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("drawings")
        .upload(imageFileName, canvasImageBlob, {
          contentType: "image/png",
          upsert: false,
        });

      if (uploadError) {
        console.error("Image upload error:", uploadError);
        // Continue even if image upload fails
      } else {
        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("drawings").getPublicUrl(imageFileName);
        imageUrl = publicUrl;
      }
    }

    // Save drawing data to database
    // First, check if we need to create or update the drawing_annotations table
    // We'll extend it to support Fabric.js data structure
    
    const annotationData = {
      drawing_id: drawingId,
      annotations: JSON.parse(drawingData.annotations), // Store as JSONB
      fabric_data: {
        layers: drawingData.layers,
        currentRevision: drawingData.currentRevision,
        revisions: drawingData.revisions,
      },
      image_url: imageUrl,
      pdf_url: imageUrl, // For backward compatibility
      revision_number: revNumber,
      revision_status: revisionStatus,
      corrected_date: new Date().toISOString(),
      editor_id: user.id,
      editor_name: user.user_metadata?.full_name || user.email || "Unknown",
      created_at: new Date().toISOString(),
    };

    // Try to update existing annotation for this revision, or insert new
    const { data: existingData, error: checkError } = await supabase
      .from("drawing_annotations")
      .select("id")
      .eq("drawing_id", drawingId)
      .eq("revision_number", revNumber)
      .single();

    let saveError;
    if (existingData) {
      // Update existing
      const { error } = await supabase
        .from("drawing_annotations")
        .update({
          annotations: annotationData.annotations,
          fabric_data: annotationData.fabric_data,
          image_url: annotationData.image_url,
          pdf_url: annotationData.pdf_url,
          revision_status: annotationData.revision_status,
          corrected_date: annotationData.corrected_date,
          editor_id: annotationData.editor_id,
          editor_name: annotationData.editor_name,
        })
        .eq("id", existingData.id);
      saveError = error;
    } else {
      // Insert new
      const { error } = await supabase
        .from("drawing_annotations")
        .insert(annotationData);
      saveError = error;
    }

    if (saveError) {
      console.error("Annotation save error:", saveError);
      // If table doesn't have fabric_data column, try without it
      const fallbackData = {
        drawing_id: drawingId,
        annotations: annotationData.annotations,
        image_url: imageUrl,
        pdf_url: imageUrl,
        revision_number: revNumber,
        revision_status: revisionStatus,
        corrected_date: new Date().toISOString(),
        editor_id: user.id,
        editor_name: user.user_metadata?.full_name || user.email || "Unknown",
        created_at: new Date().toISOString(),
      };

      if (existingData) {
        const { error: fallbackError } = await supabase
          .from("drawing_annotations")
          .update(fallbackData)
          .eq("id", existingData.id);
        if (fallbackError) {
          return NextResponse.json(
            { message: "Failed to save drawing data", error: fallbackError.message },
            { status: 500 }
          );
        }
      } else {
        const { error: fallbackError } = await supabase
          .from("drawing_annotations")
          .insert(fallbackData);
        if (fallbackError) {
          return NextResponse.json(
            { message: "Failed to save drawing data", error: fallbackError.message },
            { status: 500 }
          );
        }
      }
    }

    // Update drawing record
    const { error: updateError } = await supabase
      .from("drawings")
      .update({
        revision_status: revisionStatus,
        revision_number: revNumber,
        corrected_date: new Date().toISOString(),
        editor_id: user.id,
        editor_name: user.user_metadata?.full_name || user.email || "Unknown",
        pdf_path: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", drawingId);

    if (updateError) {
      console.error("Drawing update error:", updateError);
      // Don't fail the request, just log
    }

    return NextResponse.json({
      success: true,
      message: "Drawing saved successfully",
      imageUrl: imageUrl,
      revisionNumber: revNumber,
    });
  } catch (error) {
    console.error("Error saving Fabric drawing:", error);
    return NextResponse.json(
      {
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/drawings/[drawingId]/fabric-drawing
 * Load Fabric.js drawing data from Supabase
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ drawingId: string }> }
) {
  try {
    const { drawingId } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const revisionNumber = searchParams.get("revision");

    let query = supabase
      .from("drawing_annotations")
      .select("*")
      .eq("drawing_id", drawingId);

    if (revisionNumber) {
      query = query.eq("revision_number", parseInt(revisionNumber));
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching drawing data:", error);
      return NextResponse.json(
        { message: "Failed to fetch drawing data" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({
        annotations: "[]",
        layers: [{ id: "default", name: "Default", visible: true, locked: false }],
        currentRevision: 1,
        revisions: { 1: "[]" },
        imageUrl: null,
      });
    }

    // Extract Fabric.js data
    const fabricData = (data as any).fabric_data || {};
    const annotations = data.annotations || [];
    
    // Convert annotations array to JSON string for Fabric.js
    const annotationsJson = JSON.stringify(annotations);

    // Build revisions object
    const revisions: Record<number, string> = {};
    if (fabricData.revisions) {
      Object.assign(revisions, fabricData.revisions);
    }
    // Add current revision
    revisions[data.revision_number] = annotationsJson;

    const drawingData: DrawingData = {
      annotations: annotationsJson,
      layers: fabricData.layers || [
        { id: "default", name: "Default", visible: true, locked: false },
      ],
      currentRevision: fabricData.currentRevision || data.revision_number || 1,
      revisions: revisions,
    };

    return NextResponse.json({
      ...drawingData,
      imageUrl: (data as any).image_url || data.pdf_url || null,
      revisionNumber: data.revision_number,
    });
  } catch (error) {
    console.error("Error loading Fabric drawing:", error);
    return NextResponse.json(
      {
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

