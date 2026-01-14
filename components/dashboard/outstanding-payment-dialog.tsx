"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { demoInvoices, demoProjects } from "@/public/assets";
import { PayNowButton } from "@/components/billing/pay-now-button";
import type { BillingInvoiceRow } from "@/components/billing/invoice-columns";

type OutstandingPaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OutstandingPaymentDialog({
  open,
  onOpenChange,
}: OutstandingPaymentDialogProps) {

  const totalOutstanding = demoInvoices.reduce(
    (sum, inv) => sum + inv.totalAmountBilled,
    0
  );

  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Create project lookup map by job number
  const projectByJobNumber = new Map<string, (typeof demoProjects)[number]>();
  for (const p of demoProjects) {
    projectByJobNumber.set(p.jobNumber, p);
  }

  // Map invoices to table rows with project information
  const outstandingInvoices: BillingInvoiceRow[] = demoInvoices.map((inv, index) => {
    const proj = projectByJobNumber.get(inv.jobNumber);
    return {
      id: `inv-${index + 1}`,
      invoiceNo: inv.invoiceNo,
      projectNo: inv.jobNumber,
      contractor: proj?.contractorName ?? "",
      projectName: proj?.name ?? "",
      billedTonnage: inv.billedTonnage,
      unitPriceOrLumpSum: inv.unitPriceOrLumpSum,
      tonsBilledAmount: inv.tonsBilledAmount,
      billedHoursCo: inv.billedHoursCo,
      coPrice: inv.coPrice,
      coBilledAmount: inv.coBilledAmount,
      totalAmountBilled: inv.totalAmountBilled,
      status: "Pending",
    };
  });

  // Sort by invoice number (descending - newest first)
  outstandingInvoices.sort((a, b) => b.invoiceNo.localeCompare(a.invoiceNo));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-xl w-full min-w-[95vw] max-h-[95vh] h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 w-full">
          <DialogTitle>Outstanding Payment Details</DialogTitle>
          <DialogDescription>
            View and manage all outstanding billing and payments
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 px-6 pb-6 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-6">
              {/* Summary Card */}
              <Card>
                <CardHeader className="border-b shrink-0 bg-emerald-50/70 p-6">
                  <CardTitle className="text-lg font-semibold text-emerald-900">Total Outstanding Payment</CardTitle>
                  <CardDescription>
                    Total amount pending across all billing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {money.format(totalOutstanding)}
                  </div>
                </CardContent>
              </Card>

              {/* Outstanding Invoices Table */}
              <Card>
                <CardHeader className="border-b shrink-0 bg-emerald-50/70 p-6">
                  <CardTitle className="text-lg font-semibold text-emerald-900">Outstanding Billing</CardTitle>
                  <CardDescription>
                    Complete list of all outstanding billing with payment options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader className="bg-emerald-50/70">
                        <TableRow>
                          <TableHead className="text-center font-semibold text-emerald-900">Billing #</TableHead>
                          <TableHead className="text-center font-semibold text-emerald-900">Project #</TableHead>
                          <TableHead className="text-center font-semibold text-emerald-900">Project Name</TableHead>
                          <TableHead className="text-center font-semibold text-emerald-900">Contractor</TableHead>
                          <TableHead className="text-center font-semibold text-emerald-900">Billed Tonnage</TableHead>
                          <TableHead className="text-center font-semibold text-emerald-900">Total Amount</TableHead>
                          <TableHead className="text-center font-semibold text-emerald-900">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {outstandingInvoices.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No outstanding billing found
                            </TableCell>
                          </TableRow>
                        ) : (
                          outstandingInvoices.map((invoice) => (
                            <TableRow key={invoice.id} className="hover:bg-emerald-50/30 transition-colors">
                              <TableCell className="text-center font-medium">{invoice.invoiceNo}</TableCell>
                              <TableCell className="text-center">{invoice.projectNo}</TableCell>
                              <TableCell className="text-center">{invoice.projectName}</TableCell>
                              <TableCell className="text-center">{invoice.contractor}</TableCell>
                              <TableCell className="text-center">{invoice.billedTonnage.toFixed(2)}</TableCell>
                              <TableCell className="text-center font-semibold">
                                {money.format(invoice.totalAmountBilled)}
                              </TableCell>
                              <TableCell className="text-center">
                                <PayNowButton invoice={invoice} />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

