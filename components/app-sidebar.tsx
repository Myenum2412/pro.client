"use client"

import * as React from "react"
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Icon from '@mdi/react'
import { mdiDotsHexagon } from '@mdi/js'
import Link from "next/link"
import { Folder, FileText, Loader2, Search, ChevronDown } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { GoDependabot } from "react-icons/go";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Wrapper component for Material Community Icons to work with NavMain
const DotsHexagonIcon = React.forwardRef<HTMLDivElement, { className?: string }>(
  ({ className, ...props }, ref) => {
    // Extract size from className (h-4 = 16px, h-5 = 20px, etc.) or default to 16px
    const sizeMatch = className?.match(/h-(\d+)/)
    const size = sizeMatch ? parseInt(sizeMatch[1]) * 4 : 16
    return (
      <div ref={ref} className={className} {...props}>
        <Icon path={mdiDotsHexagon} size={size} />
      </div>
    )
  }
)
DotsHexagonIcon.displayName = 'DotsHexagonIcon'

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { AppSidebarClient } from "@/components/app-sidebar-client"
import { SidebarStandardFolders } from "@/components/sidebar-standard-folders"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"

export type SidebarUser = {
  name: string
  email: string
  avatar: string
}

type AssetNode = {
  name: string
  path: string
  type: "file" | "folder"
  children?: AssetNode[]
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: SidebarUser }) {
  const pathname = usePathname()
  const router = useRouter()
  const [assetsTree, setAssetsTree] = React.useState<AssetNode[]>([])
  const [assetsLoading, setAssetsLoading] = React.useState(false)
  const [assetsError, setAssetsError] = React.useState<string | null>(null)
  const [openFolders, setOpenFolders] = React.useState<Record<string, boolean>>({})
  const [assetSearch, setAssetSearch] = React.useState("")
  const [navSearch, setNavSearch] = React.useState("")
  const [isNavPopoverOpen, setIsNavPopoverOpen] = React.useState(false)

  React.useEffect(() => {
    const loadAssets = async () => {
      try {
        setAssetsLoading(true)
        setAssetsError(null)
        const res = await fetch("/api/assets")
        if (!res.ok) throw new Error("Failed to load assets")
        const data = await res.json()
        setAssetsTree(data.tree ?? [])
      } catch (err: any) {
        setAssetsError(err.message || "Unable to load assets")
      } finally {
        setAssetsLoading(false)
      }
    }
    loadAssets()
  }, [])

  const toggleFolder = React.useCallback((path: string) => {
    setOpenFolders((prev) => ({ ...prev, [path]: !prev[path] }))
  }, [])

  // Extract job number from folder name (e.g., "U2524" from "U2524_Valley View Bus" or "PRO 042_U2524_Valley View")
  const extractJobNumber = React.useCallback((folderName: string): string | null => {
    // Pattern 1: "U2524_..." or "U2524" (starts with U followed by numbers)
    const uPattern = /^U\d+/i;
    const uMatch = folderName.match(uPattern);
    if (uMatch) {
      return uMatch[0];
    }
    
    // Pattern 2: "PRO XXX_U2524_..." (extract U number after PRO prefix)
    const proPattern = /PRO\s*\d+[_-](U\d+)/i;
    const proMatch = folderName.match(proPattern);
    if (proMatch) {
      return proMatch[1];
    }
    
    // Pattern 3: "PRO-2025-XXX" format
    const proDashPattern = /^PRO-2025-\d+/i;
    const proDashMatch = folderName.match(proDashPattern);
    if (proDashMatch) {
      return proDashMatch[0];
    }
    
    return null;
  }, [])

  const renderAssets = React.useCallback(
    (nodes: AssetNode[], depth = 0) => {
      return nodes.map((node) => {
        const paddingLeft = depth * 12

        if (node.type === "file") {
          return (
            <SidebarMenuItem key={node.path}>
              <SidebarMenuButton asChild className="justify-start" style={{ paddingLeft }}>
                <Link href={node.path} target="_blank">
                  <FileText className="h-4 w-4" />
                  <span className="truncate">{node.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        }

        // Folders start collapsed by default
        const isOpen = openFolders[node.path] ?? false
        
        // For top-level project folders (depth 0), check if we can extract a job number
        const jobNumber = depth === 0 ? extractJobNumber(node.name) : null
        const isProjectFolder = jobNumber !== null

        return (
          <SidebarMenuItem key={node.path}>
            {isProjectFolder ? (
              // Navigate to project page for top-level project folders
              <SidebarMenuButton
                asChild
                className="justify-start"
                style={{ paddingLeft }}
              >
                <Link href={`/client/projects?project=${encodeURIComponent(jobNumber)}`}>
                  <Folder className="h-4 w-4 text-blue-500" />
                  <span className="truncate flex-1">{node.name}</span>
                </Link>
              </SidebarMenuButton>
            ) : (
              // Regular folder toggle for nested folders
              <>
                <SidebarMenuButton
                  className="justify-start"
                  style={{ paddingLeft }}
                  onClick={() => toggleFolder(node.path)}
                >
                  <Folder className="h-4 w-4 text-blue-500" />
                  <span className="truncate flex-1">{node.name}</span>
                  <span className="text-xs text-muted-foreground">{isOpen ? "−" : "+"}</span>
                </SidebarMenuButton>
                {isOpen && node.children && node.children.length > 0 && (
                  <SidebarMenu className="mt-1">
                    {renderAssets(node.children, depth + 1)}
                  </SidebarMenu>
                )}
              </>
            )}
          </SidebarMenuItem>
        )
      })
    },
    [openFolders, toggleFolder, extractJobNumber]
  )

  const filterAssets = React.useCallback(
    (nodes: AssetNode[], query: string): AssetNode[] => {
      if (!query.trim()) return nodes
      const q = query.toLowerCase()

      const filtered: AssetNode[] = []
      nodes.forEach((node) => {
        const nameMatch = node.name.toLowerCase().includes(q)

        if (node.type === "folder" && node.children) {
          const childMatches = filterAssets(node.children, query)
          if (nameMatch || childMatches.length > 0) {
            filtered.push({
              ...node,
              children: childMatches,
            })
          }
        } else if (nameMatch) {
          filtered.push(node)
        }
      })
      return filtered
    },
    []
  )

  // Filter to show only project folders (folders starting with "U" or matching project patterns)
  const projectFolders = React.useMemo(() => {
    return assetsTree.filter((node) => {
      // Show folders that look like project folders (start with "U" followed by numbers)
      if (node.type === "folder") {
        return /^U\d+/.test(node.name) || node.name.includes("_")
      }
      return false
    })
  }, [assetsTree])

  const filteredAssets = React.useMemo(
    () => filterAssets(projectFolders, assetSearch),
    [projectFolders, assetSearch, filterAssets]
  )

  const showAssetsSection = pathname.startsWith("/client/projects")

  // Navigation data - defined after hooks so it can use filteredAssets and renderAssets
  const data = React.useMemo(() => ({
    navMain: [
      {
        title: "Dashboard",
        url: "/client/dashboard",
        icon: DashboardIcon,
      },
      {
        title: "Projects",
        url: "/client/projects",
        icon: AccountTreeIcon,
        isActive: true,
        customContent: (
          <div className="px-2 pb-2 pt-1 space-y-2">
            <Input
              value={assetSearch}
              onChange={(e) => setAssetSearch(e.target.value)}
              placeholder="Search project folders..."
              className="h-8 text-sm"
            />
            {assetsLoading ? (
              <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : assetsError ? (
              <div className="px-2 py-2 text-sm text-destructive">{assetsError}</div>
            ) : filteredAssets.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto">
                <SidebarMenu>
                  {renderAssets(filteredAssets)}
                </SidebarMenu>
              </div>
            ) : assetSearch.trim() ? (
              <div className="px-2 py-2 text-sm text-muted-foreground">No folders found</div>
            ) : null}
          </div>
        ),
      },
      {
        title: "Submissions",
        url: "/client/submissions",
        icon: CloudUploadIcon,
      },
      {
        title: "Billing",
        url: "/client/billing",
        icon: DriveFolderUploadIcon,
      },
      {
        title: "Chat",
        url: "/client/chat",
        icon: QuestionAnswerIcon,
      },
      {
        title: "AI Chat",
        url: "/client/ai-chat",
        icon: GoDependabot,
      }
    ],
  }), [assetSearch, assetsLoading, assetsError, filteredAssets, renderAssets])

  // Filter navigation items based on search (if needed for future use)
  const filteredNavItems = React.useMemo(() => {
    if (!navSearch.trim()) return data.navMain
    const query = navSearch.toLowerCase()
    return data.navMain.filter((item) =>
      item.title.toLowerCase().includes(query)
    )
  }, [navSearch, data])

  return (
    <Sidebar collapsible="icon" {...props} >
      <SidebarHeader>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Image
              src="/image/logo.png"
              alt="Proultima"
              width={48}
              height={48}
              className="h-12 w-12 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 object-contain shrink-0 transition-all duration-200"
              priority
            />
            <span className="group-data-[collapsible=icon]:hidden font-semibold">Proultima</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <SidebarStandardFolders />
        <AppSidebarClient />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}