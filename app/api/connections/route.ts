import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

type UserConnection = {
  id: string;
  fromUserId: string;
  toUserId: string;
  toUserName: string;
  toUserEmail: string;
  connectedAt: string;
  projectId?: string | null;
};

const CONNECTIONS_FILE = join(process.cwd(), "public", "connections.json");

async function readConnections(): Promise<UserConnection[]> {
  try {
    const data = await readFile(CONNECTIONS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeConnections(connections: UserConnection[]): Promise<void> {
  await writeFile(CONNECTIONS_FILE, JSON.stringify(connections, null, 2), "utf-8");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | {
          toUserId: string;
          toUserName: string;
          toUserEmail: string;
          projectId?: string | null;
        }
      | null;

    if (!body?.toUserId || !body?.toUserName || !body?.toUserEmail) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Read existing connections
    const connections = await readConnections();

    // Create new connection
    const newConnection: UserConnection = {
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromUserId: user.id,
      toUserId: body.toUserId,
      toUserName: body.toUserName,
      toUserEmail: body.toUserEmail,
      connectedAt: new Date().toISOString(),
      projectId: body.projectId || null,
    };

    // Add to connections array
    connections.push(newConnection);

    // Write back to file
    await writeConnections(connections);

    return NextResponse.json(newConnection);
  } catch (error) {
    console.error("Error saving connection:", error);
    return NextResponse.json(
      { message: "Failed to save connection" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Read connections
    const connections = await readConnections();

    // Filter to current user's connections
    const userConnections = connections.filter(
      (conn) => conn.fromUserId === user.id
    );

    return NextResponse.json(userConnections);
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { message: "Failed to fetch connections" },
      { status: 500 }
    );
  }
}

