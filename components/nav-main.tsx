"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type NavItem = {
  title: string
  url: string
  icon?: LucideIcon | React.ComponentType<any>
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
  customContent?: React.ReactNode
}

/* -------------------------------------------------------------------------- */
/*                              SIDEBAR ITEMS                                 */
/* -------------------------------------------------------------------------- */

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderKanban,
    items: [
      {
        title: "Active Projects",
        url: "/projects/active",
      },
      {
        title: "Completed Projects",
        url: "/projects/completed",
      },
    ],
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export function NavMain({ items = navItems }: { items?: NavItem[] }) {
  const pathname = usePathname()
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({})
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)

    // Open all collapsible menus by default (client-only)
    const initialState: Record<string, boolean> = {}
    items.forEach((item) => {
      if (item.items?.length || item.customContent) {
        initialState[item.title] = true
      }
    })
    setOpenItems(initialState)
  }, [items])

  // Check if an item is active based on current pathname
  const isItemActive = (url: string) => {
    // Exact match
    if (pathname === url) return true
    
    // For nested routes, check if pathname starts with url followed by "/"
    // This prevents false matches (e.g., /client/billing-details matching /client/billing)
    if (url !== "/" && pathname.startsWith(url + "/")) return true
    
    return false
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = Boolean(item.items?.length || item.customContent)
          const Icon = item.icon

          // Non-collapsible menu item
          if (!hasChildren) {
            const active = isItemActive(item.url)
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  tooltip={item.title}
                  isActive={active}
                  className={active ? "!bg-green-500 !text-white hover:!bg-green-600" : ""}
                >
                  <Link href={item.url}>
                    {Icon && (
                      <div suppressHydrationWarning className="h-4 w-4 flex items-center justify-center">
                        <Icon className="h-4 w-4" />
                      </div>
                    )}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          // Collapsible menu item
          const isOpen = mounted ? openItems[item.title] ?? true : false
          const active = isItemActive(item.url)

          return (
            <SidebarMenuItem key={item.title}>
              <Collapsible
                open={isOpen}
                onOpenChange={(open) =>
                  setOpenItems((prev) => ({
                    ...prev,
                    [item.title]: open,
                  }))
                }
                className="group/collapsible"
              >
                <div className="flex items-center group/item">
                  <SidebarMenuButton 
                    asChild 
                    className={`flex-1 ${active ? "!bg-green-500 !text-white hover:!bg-green-600" : ""}`}
                    isActive={active}
                  >
                    <Link href={item.url}>
                      {Icon && (
                        <div suppressHydrationWarning className="h-4 w-4 flex items-center justify-center">
                          <Icon className="h-4 w-4" />
                        </div>
                      )}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>

                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors opacity-0 group-hover/item:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ChevronDown
                        className={`h-4 w-4 text-black transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  {item.customContent && (
                    <div className="px-2 pb-2">
                      {item.customContent}
                    </div>
                  )}
                  {item.items && item.items.length > 0 && (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const subActive = isItemActive(subItem.url)
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton 
                              asChild
                              isActive={subActive}
                              className={subActive ? "!bg-green-500 !text-white hover:!bg-green-600" : ""}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
