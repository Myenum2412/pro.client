import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get all users from auth.users
    // Note: Supabase Admin API is needed to list all users
    // For now, we'll use a workaround by querying a users table if it exists
    // or we can create a simple users table that syncs with auth.users
    
    // Alternative: Query from a public.users table if it exists
    // For demo purposes, we'll return a mock list or query from a users table
    
    // Check if there's a users table in the public schema
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, user_metadata')
      .neq('id', currentUser.id); // Exclude current user

    // Map users to a simpler format
    let userList: Array<{ id: string; email: string; name: string; avatar: string }> = [];
    
    if (!error && users) {
      userList = users.map((user) => ({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        avatar: user.user_metadata?.avatar_url || '/image/profile.jpg',
      }));
    }

    // Add mock users: Vel and Rajesh
    const mockUsers = [
      {
        id: 'vel-user-id',
        email: 'vel@proultima.com',
        name: 'Vel',
        avatar: '/image/profile.jpg',
      },
      {
        id: 'rajesh-user-id',
        email: 'rajesh@proultima.com',
        name: 'Rajesh',
        avatar: '/image/profile.jpg',
      },
    ];

    // Combine real users with mock users, excluding current user
    const allUsers = [...userList, ...mockUsers].filter(
      (user) => user.id !== currentUser.id
    );

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

