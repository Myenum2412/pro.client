"use client";

import { useMemo, memo } from "react";
import { useBillingInvoices } from "@/lib/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BillingInvoiceRow } from "./invoice-columns";
import { OptimizedBackgroundImage } from "@/lib/utils/optimized-background-image";

// Memoize metric card to prevent unnecessary re-renders
const MetricCard = memo(
  ({
    label,
    value,
    unit,
  }: {
    label: string;
    value: string;
    unit: string;
  }) => (
    <div className="flex flex-col p-4 rounded-lg border bg-background/50 backdrop-blur-sm">
      <div className="text-sm mb-2 font-medium text-muted-foreground">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        {unit && (
          <span className="text-sm text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  )
);
MetricCard.displayName = "MetricCard";

export function BillingOverview() {
  // Fetch all invoices for overview (use large pageSize to get all)
  const { data: invoicesData } = useBillingInvoices({
    page: 1,
    pageSize: 1000, // Large page size to get all billing for overview calculations
    staleTime: 60_000,
    meta: { errorMessage: "Failed to load invoices." },
  });

  // Extract data array from paginated response
  const data = invoicesData?.data ?? [];

  // Memoize money formatter
  const money = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }),
    []
  );

  // Memoize all calculations
  const metrics = useMemo(() => {
    const totalInvoices = data.length;
    const totalAmountBilled = data.reduce(
      (sum, inv) => sum + inv.totalAmountBilled,
      0
    );
    const totalBilledTonnage = data.reduce(
      (sum, inv) => sum + inv.billedTonnage,
      0
    );
    const totalCoHours = data.reduce(
      (sum, inv) => sum + inv.billedHoursCo,
      0
    );
    const totalCoAmount = data.reduce(
      (sum, inv) => sum + inv.coBilledAmount,
      0
    );

    return [
      {
        label: "Total Billing",
        value: totalInvoices.toString(),
        unit: "",
      },
      {
        label: "Total Amount Billed",
        value: money.format(totalAmountBilled),
        unit: "",
      },
      {
        label: "Total Billed Tonnage",
        value: totalBilledTonnage.toFixed(2),
        unit: "Tons",
      },
      {
        label: "Total CO Hours",
        value: totalCoHours.toFixed(1),
        unit: "Hours",
      },
      {
        label: "Total CO Amount",
        value: money.format(totalCoAmount),
        unit: "",
      },
    ];
  }, [data, money]);

  return (
    <Card className="w-full shadow-lg overflow-hidden relative">
    <div className="absolute inset-0 bg-section opacity-70 " />
      <CardHeader className="relative border-b shrink-0 bg-emerald-50/70 p-6">
        <div className="flex items-center justify-between gap-4 w-full">
          <CardTitle className="text-lg font-semibold text-emerald-900 shrink-0">Billing Overview</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative p-6">
        <div className="grid grid-cols-5 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              label={metric.label}
              value={metric.value}
              unit={metric.unit}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

