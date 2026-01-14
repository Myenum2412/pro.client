"use client"

import { useMemo } from "react"
import { FolderPlus, Loader2, AlertCircle } from "lucide-react"
import { useSidebarProjects } from "@/lib/hooks/use-files"
import type { FileNode } from "@/lib/api/services"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function SidebarFilesItems() {
  // Use centralized TanStack Query hook for sidebar projects
  const {
    data: fileTree = [],
    isLoading,
    error,
  } = useSidebarProjects({
    // Using defaults from use-files hook (5 minutes staleTime, no polling)
    // This prevents excessive re-renders and network requests
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: { errorMessage: "Failed to load files." },
  })

  // Memoize folder filtering for performance
  const folders = useMemo(
    () => fileTree.filter((item) => item.type === "folder"),
    [fileTree]
  )

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading files...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-8">
          <AlertCircle className="size-5 text-destructive" />
          <span className="ml-2 text-sm text-destructive">Failed to load files</span>
        </div>
      </div>
    )
  }

  if (folders.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-8">
          <span className="text-sm text-muted-foreground">No folders found</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-3">
        {folders.map((folder) => {
          const itemCount = folder.children?.length || 0
          
          return (
            <Link
              key={folder.id}
              href={`/files/${encodeURIComponent(folder.id)}`}
              className={cn(
                "group relative flex flex-col p-4 rounded-lg border border-border",
                "bg-background hover:bg-accent/50 hover:border-accent transition-all",
                "cursor-pointer shadow-sm hover:shadow-md"
              )}
            >
              {/* Folder Icon - Top Left */}
              <div className="mb-3">
                <div className="w-10 h-10 rounded-md bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <FolderPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              {/* Folder Name and Count */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-tight mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
                  {folder.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

