import type { Metadata } from "next";
import { TopHeader } from "@/components/app/top-header";
import { QueryBoundary } from "@/components/query/query-boundary";
import { requireUser } from "@/lib/auth/server";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View project metrics, statistics, and schedule meetings",
};

export default async function Page() {
  const user = await requireUser();

  const initialMe = {
    id: user.id,
    email: user.email ?? null,
    user_metadata: user.user_metadata ?? {},
  };

  return (
    <>
      <TopHeader
        section="Dashboard"
        page="Overview"
        search={{ placeholder: "Search...", action: "/client/dashboard", name: "q" }}
      />
      <div className="min-h-0 flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <QueryBoundary
          loadingTitle="Loading dashboard..."
          loadingSubtitle="Validating your session and fetching your data"
        >
          <DashboardClient initialMe={initialMe} />
        </QueryBoundary>
      </div>
    </>
  );
}
