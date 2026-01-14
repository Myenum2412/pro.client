import type { Metadata } from "next";
import { TopHeader } from "@/components/app/top-header";
import { BillingInvoicesTable } from "@/components/billing/billing-invoices-table";
import { BillingOverview } from "@/components/billing/billing-overview";
import { QueryBoundary } from "@/components/query/query-boundary";

export const metadata: Metadata = {
  title: "Billing & Billing",
  description: "View and manage billing, payments, and billing information",
};

export default async function BillingPage() {
  return (
    <>
      <TopHeader
        section="Billing"
        page="Billing & Billing"
        search={{ placeholder: "Search billing...", action: "/client/billing", name: "q" }}
      />
      <div className="min-h-0 flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <QueryBoundary
          loadingTitle="Loading billing data..."
          loadingSubtitle="Fetching billing information"
        >
          <BillingOverview />
          <BillingInvoicesTable />
        </QueryBoundary>
      </div>
    </>
  );
}


