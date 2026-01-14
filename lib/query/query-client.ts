import { QueryCache, QueryClient, MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/fetch-json";

function getMetaErrorMessage(meta: unknown): string | undefined {
  if (!meta || typeof meta !== "object") return undefined;
  const value = (meta as Record<string, unknown>).errorMessage;
  return typeof value === "string" ? value : undefined;
}

function shouldRetry(failureCount: number, error: unknown) {
  // Don't retry after 3 attempts
  if (failureCount >= 3) return false;
  
  // Don't retry client errors (4xx)
  if (error instanceof ApiError) {
    if ([400, 401, 403, 404].includes(error.status)) return false;
  }
  
  // Retry with exponential backoff for server errors
  return true;
}

/**
 * Optimized query client configuration for performance
 * - Intelligent caching with appropriate stale times
 * - Request deduplication (automatic with TanStack Query)
 * - Background revalidation
 * - Optimized retry logic
 */
export function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError(error, query) {
        // Only show toast for queries that don't have silent error handling
        const silent = (query.meta as { silent?: boolean })?.silent;
        if (silent) return;

        const message =
          getMetaErrorMessage(query.meta) ||
          (error instanceof Error ? error.message : "Request failed");
        toast.error(message);
      },
    }),
    mutationCache: new MutationCache({
      onError(error, _variables, _context, mutation) {
        const silent = (mutation.meta as { silent?: boolean })?.silent;
        if (silent) return;

        const message =
          getMetaErrorMessage(mutation.meta) ||
          (error instanceof Error ? error.message : "Operation failed");
        toast.error(message);
      },
    }),
    defaultOptions: {
      queries: {
        // Cache data for 10 minutes before considering it stale (optimized for performance)
        // Reduced refetching frequency to prevent excessive re-renders
        staleTime: 10 * 60_000,
        // Keep unused data in cache for 15 minutes (allows instant navigation back)
        gcTime: 15 * 60_000,
        // Retry with exponential backoff for better UX
        retry: shouldRetry,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // DISABLED: Prevents excessive refetching on window focus
        // Enable selectively per-query for critical data only
        refetchOnWindowFocus: false,
        // Refetch on reconnect (user expects fresh data after coming back online)
        refetchOnReconnect: true,
        // Only refetch on mount if data is stale (prevents unnecessary refetches)
        refetchOnMount: false,
        // Network mode: prefer online, fallback to cache (better offline support)
        networkMode: "online",
        // Structural sharing for better performance (prevents unnecessary re-renders)
        structuralSharing: true,
      },
      mutations: {
        // Don't retry mutations by default
        retry: 0,
        // Network mode for mutations
        networkMode: "online",
      },
    },
  });
}


