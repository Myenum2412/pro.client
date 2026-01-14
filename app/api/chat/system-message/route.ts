import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let body: { text?: string; projectId?: string | null } | null = null;
    
    try {
      body = await request.json();
    } catch {
      // If JSON parsing fails, try to get text from URL params or return early
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const text = String(body?.text ?? "").trim();
    if (!text) {
      // Return success but don't create a message if text is empty
      return NextResponse.json({ message: "No text provided, skipping message" }, { status: 200 });
    }

    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Insert system message into Supabase
    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        project_id: body?.projectId || null,
        role: "system",
        text: text,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      id: newMessage.id,
      role: "system",
      text: newMessage.text,
      created_at: newMessage.created_at,
    });
  } catch (error) {
    console.error("Error saving system message:", error);
    return NextResponse.json(
      { message: "Failed to save system message" },
      { status: 500 }
    );
  }
}

