"use client";

import { useState, useMemo, useCallback } from "react";
import { useBillingInvoices } from "@/lib/hooks/use-api";
import { SectionTableCard } from "@/components/projects/section-table-card";
import {
  billingInvoiceColumns,
  type BillingInvoiceRow,
} from "@/components/billing/invoice-columns";
import { InvoiceDetailsDialog } from "@/components/billing/invoice-details-dialog";

export function BillingInvoicesTable() {
  const [page] = useState(1);
  const [pageSize] = useState(10000); // Large page size to show all data
  const [invoiceDetailsDialog, setInvoiceDetailsDialog] = useState<{
    open: boolean;
    invoice: BillingInvoiceRow | null;
  }>({
    open: false,
    invoice: null,
  });

  const { data: invoicesData, isLoading } = useBillingInvoices({
    page,
    pageSize,
    staleTime: 60_000,
    meta: { errorMessage: "Failed to load invoices." },
  });

  const allInvoices = invoicesData?.data ?? [];
  const pagination = invoicesData?.pagination;

  // Filter and sort unpaid invoices - always show unpaid items first, sorted by priority
  const invoices = useMemo(() => {
    // Filter to show only unpaid invoices
    const unpaidInvoices = allInvoices.filter((invoice) => {
      const status = invoice.status?.toLowerCase() || "";
      // Show unpaid, pending, overdue, draft, partially_paid - anything that's not "paid" or "cancelled"
      return status !== "paid" && status !== "cancelled";
    });

    // Sort unpaid invoices by priority: Overdue > Pending > Draft > Others
    // Within each status, sort by total amount (highest first) to prioritize larger amounts
    const statusPriority: Record<string, number> = {
      overdue: 1,
      pending: 2,
      draft: 3,
      partially_paid: 4,
    };

    return unpaidInvoices.sort((a, b) => {
      const statusA = (a.status?.toLowerCase() || "").trim();
      const statusB = (b.status?.toLowerCase() || "").trim();
      
      const priorityA = statusPriority[statusA] || 99;
      const priorityB = statusPriority[statusB] || 99;
      
      // First sort by status priority
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same priority, sort by total amount (highest first)
      const amountA = a.totalAmountBilled || 0;
      const amountB = b.totalAmountBilled || 0;
      return amountB - amountA;
    });
  }, [allInvoices]);

  // Create columns
  const columnsWithActions = billingInvoiceColumns();

  // Set default column visibility - only show specified columns by default
  const defaultColumnVisibility = useMemo(() => ({
    // Hidden by default
    projectNo: false,
    contractor: false,
    tonsBilledAmount: false,
    coPrice: false,
    coBilledAmount: false,
    // Visible by default (these have enableHiding: false or are explicitly shown)
    // invoiceNo, projectName, billedTonnage, unitPriceOrLumpSum, billedHoursCo, totalAmountBilled, actions
  }), []);

  // Handler for viewing invoice details
  const handleViewInvoiceDetails = useCallback((invoice: BillingInvoiceRow) => {
    setInvoiceDetailsDialog({ open: true, invoice });
  }, []);

  return (
    <>
      <SectionTableCard
        title="Billing History"
        data={invoices}
        columns={columnsWithActions}
        exportFilename="billing-invoices.csv"
        isLoading={isLoading}
        defaultColumnVisibility={defaultColumnVisibility}
        onRowClick={handleViewInvoiceDetails} // Click anywhere on row to view details
        onViewDetails={handleViewInvoiceDetails} // Also keep for the View Details button
        isExpanded={true} // Always show the table
        hideDropdown={true} // Hide the dropdown/chevron icon
      />

      <InvoiceDetailsDialog
        open={invoiceDetailsDialog.open}
        onOpenChange={(open) =>
          setInvoiceDetailsDialog((prev) => ({ ...prev, open }))
        }
        invoice={invoiceDetailsDialog.invoice}
      />
    </>
  );
}


