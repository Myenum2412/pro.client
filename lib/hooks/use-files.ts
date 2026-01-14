/**
 * File-related hooks using TanStack Query
 * Replaces manual useEffect-based fetching with optimized query hooks
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { fileService } from "@/lib/api/services";
import type { FileNode } from "@/lib/api/services";
import type { ApiError } from "@/lib/api/fetch-json";
import type { UseQueryOptions } from "@tanstack/react-query";

// ============================================================================
// File Directory Hook
// ============================================================================

export function useFileDirectory(
  path = "",
  options?: Omit<UseQueryOptions<FileNode[], ApiError>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.directory(path),
    queryFn: () => fileService.getDirectory(path),
    staleTime: 5 * 60_000, // 5 minutes - files don't change that often
    gcTime: 10 * 60_000, // 10 minutes
    refetchOnWindowFocus: false, // Disabled to prevent excessive refetching
    // REMOVED: refetchInterval - use manual refetch or websockets instead
    ...options,
  });
}

// ============================================================================
// Sidebar Projects Hook (for file tree)
// ============================================================================

export function useSidebarProjects(
  options?: Omit<UseQueryOptions<FileNode[], ApiError>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.sidebarProjects(),
    queryFn: () => fileService.getSidebarProjects(),
    staleTime: 5 * 60_000, // 5 minutes
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false, // Disabled to prevent excessive refetching
    // REMOVED: refetchInterval - use manual refetch or websockets instead
    ...options,
  });
}

// ============================================================================
// Project Files Hook
// ============================================================================

export function useProjectFiles(
  projectId: string,
  options?: Omit<UseQueryOptions<FileNode[], ApiError>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.projectFiles(projectId),
    queryFn: () => fileService.getProjectFiles(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60_000, // 5 minutes
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false, // Disabled to prevent excessive refetching
    ...options,
  });
}

// ============================================================================
// Mutation Hook for File Operations
// ============================================================================

export function useInvalidateFiles() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    invalidateDirectory: (path: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.directory(path) });
    },
    invalidateSidebar: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sidebarProjects() });
    },
    invalidateProject: (projectId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectFiles(projectId) });
    },
  };
}

