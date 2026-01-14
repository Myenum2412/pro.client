/**
 * Enhanced File Hooks using TanStack Query
 * Replaces manual useEffect-based fetching with optimized TanStack Query hooks
 * 
 * @deprecated Use hooks from @/lib/hooks/use-files instead
 * This file is kept for backward compatibility but should be migrated
 */

import { useEffect } from "react";
import { useFileDirectory, useSidebarProjects } from "@/lib/hooks/use-files";
import type { FileNode } from "@/lib/api/services";

type UseRealtimeFilesOptions = {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onUpdate?: (files: FileNode[]) => void;
  onError?: (error: Error) => void;
};

type UseRealtimeFilesReturn = {
  files: FileNode[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => void;
  isRefreshing: boolean;
};

/**
 * Enhanced realtime files hook using TanStack Query
 * 
 * @deprecated Use useFileDirectory or useSidebarProjects from @/lib/hooks/use-files
 */
export function useRealtimeFiles(
  options: UseRealtimeFilesOptions = {}
): UseRealtimeFilesReturn {
  const {
    autoRefresh = true,
    refreshInterval = 30000,
    onUpdate,
    onError,
  } = options;

  // Use TanStack Query hook instead of manual fetching
  // NOTE: Polling is disabled by default. Use manual refetch or Supabase Realtime instead
  const { data: files = [], isLoading, error, refetch, dataUpdatedAt, isRefetching } = useFileDirectory("", {
    staleTime: refreshInterval,
    // DISABLED: Aggressive polling causes excessive re-renders
    // refetchInterval: autoRefresh ? refreshInterval : false,
    refetchOnWindowFocus: false, // Disabled to prevent excessive refetching
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Handle side effects with useEffect (onSuccess/onError deprecated in TanStack Query v5)
  useEffect(() => {
    if (files.length > 0 && onUpdate) {
      onUpdate(files);
    }
  }, [files, onUpdate]);

  useEffect(() => {
    if (error && onError) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [error, onError]);

  return {
    files,
    isLoading,
    error: error instanceof Error ? error : (error ? new Error(String(error)) : null),
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    refresh: () => {
      refetch();
    },
    isRefreshing: isRefetching,
  };
}

/**
 * Hook for sidebar projects using TanStack Query
 */
export function useRealtimeSidebarProjects(
  options: UseRealtimeFilesOptions = {}
): UseRealtimeFilesReturn {
  const {
    autoRefresh = true,
    refreshInterval = 30000,
    onUpdate,
    onError,
  } = options;

  const { data: files = [], isLoading, error, refetch, dataUpdatedAt, isRefetching } = useSidebarProjects({
    staleTime: refreshInterval,
    // DISABLED: Aggressive polling causes excessive re-renders
    // refetchInterval: autoRefresh ? refreshInterval : false,
    refetchOnWindowFocus: false, // Disabled to prevent excessive refetching
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Handle side effects with useEffect (onSuccess/onError deprecated in TanStack Query v5)
  useEffect(() => {
    if (files.length > 0 && onUpdate) {
      onUpdate(files);
    }
  }, [files, onUpdate]);

  useEffect(() => {
    if (error && onError) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [error, onError]);

  return {
    files,
    isLoading,
    error: error instanceof Error ? error : (error ? new Error(String(error)) : null),
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    refresh: () => {
      refetch();
    },
    isRefreshing: isRefetching,
  };
}

