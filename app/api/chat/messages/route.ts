import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createInfiniteResponse } from "@/lib/api/pagination";
import { demoChatMessages, demoDrawings, demoProjects } from "@/public/assets";

export const dynamic = "force-dynamic";

type ChatMessageRow = {
  id: string;
  role: "me" | "system";
  text: string;
  created_at: string;
};

// In-memory storage for demo mode messages (persists during server runtime)
const demoModeMessages: Map<string, ChatMessageRow[]> = new Map();

function getDemoMessages(projectId: string | null): ChatMessageRow[] {
  const key = projectId || "_global";
  if (!demoModeMessages.has(key)) {
    // Initialize with demo messages from assets
    const initialMessages = demoChatMessages
      .filter((msg) => {
        if (projectId) return msg.projectId === projectId;
        return !msg.projectId || msg.projectId === null;
      })
      .map((msg) => ({
        id: msg.id,
        role: msg.role,
        text: msg.text,
        created_at: msg.created_at,
      }));
    demoModeMessages.set(key, initialMessages);
  }
  return demoModeMessages.get(key) || [];
}

function addDemoMessage(projectId: string | null, message: ChatMessageRow): void {
  const key = projectId || "_global";
  const messages = getDemoMessages(projectId);
  messages.push(message);
  demoModeMessages.set(key, messages);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(20, parseInt(searchParams.get("limit") || "20", 10));

    // Try Supabase first, fallback to demo mode if not configured
    let supabase;
    let user;
    
    try {
      supabase = await createSupabaseServerClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (error) {
      console.log("Supabase not configured, using demo mode for GET");
      user = null;
    }

    // If user exists, use Supabase
    if (user && supabase) {
      // Build query
      let query = supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      // Filter by projectId if provided
      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      // Try to fetch from database, but always fallback to mock data
      const { data: messages, error } = await query;

      let chatMessages: ChatMessageRow[] = [];

      // Use mock data from assets.ts (always available for demo)
      // This ensures dummy chat data is always displayed
      const mockData = demoChatMessages
        .filter((msg) => {
          // Filter by projectId if provided
          if (projectId) {
            return msg.projectId === projectId;
          }
          // If no projectId filter, return messages without projectId or null
          return !msg.projectId || msg.projectId === null;
        })
        .map((msg) => ({
          id: msg.id,
          role: msg.role,
          text: msg.text,
          created_at: msg.created_at,
        }));

      // If database has messages, use them; otherwise use mock data
      if (!error && messages && messages.length > 0) {
        // Map database messages to expected format
        chatMessages = messages.map((msg) => ({
          id: msg.id,
          role: msg.role as "me" | "system",
          text: msg.text,
          created_at: msg.created_at,
        }));
      } else {
        // Use mock data when database is empty or has errors
        console.log("Using mock chat data from assets.ts");
        chatMessages = mockData;
      }

      // Return infinite query response
      const infiniteResponse = createInfiniteResponse<ChatMessageRow>(
        chatMessages,
        cursor ? parseInt(cursor, 10) : null,
        limit
      );

      return NextResponse.json(infiniteResponse);
    }
    
    // Demo mode - no authenticated user, use in-memory messages
    const demoMessages = getDemoMessages(projectId);
    const infiniteResponse = createInfiniteResponse<ChatMessageRow>(
      demoMessages,
      cursor ? parseInt(cursor, 10) : null,
      limit
    );

    return NextResponse.json(infiniteResponse);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    // Fallback to mock data on error
    const mockMessages: ChatMessageRow[] = demoChatMessages
      .filter((msg) => !msg.projectId || msg.projectId === null)
      .map((msg) => ({
        id: msg.id,
        role: msg.role,
        text: msg.text,
        created_at: msg.created_at,
      }));
    return NextResponse.json(
      createInfiniteResponse<ChatMessageRow>(mockMessages, null, 20),
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Handle both FormData and JSON
    let text = "";
    let projectId: string | null = null;
    
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      text = String(formData.get("message") || "").trim();
      projectId = formData.get("projectId") ? String(formData.get("projectId")) : null;
    } else {
      const body = (await request.json().catch(() => null)) as
        | { text?: string; message?: string; projectId?: string | null }
        | null;
      text = String(body?.text || body?.message || "").trim();
      projectId = body?.projectId || null;
    }

    if (!text) {
      return NextResponse.json({ message: "Missing text" }, { status: 400 });
    }

    // Try Supabase first, fallback to demo mode if not configured
    let supabase;
    let user;
    
    try {
      supabase = await createSupabaseServerClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (error) {
      console.log("Supabase not configured, using demo mode");
      user = null;
    }

    // If user exists, use Supabase
    if (user && supabase) {
      // Insert message into Supabase
      const { data: newMessage, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          project_id: projectId,
          role: "me",
          text: text,
        })
        .select()
        .single();

      if (error) throw error;

      const chatMessage: ChatMessageRow = {
        id: newMessage.id,
        role: "me",
        text: newMessage.text,
        created_at: newMessage.created_at,
      };

      // Detect drawing numbers in the message text (e.g., "r-1", "R-1", "r1", "R1")
      const drawingMatch = text.match(/\b([Rr]-?\d+[A-Z]?)\b/i);
      if (drawingMatch && drawingMatch[1]) {
        // Normalize drawing number to uppercase with dash (e.g., "R-1")
        const dwgNo = drawingMatch[1].toUpperCase().replace(/^R(\d)/, 'R-$1');
        const jobNumber = projectId || "U2961";
        
        // Find drawing in demoDrawings
        const drawing = demoDrawings.find(
          (d) => d.jobNumber === jobNumber && d.dwgNo === dwgNo && d.section === "drawing_log"
        );
        
        if (drawing) {
          // Find project info
          const project = demoProjects.find((p) => p.jobNumber === jobNumber);
          
          // Format drawing data as a system message
          const drawingDataText = `Drawing ${dwgNo} Information:
          
**Project:** ${project?.name || jobNumber}
**Description:** ${drawing.description}
**Status:** ${drawing.status}
**Elements:** ${(drawing as any).elements || "N/A"}
**Total Weight:** ${drawing.totalWeightTons.toFixed(2)} tons
**Latest Submitted Date:** ${drawing.latestSubmittedDate}
**Release Status:** ${drawing.releaseStatus || "N/A"}`;
          
          // Create system message with drawing data
          const { data: systemMessage, error: systemError } = await supabase
            .from('chat_messages')
            .insert({
              user_id: user.id,
              project_id: projectId,
              role: "system",
              text: drawingDataText,
            })
            .select()
            .single();
          
          // Ignore system message errors (optional feature)
          if (systemError) {
            console.error("Error creating system message:", systemError);
          }
        }
      }

      return NextResponse.json(chatMessage);
    }
    
    // Fallback to demo mode when no authenticated user
    // Create a temporary message and store it in-memory
    const tempMessage: ChatMessageRow = {
      id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: "me",
      text: text,
      created_at: new Date().toISOString(),
    };
    
    // Add message to in-memory storage
    addDemoMessage(projectId, tempMessage);

    // Detect drawing numbers and create auto-response
    const drawingMatch = text.match(/\b([Rr]-?\d+[A-Z]?)\b/i);
    if (drawingMatch && drawingMatch[1]) {
      const dwgNo = drawingMatch[1].toUpperCase().replace(/^R(\d)/, 'R-$1');
      const jobNumber = projectId || "U2961";
      
      const drawing = demoDrawings.find(
        (d) => d.jobNumber === jobNumber && d.dwgNo === dwgNo && d.section === "drawing_log"
      );
      
      if (drawing) {
        const project = demoProjects.find((p) => p.jobNumber === jobNumber);
        
        const drawingDataText = `Drawing ${dwgNo} Information:
        
**Project:** ${project?.name || jobNumber}
**Description:** ${drawing.description}
**Status:** ${drawing.status}
**Elements:** ${(drawing as any).elements || "N/A"}
**Total Weight:** ${drawing.totalWeightTons.toFixed(2)} tons
**Latest Submitted Date:** ${drawing.latestSubmittedDate}
**Release Status:** ${drawing.releaseStatus || "N/A"}`;

        // Create system message and add to in-memory storage
        const systemMessage: ChatMessageRow = {
          id: `demo-system-${Date.now()}`,
          role: "system",
          text: drawingDataText,
          created_at: new Date().toISOString(),
        };
        
        addDemoMessage(projectId, systemMessage);
      }
    }

    return NextResponse.json(tempMessage);
  } catch (error) {
    console.error("Error saving chat message:", error);
    return NextResponse.json(
      { message: "Failed to save message" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Build delete query
    let query = supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', user.id);

    // Filter by projectId if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { error } = await query;

    if (error) throw error;

    return NextResponse.json({ 
      message: "Chat messages deleted successfully",
      deleted: true 
    });
  } catch (error) {
    console.error("Error deleting chat messages:", error);
    return NextResponse.json(
      { message: "Failed to delete chat messages" },
      { status: 500 }
    );
  }
}


