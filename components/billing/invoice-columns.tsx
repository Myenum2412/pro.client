"use client";

import type { ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Column } from "@tanstack/react-table";
import { ArrowUpDown, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PayNowButton } from "./pay-now-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export type BillingInvoiceRow = {
  id: string;
  invoiceNo: string;
  projectNo: string;
  contractor: string;
  projectName: string;
  billedTonnage: number;
  unitPriceOrLumpSum: string;
  tonsBilledAmount: number;
  billedHoursCo: number;
  coPrice: number;
  coBilledAmount: number;
  totalAmountBilled: number;
  status: string; // Add status field: 'Paid', 'Pending', 'Overdue', 'Draft', 'Cancelled'
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function SortableHeader({
  column,
  children,
}: {
  column: Column<BillingInvoiceRow, unknown>;
  children: ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      className="mx-auto h-auto py-1.5 px-2 text-center"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <span className="leading-tight">{children}</span>
      <ArrowUpDown className="ml-2 size-4" />
    </Button>
  );
}

function MultilineLabel({
  line1,
  line2,
}: {
  line1: string;
  line2?: string;
}) {
  return (
    <span className="inline-block text-center leading-tight">
      {line1}
      {line2 ? (
        <>
          <br />
          {line2}
        </>
      ) : null}
    </span>
  );
}

export const billingInvoiceColumns = (): ColumnDef<BillingInvoiceRow>[] => [
  {
    accessorKey: "invoiceNo",
    header: ({ column }) => (
      <SortableHeader column={column}>
        <MultilineLabel line1="Billing #" />
      </SortableHeader>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("invoiceNo")}</div>,
    meta: { align: "center" },
    enableHiding: false, // Always visible
  },
  {
    accessorKey: "projectNo",
    header: ({ column }) => (
      <SortableHeader column={column}>
        <MultilineLabel line1="Project #" />
      </SortableHeader>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("projectNo")}</div>,
    meta: { align: "center" },
  },
  {
    accessorKey: "contractor",
    header: ({ column }) => (
      <SortableHeader column={column}>
        <MultilineLabel line1="Contractor" />
      </SortableHeader>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("contractor")}</div>,
    meta: { align: "center" },
  },
  {
    accessorKey: "projectName",
    header: ({ column }) => (
      <SortableHeader column={column}>
        <MultilineLabel line1="Project Name" />
      </SortableHeader>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("projectName")}</div>,
    meta: { align: "center" },
    enableHiding: false, // Always visible
  },
  {
    accessorKey: "billedTonnage",
    header: ({ column }) => (
      <SortableHeader column={column}>
        <MultilineLabel line1="Billing" line2="Tonnage" />
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{Number(row.getValue("billedTonnage")).toFixed(2)}</div>
    ),
    meta: { align: "center" },
    enableHiding: false, // Always visible
  },
  {
    accessorKey: "unitPriceOrLumpSum",
    header: ({ column }) => (
      <SortableHeader column={column}>
        <MultilineLabel line1="Unit Price/" line2="Lump Sum" />
      </SortableHeader>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("unitPriceOrLumpSum")}</div>,
    meta: { align: "center" },
    enableHiding: false, // Always visible
  },
  {
    accessorKey: "tonsBilledAmount",
    header: ({ column }) => (
      <SortableHeader column={column}>
        <MultilineLabel line1="Tons Billed" line2="Amount" />
      </SortableHeader>
    ),
    cell: ({ row }) => <div className="font-medium">{money.format(Number(row.getValue("tonsBilledAmount")))}</div>,
    meta: { align: "center" },
  },
  {
    accessorKey: "billedHoursCo",
    header: ({ column }) => (
      <SortableHeader column={column}>
        <MultilineLabel line1="Billed" line2="Hours (CO)" />
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{Number(row.getValue("billedHoursCo")).toFixed(1)}</div>
    ),
    meta: { align: "center" },
    enableHiding: false, // Always visible
  },
  {
    accessorKey: "coPrice",
    header: ({ column }) => (
      <SortableHeader column={column}>
        <MultilineLabel line1="CO Price" />
      </SortableHeader>
    ),
    cell: ({ row }) => <div className="font-medium">{money.format(Number(row.getValue("coPrice")))}</div>,
    meta: { align: "center" },
  },
  {
    accessorKey: "coBilledAmount",
    header: ({ column }) => (
      <SortableHeader column={column}>
        <MultilineLabel line1="CO Billed" line2="Amount" />
      </SortableHeader>
    ),
    cell: ({ row }) => <div className="font-medium">{money.format(Number(row.getValue("coBilledAmount")))}</div>,
    meta: { align: "center" },
  },
  {
    accessorKey: "totalAmountBilled",
    header: ({ column }) => (
      <SortableHeader column={column}>
        <MultilineLabel line1="Total" line2="Amount Billed" />
      </SortableHeader>
    ),
    cell: ({ row }) => <div className="font-medium">{money.format(Number(row.getValue("totalAmountBilled")))}</div>,
    meta: { align: "center" },
    enableHiding: false, // Always visible
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader column={column}>
        <MultilineLabel line1="Status" />
      </SortableHeader>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusConfig = {
        paid: { 
          label: "Paid", 
          className: "bg-emerald-100 text-emerald-700 border-emerald-200", 
          icon: CheckCircle2 
        },
        unpaid: { 
          label: "Unpaid", 
          className: "bg-red-100 text-red-700 border-red-200", 
          icon: AlertCircle 
        },
        partially_paid: { 
          label: "Partially Paid", 
          className: "bg-amber-100 text-amber-700 border-amber-200", 
          icon: Clock 
        },
        pending: { 
          label: "Pending", 
          className: "bg-amber-100 text-amber-700 border-amber-200", 
          icon: Clock 
        },
        overdue: { 
          label: "Overdue", 
          className: "bg-red-100 text-red-700 border-red-200", 
          icon: AlertCircle 
        },
        cancelled: { 
          label: "Cancelled", 
          className: "bg-gray-100 text-gray-700 border-gray-200", 
          icon: AlertCircle 
        },
      };

      // Normalize status to lowercase for matching
      const normalizedStatus = status?.toLowerCase() || "unpaid";
      const config = statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig.unpaid;
      const Icon = config.icon;

      return (
        <div className="flex justify-center">
          <Badge className={`${config.className} border font-medium flex items-center gap-1.5`}>
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      );
    },
    meta: { align: "center" },
    enableHiding: false, // Always visible
  },
  {
    id: "actions",
    header: () => <div className="text-center font-semibold">Actions</div>,
    cell: ({ row, table }) => {
      const status = row.original.status;
      const canPay = status !== "Paid" && status !== "Cancelled";
      
      // Get onViewDetails handler from table meta
      const onViewDetails = (table.options.meta as any)?.onViewDetails;
      
      return (
        <div className="flex justify-center items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails?.(row.original)}
                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {canPay ? (
            <PayNowButton invoice={row.original} />
          ) : (
            <span className="text-sm text-emerald-600 font-medium">✓ Paid</span>
          )}
        </div>
      );
    },
    meta: { align: "center" },
    enableSorting: false,
    enableHiding: false, // Always visible
  },
];


