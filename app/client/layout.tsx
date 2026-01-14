import type { Metadata } from "next";
import { AppSidebar } from "@/components/app-sidebar";
import type { SidebarUser } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { requireUser } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: {
    default: "Proultima",
    template: "%s | Proultima",
  },
};

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Single authentication check for all client routes
  const user = await requireUser();

  // Extract user metadata once for the entire layout
  const displayName =
    (typeof user.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name) ||
    (user.email ? user.email.split("@")[0] : "User");

  const avatar =
    (typeof user.user_metadata?.avatar_url === "string" &&
      user.user_metadata.avatar_url) ||
    "/image/profile.jpg";

  const sidebarUser: SidebarUser = {
    name: displayName,
    email: user.email ?? "",
    avatar,
  };

  return (
    <SidebarProvider>
      <AppSidebar user={sidebarUser} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
