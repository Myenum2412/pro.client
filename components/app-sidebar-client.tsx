"use client"

import * as React from "react"
import { useCallback, useMemo } from "react"
import { Search } from "lucide-react"
import { useSidebarProjects } from "@/lib/hooks/use-files"
import { queryKeys } from "@/lib/query/keys"
import { FileTree } from "@/components/files/file-tree"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import type { FileNode } from "@/lib/api/services"
import {
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"

export function AppSidebarClient() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | undefined>()
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set())

  // Use centralized TanStack Query hook for sidebar projects
  const {
    data: sidebarProjects = [],
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = useSidebarProjects({
    // Using defaults from use-files hook (5 minutes staleTime, no polling)
    // This prevents excessive re-renders and network requests
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: { errorMessage: "Failed to load projects from files." },
  })

  // Transform and filter file/folder structure
  const fileTreeData = useMemo(() => {
    if (!sidebarProjects || sidebarProjects.length === 0) {
      return [];
    }
    
    // Helper function to filter out RFI folders recursively
    const filterRFI = (items: FileNode[]): FileNode[] => {
      return items
        .filter((item) => {
          // Filter out RFI folders
          const isRFI = item.name.toUpperCase().includes("RFI") || item.name.toUpperCase() === "RFI";
          return !isRFI;
        })
        .map((item) => {
          if (item.children && item.children.length > 0) {
            return {
              ...item,
              children: filterRFI(item.children),
            };
          }
          return item;
        });
    };
    
    const filtered = filterRFI(sidebarProjects);
    return filtered;
  }, [sidebarProjects]);

  // Filter tree based on search query
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return fileTreeData;

    const filterNodes = (nodes: FileNode[]): FileNode[] => {
      const filtered: FileNode[] = [];
      
      for (const node of nodes) {
        const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
        const filteredChildren = node.children ? filterNodes(node.children) : undefined;
        const hasMatchingChildren = filteredChildren && filteredChildren.length > 0;

        if (matchesSearch || hasMatchingChildren) {
          filtered.push({
            ...node,
            children: filteredChildren,
          });
        }
      }
      
      return filtered;
    };

    return filterNodes(fileTreeData);
  }, [fileTreeData, searchQuery]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleSelect = useCallback((node: FileNode) => {
    setSelectedId(node.id);
    if (node.type === "folder") {
      // Toggle expand/collapse on select
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }
        return next;
      });
    }
  }, []);

  const handleHover = useCallback((node: FileNode) => {
    // Optional: handle hover events if needed
  }, []);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      {/* File Tree */}
      <div className="px-2 pb-2 overflow-y-auto max-h-[calc(100vh-300px)]">
        {isProjectsLoading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={`sk_${i}`} className="flex items-center gap-2 px-2 py-1.5">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : isProjectsError ? (
          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
            Failed to load files
          </div>
        ) : filteredTree.length === 0 ? (
          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
            {searchQuery ? "No files found" : "No files yet"}
          </div>
        ) : (
          <div className="w-full">
            <FileTree
              data={filteredTree}
              onSelect={handleSelect}
              onHover={handleHover}
              selectedId={selectedId}
              expandedIds={expandedIds}
            />
          </div>
        )}
      </div>
    </SidebarGroup>
  )
}

