import type { Metadata } from "next";
import { TopHeader } from "@/components/app/top-header";
import { RFITable } from "@/components/rfi/rfi-table";
import { RfiCard } from "@/components/rfi/rfi-card";
import { QueryBoundary } from "@/components/query/query-boundary";

export const metadata: Metadata = {
  title: "RFI - Request for Information",
  description: "View and manage Request for Information (RFI) submissions",
};

export default async function RFIPage() {
  return (
    <>
      <TopHeader
        section="RFI"
        page="Request for Information"
        search={{ placeholder: "Search RFI...", action: "/client/rfi", name: "q" }}
      />
      <div className="min-h-0 flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <QueryBoundary
          loadingTitle="Loading RFI data..."
          loadingSubtitle="Fetching RFI information"
        >
          <RfiCard />
          <RFITable />
        </QueryBoundary>
      </div>
    </>
  );
}
