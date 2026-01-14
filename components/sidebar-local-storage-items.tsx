"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { History, Trash2 } from "lucide-react"
import {
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

type LocalStorageItem = {
  key: string
  value: string
  parsed?: any
}

export function SidebarLocalStorageItems() {
  const router = useRouter()
  const [items, setItems] = useState<LocalStorageItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadLocalStorageData()
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadLocalStorageData()
    }
    window.addEventListener("storage", handleStorageChange)
    
    // Also listen for custom events (same-origin updates)
    window.addEventListener("localStorageUpdate", handleStorageChange)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("localStorageUpdate", handleStorageChange)
    }
  }, [])

  const loadLocalStorageData = () => {
    if (typeof window === "undefined") return

    const allItems: LocalStorageItem[] = []
    
    // Iterate through all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue

      try {
        const value = localStorage.getItem(key)
        if (!value) continue

        // Try to parse as JSON
        let parsed: any = null
        try {
          parsed = JSON.parse(value)
        } catch {
          // Not JSON, use as string
          parsed = value
        }

        allItems.push({
          key,
          value,
          parsed,
        })
      } catch {
        // Silently handle localStorage errors
      }
    }

    // Sort by key name
    allItems.sort((a, b) => a.key.localeCompare(b.key))
    setItems(allItems)
  }

  const handleClearItem = (key: string) => {
    if (typeof window === "undefined") return
    if (confirm(`Are you sure you want to delete "${key}" from localStorage?`)) {
      localStorage.removeItem(key)
      loadLocalStorageData()
      
      // Dispatch custom event for same-origin updates
      window.dispatchEvent(new Event("localStorageUpdate"))
    }
  }

  const handleItemClick = (e: React.MouseEvent, item: LocalStorageItem) => {
    // Always prevent default for <a> tag behavior
    e.preventDefault()
    e.stopPropagation()
    
    // Prevent event from bubbling if delete button was clicked
    const target = e.target as HTMLElement
    if (target.closest('button[title*="Delete"]') || target.closest('button[aria-label*="Delete"]')) {
      return
    }
    
    // Check if item key or value contains "Approval Draw" (case-insensitive)
    // Match "Approval Draw" as a phrase or both words separately
    const lowerKey = item.key.toLowerCase().trim()
    const lowerValue = typeof item.parsed === "string" ? String(item.parsed).toLowerCase().trim() : ""
    const lowerValueString = typeof item.value === "string" ? item.value.toLowerCase().trim() : ""
    
    // Check for "approval draw" as exact phrase
    const hasApprovalDrawPhrase = lowerKey.includes("approval draw") || 
                                  lowerValue.includes("approval draw") || 
                                  lowerValueString.includes("approval draw")
    
    // Check for both "approval" and "draw/drawing" separately
    const keyHasApproval = lowerKey.includes("approval")
    const keyHasDraw = lowerKey.includes("draw") || lowerKey.includes("drawing")
    const valueHasApproval = lowerValue.includes("approval") || lowerValueString.includes("approval")
    const valueHasDraw = lowerValue.includes("draw") || lowerValue.includes("drawing") || 
                         lowerValueString.includes("draw") || lowerValueString.includes("drawing")
    
    // Match if phrase exists OR both words exist separately
    const matches = hasApprovalDrawPhrase || 
                   (keyHasApproval && keyHasDraw) || 
                   (valueHasApproval && valueHasDraw)
    
    if (matches) {
      // Navigate to projects page
      router.push("/client/projects")
    }
  }

  const formatValue = (item: LocalStorageItem): string => {
    if (typeof item.parsed === "object" && item.parsed !== null) {
      if (Array.isArray(item.parsed)) {
        return `Array (${item.parsed.length} items)`
      }
      return `Object (${Object.keys(item.parsed).length} keys)`
    }
    if (typeof item.parsed === "string") {
      const maxLength = 50
      return item.parsed.length > maxLength
        ? `${item.parsed.substring(0, maxLength)}...`
        : item.parsed
    }
    return String(item.parsed)
  }

  if (!mounted) {
    return (
      <SidebarMenuSub>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton className="opacity-50 cursor-not-allowed" aria-disabled="true">
            <History className="size-4" />
            <span>Loading...</span>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      </SidebarMenuSub>
    )
  }

  if (items.length === 0) {
    return (
      <SidebarMenuSub>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton className="opacity-50 cursor-not-allowed" aria-disabled="true">
            <History className="size-4" />
            <span>No localStorage data</span>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      </SidebarMenuSub>
    )
  }

  return (
    <SidebarMenuSub>
      {items.map((item) => (
        <SidebarMenuSubItem key={item.key}>
          <div className="flex items-center justify-between w-full group/item">
            <SidebarMenuSubButton 
              className="flex-1 min-w-0 cursor-pointer"
              onClick={(e) => handleItemClick(e, item)}
              href="#" // Prevent default anchor behavior
            >
              <History className="size-4 shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate text-xs font-medium">{item.key}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {formatValue(item)}
                </span>
              </div>
            </SidebarMenuSubButton>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                handleClearItem(item.key)
              }}
              title={`Delete ${item.key}`}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </SidebarMenuSubItem>
      ))}
    </SidebarMenuSub>
  )
}

