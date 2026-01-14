import type { Metadata } from "next";
import { TopHeader } from "@/components/app/top-header";
import { SubmissionsTable } from "@/components/submissions/submissions-table";
import { SubmissionsOverview } from "@/components/submissions/submissions-overview";
import { QueryBoundary } from "@/components/query/query-boundary";

export const metadata: Metadata = {
  title: "Submissions",
  description: "View and manage RFI submissions and submittals",
};

export default async function SubmissionsPage() {
  return (
    <>
      <TopHeader
        section="Submissions"
        page="All Submissions"
        search={{ placeholder: "Search submissions...", action: "/client/submissions", name: "q" }}
      />
      <div className="min-h-0 flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <QueryBoundary
          loadingTitle="Loading submissions..."
          loadingSubtitle="Fetching submission data"
        >
          <SubmissionsOverview />
        </QueryBoundary>
        <QueryBoundary
          loadingTitle="Loading submissions..."
          loadingSubtitle="Fetching submission data"
        >
          <SubmissionsTable />
        </QueryBoundary>
      </div>
    </>
  );
}
