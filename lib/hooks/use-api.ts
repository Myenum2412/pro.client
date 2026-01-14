/**
 * Comprehensive API hooks using TanStack Query
 * Provides type-safe, optimized hooks for all API endpoints
 * Uses centralized API services for consistency and maintainability
 */

import * as React from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery, type UseQueryOptions, type UseMutationOptions, type UseInfiniteQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { ApiError } from "@/lib/api/fetch-json";
import {
  projectService,
  rfiService,
  billingService,
  type Project,
  type ProjectDetails,
  type RFI,
  type Invoice,
} from "@/lib/api/services";
import { fetchJson } from "@/lib/api/fetch-json";
import type { PaginatedResponse, InfiniteQueryResponse } from "@/lib/api/pagination";

// ============================================================================
// Projects API Hooks
// ============================================================================

export function useProjects(options?: Omit<UseQueryOptions<Project[], ApiError>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: queryKeys.projects(),
    queryFn: () => projectService.getAll(),
    staleTime: 5 * 60_000, // 5 minutes
    gcTime: 10 * 60_000, // 10 minutes
    ...options,
  });
}

export function useProject(projectId: string, options?: Omit<UseQueryOptions<ProjectDetails, ApiError>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => projectService.getById(projectId),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    enabled: !!projectId,
    ...options,
  });
}

export function useProjectSection<T>(
  projectId: string,
  section: string,
  page = 1,
  pageSize = 20,
  options?: Omit<UseQueryOptions<PaginatedResponse<T>, ApiError>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: [...queryKeys.projectSection(projectId, section), page, pageSize],
    queryFn: () => projectService.getSection<T>(projectId, section, page, pageSize),
    staleTime: 2 * 60_000, // 2 minutes for section data
    gcTime: 5 * 60_000,
    enabled: !!projectId && !!section,
    ...options,
  });
}

export function useProjectMaterialLists<T = unknown>(
  projectId: string,
  options?: Omit<UseQueryOptions<{ title: string; blocks: T[] }, ApiError>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.projectMaterialLists(projectId),
    queryFn: () => projectService.getMaterialLists(projectId) as Promise<{ title: string; blocks: T[] }>,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    enabled: !!projectId,
    ...options,
  });
}

// ============================================================================
// Drawings API Hooks
// ============================================================================

export function useDrawings(
  options?: {
    page?: number;
    pageSize?: number;
  } & Omit<UseQueryOptions<PaginatedResponse<any>, ApiError>, "queryKey" | "queryFn">
) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;

  return useQuery({
    queryKey: [...queryKeys.drawings(), page, pageSize],
    queryFn: () => fetchJson<PaginatedResponse<any>>(`/api/drawings?page=${page}&pageSize=${pageSize}`),
    staleTime: 2 * 60_000,
    ...options,
  });
}

export function useUpdateReleaseStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ drawingId, releaseStatus }: { drawingId: string; releaseStatus: string }) => {
      return fetchJson(`/api/drawings/${encodeURIComponent(drawingId)}/release-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ releaseStatus }),
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.drawings() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectSection(variables.drawingId.split("-")[0], "drawing_log") });
    },
  });
}

// ============================================================================
// Billing API Hooks
// ============================================================================

export function useBillingInvoices(
  options?: {
    page?: number;
    pageSize?: number;
  } & Omit<UseQueryOptions<PaginatedResponse<Invoice>, ApiError>, "queryKey" | "queryFn">
) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;

  return useQuery({
    queryKey: [...queryKeys.billingInvoices(), page, pageSize],
    queryFn: () => billingService.getInvoices(page, pageSize),
    staleTime: 2 * 60_000,
    gcTime: 5 * 60_000,
    ...options,
  });
}

export interface InvoiceDetails {
  id: string;
  invoiceNo: string;
  projectNo: string;
  contractor: string;
  projectName: string;
  issueDate: string;
  dueDate: string;
  status: "paid" | "unpaid" | "partially_paid" | "overdue";
  billedTonnage: number;
  unitPriceOrLumpSum: string;
  tonsBilledAmount: number;
  billedHoursCo: number;
  coPrice: number;
  coBilledAmount: number;
  totalAmountBilled: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  remainingBalance: number;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    subtotal: number;
  }>;
  payments: Array<{
    id: string;
    paymentDate: string;
    amount: number;
    method: string;
    status: "completed" | "pending" | "failed";
    transactionId?: string;
  }>;
}

export function useInvoiceDetails(
  invoiceId: string,
  options?: Omit<UseQueryOptions<Invoice, ApiError>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.billingInvoice(invoiceId),
    queryFn: () => billingService.getInvoice(invoiceId),
    staleTime: 1 * 60_000, // 1 minute for invoice details
    gcTime: 5 * 60_000,
    enabled: !!invoiceId,
    ...options,
  });
}

// ============================================================================
// RFI API Hooks
// ============================================================================

export function useRFIList(
  options?: {
    page?: number;
    pageSize?: number;
  } & Omit<UseQueryOptions<PaginatedResponse<RFI>, ApiError>, "queryKey" | "queryFn">
) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;

  return useQuery({
    queryKey: [...queryKeys.rfi(), page, pageSize],
    queryFn: () => rfiService.getAll(page, pageSize),
    staleTime: 60_000, // 1 minute
    gcTime: 10 * 60_000, // 10 minutes
    ...options,
  });
}

export function useRFI(rfiId: string, options?: Omit<UseQueryOptions<RFI, ApiError>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: queryKeys.rfiItem(rfiId),
    queryFn: () => rfiService.getById(rfiId),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    enabled: !!rfiId,
    ...options,
  });
}

export function useCreateRFI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<RFI>) => rfiService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rfi() });
    },
  });
}

export function useUpdateRFI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rfiId, data }: { rfiId: string; data: Partial<RFI> }) => rfiService.update(rfiId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rfi() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rfiItem(variables.rfiId) });
    },
  });
}

// ============================================================================
// Submissions API Hooks
// ============================================================================

export function useSubmissions(
  options?: {
    page?: number;
    pageSize?: number;
  } & Omit<UseQueryOptions<PaginatedResponse<any>, ApiError>, "queryKey" | "queryFn">
) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;

  return useQuery({
    queryKey: [...queryKeys.submissions(), page, pageSize],
    queryFn: () => fetchJson<PaginatedResponse<any>>(`/api/submissions?page=${page}&pageSize=${pageSize}`),
    staleTime: 2 * 60_000,
    ...options,
  });
}

// ============================================================================
// Payments API Hooks
// ============================================================================

export function usePayments(options?: Omit<UseQueryOptions<any[], ApiError>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: queryKeys.payments(),
    queryFn: () => fetchJson<any[]>("/api/payments"),
    staleTime: 1 * 60_000, // Payments data changes frequently
    ...options,
  });
}

export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: async (data: { amount: number; invoiceId: string; invoiceNo: string; currency: string }) => {
      return fetchJson<{ orderId: string; amount: number; currency: string; receipt: string }>(
        "/api/payments/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
      return fetchJson("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate payments query to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.payments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.billingInvoices() });
    },
  });
}

// ============================================================================
// Chat API Hooks
// ============================================================================

export function useChatMessages(
  projectId?: string,
  options?: Omit<UseInfiniteQueryOptions<InfiniteQueryResponse<any>, ApiError>, "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam" | "enabled">
) {
  return useInfiniteQueryHook(
    queryKeys.chatMessages(projectId),
    (cursor, limit) => {
      const params = new URLSearchParams();
      if (projectId) params.set("projectId", projectId);
      if (cursor) params.set("cursor", String(cursor));
      params.set("limit", String(limit));
      return fetchJson<InfiniteQueryResponse<any>>(`/api/chat/messages?${params.toString()}`);
    },
    {
      limit: 20,
      staleTime: 60_000, // 1 minute for chat messages
      // REMOVED: Aggressive 10s polling - use Supabase Realtime or manual refetch instead
      // refetchInterval: 10_000,
      ...options,
    }
  );
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { projectId?: string; message: string; files?: File[]; audio?: Blob }) => {
      const formData = new FormData();
      formData.append("message", data.message);
      if (data.projectId) formData.append("projectId", data.projectId);
      if (data.files) {
        data.files.forEach((file) => formData.append("files", file));
      }
      if (data.audio) formData.append("audio", data.audio);

      return fetchJson("/api/chat/messages", {
        method: "POST",
        body: formData,
      });
    },
    meta: {
      silent: true, // Suppress global error toast
    },
    onSuccess: (response, variables) => {
      // Refetch to get server response (includes both user message and any system responses)
      queryClient.invalidateQueries({ queryKey: queryKeys.chatMessages(variables.projectId) });
      
      // If demo mode returned multiple messages, invalidate will fetch them
      if (response && typeof response === 'object') {
        const hasSystemMessage = 'systemMessage' in response;
        if (hasSystemMessage) {
          // Demo mode with system response - let the invalidation handle it
          console.log("Demo mode: message sent with system response");
        }
      }
    },
    onError: (error, variables) => {
      // Save to local storage when API call fails
      if (typeof window !== "undefined") {
        import("@/lib/utils/chat-local-storage").then(({ savePendingMessage }) => {
          savePendingMessage(variables.message, variables.projectId, variables.files);
        }).catch((err) => {
          console.error("Failed to save message to local storage:", err);
        });
      }
    },
  });
}

// ============================================================================
// Pagination Hooks
// ============================================================================

/**
 * Hook for paginated queries (page-based pagination)
 */
export function usePaginatedQuery<T>(
  queryKey: readonly unknown[],
  queryFn: (page: number, pageSize: number) => Promise<PaginatedResponse<T>>,
  options?: {
    pageSize?: number;
    enabled?: boolean;
  } & Omit<UseQueryOptions<PaginatedResponse<T>, ApiError>, "queryKey" | "queryFn">
) {
  const pageSize = options?.pageSize ?? 20;
  const [page, setPage] = React.useState(1);

  const query = useQuery({
    queryKey: [...queryKey, page, pageSize],
    queryFn: () => queryFn(page, pageSize),
    enabled: options?.enabled !== false,
    ...options,
  });

  return {
    ...query,
    page,
    pageSize,
    setPage,
    pagination: query.data?.pagination,
  };
}

/**
 * Hook for infinite queries (cursor-based pagination)
 */
export function useInfiniteQueryHook<T>(
  queryKey: readonly unknown[],
  queryFn: (cursor: number | string | null, limit: number) => Promise<InfiniteQueryResponse<T>>,
  options?: {
    limit?: number;
    enabled?: boolean;
  } & Omit<UseInfiniteQueryOptions<InfiniteQueryResponse<T>, ApiError>, "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam" | "enabled">
) {
  const limit = options?.limit ?? 20;
  const { enabled, limit: _limit, ...restOptions } = options ?? {};

  return useInfiniteQuery({
    queryKey: [...queryKey, limit],
    queryFn: ({ pageParam = null }) => queryFn(pageParam as number | string | null, limit),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialPageParam: null as number | string | null,
    enabled: enabled !== false,
    ...restOptions,
  });
}

// ============================================================================
// Upload API Hooks
// ============================================================================

export function useUploadData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      table: string;
      format: "csv" | "json";
      data: unknown;
      options?: { skipDuplicates?: boolean; projectId?: string };
    }) => {
      return fetchJson("/upload-demo/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries based on table type
      const table = variables.table;
      if (table === "projects") {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
      } else if (table === "drawings") {
        queryClient.invalidateQueries({ queryKey: queryKeys.drawings() });
      } else if (table === "invoices") {
        queryClient.invalidateQueries({ queryKey: queryKeys.billingInvoices() });
      } else if (table === "submissions") {
        queryClient.invalidateQueries({ queryKey: queryKeys.submissions() });
      }
    },
  });
}

