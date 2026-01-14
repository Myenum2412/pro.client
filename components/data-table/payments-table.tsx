"use client";

import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { usePayments } from "@/lib/hooks/use-api";
import { DataTable } from "@/components/data-table/data-table";
import type { Payment } from "@/components/data-table/payments-columns";
import { paymentColumns } from "@/components/data-table/payments-columns";

export function PaymentsTable() {
  // Use centralized TanStack Query hook for payments
  const { data } = usePayments({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: { errorMessage: "Failed to load payments." },
  });

  // Memoize data for performance
  const payments = useMemo(() => data ?? [], [data]);

  return (
    <DataTable
      columns={paymentColumns}
      data={payments}
      filterColumnId="email"
      filterPlaceholder="Filter emails..."
    />
  );
}


