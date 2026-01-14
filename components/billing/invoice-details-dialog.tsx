"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PayNowButton } from "./pay-now-button";
import type { BillingInvoiceRow } from "./invoice-columns";
import { 
  FileText, 
  Building2, 
  Calendar, 
  DollarSign, 
  Download,
  Printer,
  X,
} from "lucide-react";

type InvoiceDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: BillingInvoiceRow | null;
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function getStatusBadge(status: string) {
  const statusLower = status.toLowerCase();
  
  if (statusLower === "paid") {
    return <Badge className="bg-emerald-600 text-white">Paid</Badge>;
  }
  if (statusLower === "pending") {
    return <Badge className="bg-amber-500 text-white">Pending</Badge>;
  }
  if (statusLower === "overdue") {
    return <Badge className="bg-red-600 text-white">Overdue</Badge>;
  }
  if (statusLower === "draft") {
    return <Badge className="bg-gray-500 text-white">Draft</Badge>;
  }
  if (statusLower === "cancelled") {
    return <Badge className="bg-gray-400 text-white">Cancelled</Badge>;
  }
  
  return <Badge>{status}</Badge>;
}

export function InvoiceDetailsDialog({
  open,
  onOpenChange,
  invoice,
}: InvoiceDetailsDialogProps) {
  if (!invoice) return null;

  const canPay = invoice.status !== "Paid" && invoice.status !== "Cancelled";

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate PDF download (placeholder - implement actual PDF generation)
    alert("PDF download functionality - to be implemented with actual PDF generation");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-xl w-full min-w-[95vw] max-h-[95vh] h-[90vh] p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 w-full border-b bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6 text-emerald-600" />
                Billing Details - {invoice.invoiceNo}
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Project: {invoice.projectName} | Contractor: {invoice.contractor}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(invoice.status)}
            </div>
          </div>
        </DialogHeader>

        {/* Content - Full Screen View */}
        <div className="flex-1 px-6 pb-6 min-h-0 overflow-hidden">
          <div className="w-full h-full border rounded-md bg-white dark:bg-gray-950 overflow-auto">
            <div className="p-6 max-w-full mx-auto">

              <div className="space-y-4">
                {/* Billing Header */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Billing Number</p>
                    <p className="text-lg font-bold">{invoice.invoiceNo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Project Number</p>
                    <p className="text-lg font-bold">{invoice.projectNo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Project Name</p>
                    <p className="text-base font-semibold">{invoice.projectName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Contractor</p>
                    <p className="text-base font-semibold">{invoice.contractor}</p>
                  </div>
                </div>

                {/* Tonnage Billing */}
                <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Tonnage Billing
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Billed Tonnage</p>
                      <p className="text-2xl font-bold">{invoice.billedTonnage.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">tons</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Unit Price/Lump Sum</p>
                      <p className="text-lg font-semibold">{invoice.unitPriceOrLumpSum}</p>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg border-2 border-emerald-300 dark:border-emerald-700">
                      <p className="text-xs text-muted-foreground mb-1">Tons Billed Amount</p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {money.format(invoice.tonsBilledAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Change Order Billing */}
                <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Change Order Billing
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Billed Hours (CO)</p>
                      <p className="text-2xl font-bold">{invoice.billedHoursCo.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">hours</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">CO Price</p>
                      <p className="text-lg font-semibold">{money.format(invoice.coPrice)}</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                      <p className="text-xs text-muted-foreground mb-1">CO Billed Amount</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {money.format(invoice.coBilledAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950 p-6 rounded-lg border-2 border-emerald-300 dark:border-emerald-700">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Amount Billed</p>
                      <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                        {money.format(invoice.totalAmountBilled)}
                      </p>
                    </div>
                    {canPay && (
                      <Badge variant="outline" className="text-amber-600 border-amber-600 text-sm px-3 py-1.5">
                        Payment Pending
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons - Inside Content Area */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrint}
                      className="gap-2"
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    {canPay ? (
                      <PayNowButton 
                        invoice={invoice}
                        onBeforePayment={() => {
                          // Dialog will stay open, payment gateway will overlay
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 rounded-md border border-emerald-200 dark:border-emerald-800">
                        <span className="text-base text-emerald-600 dark:text-emerald-400 font-semibold">✓ Paid</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

