"use client"

import { Folder, MoreHorizontal, FileText, ChevronRight, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

type ProjectItem = {
  id: string
  jobNumber: string
  name: string
  path?: string
  children?: Array<{
    id: string
    name: string
    type: "folder" | "file"
    path: string
    children?: Array<{
      id: string
      name: string
      type: "folder" | "file"
      path: string
      children?: Array<{
        id: string
        name: string
        type: "folder" | "file"
        path: string
      }>
    }>
  }>
}

// Recursive component for nested folder structure
function NestedFolderItem({
  item,
  level = 0,
  openItems,
  setOpenItems,
}: {
  item: NonNullable<ProjectItem["children"]>[number]
  level?: number
  openItems: Set<string>
  setOpenItems: React.Dispatch<React.SetStateAction<Set<string>>>
}) {
  const hasChildren = item.children && item.children.length > 0
  const isOpen = openItems.has(item.id)
  const isFolder = item.type === "folder"

  if (!isFolder) {
    // For files, just show as a simple link
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild>
          <Link href={item.path || `/files/${item.id}`} target={item.path?.startsWith('http') ? "_blank" : undefined}>
            <div className="size-4" />
            <FileText className="size-4" />
            <span className="truncate">{item.name}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    )
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={(open) => {
        setOpenItems((prev) => {
          const next = new Set(prev)
          if (open) {
            next.add(item.id)
          } else {
            next.delete(item.id)
          }
          return next
        })
      }}
    >
      <SidebarMenuSubItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuSubButton>
            {hasChildren ? (
              isOpen ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )
            ) : (
              <div className="size-4" />
            )}
            <Folder className="size-4" />
            <span className="truncate">{item.name}</span>
          </SidebarMenuSubButton>
        </CollapsibleTrigger>
        {hasChildren && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children!.map((child) => (
                <NestedFolderItem
                  key={child.id}
                  item={child}
                  level={level + 1}
                  openItems={openItems}
                  setOpenItems={setOpenItems}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuSubItem>
    </Collapsible>
  )
}

export function NavProjects({
  projects,
  isLoading,
  isError,
}: {
  projects: ProjectItem[]
  isLoading?: boolean
  isError?: boolean
}) {
  const { isMobile } = useSidebar()
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {isLoading ? (
          <>
            {[0, 1, 2].map((i) => (
              <SidebarMenuItem key={`sk_${i}`}>
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </SidebarMenuItem>
            ))}
          </>
        ) : isError ? (
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <span>Failed to load projects</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : projects.length ? (
          projects.map((item) => {
            const hasChildren = item.children && item.children.length > 0
            const isOpen = openItems.has(item.id)
            
            return (
              <Collapsible
                key={item.id}
                open={isOpen}
                onOpenChange={(open) => {
                  setOpenItems((prev) => {
                    const next = new Set(prev)
                    if (open) {
                      next.add(item.id)
                    } else {
                      next.delete(item.id)
                    }
                    return next
                  })
                }}
              >
                <SidebarMenuItem>
                  <div className="flex items-center w-full">
                    {hasChildren ? (
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction className="mr-1">
                          {isOpen ? (
                            <ChevronDown className="size-4 transition-transform duration-200" />
                          ) : (
                            <ChevronRight className="size-4 transition-transform duration-200" />
                          )}
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                    ) : (
                      <div className="size-4 mr-1" />
                    )}
                    <SidebarMenuButton
                      asChild
                      tooltip={item.jobNumber || item.name}
                      className={cn(
                        "flex-1",
                        hasChildren && isOpen && "bg-sidebar-accent"
                      )}
                    >
                      <Link href={`/files/${encodeURIComponent(item.id)}`}>
                        <Folder className="size-4" />
                        <span className="truncate">
                          {item.jobNumber ? `${item.jobNumber} — ${item.name}` : item.name}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover>
                          <MoreHorizontal className="size-4 text-muted-foreground" />
                          <span className="sr-only">More</span>
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-48 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align={isMobile ? "end" : "start"}
                      >
                        <DropdownMenuItem asChild>
                          <Link href={`/files/${encodeURIComponent(item.id)}`}>
                            View Files
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>
                          <span>Actions (coming soon)</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {hasChildren && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children!.map((child) => (
                          <NestedFolderItem
                            key={child.id}
                            item={child}
                            level={1}
                            openItems={openItems}
                            setOpenItems={setOpenItems}
                          />
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            )
          })
        ) : (
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <span>No projects yet</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
