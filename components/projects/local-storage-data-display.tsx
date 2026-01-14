"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { History, FileText, Image as ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDate } from "@/lib/utils/date-format"

type LocalStorageItem = {
  key: string
  value: string
  parsed?: any
}

export function LocalStorageDataDisplay() {
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

    // Filter for "Approval Draw" related items
    const filteredItems = allItems.filter((item) => {
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
      return hasApprovalDrawPhrase || 
             (keyHasApproval && keyHasDraw) || 
             (valueHasApproval && valueHasDraw)
    })

    // Sort by key name
    filteredItems.sort((a, b) => a.key.localeCompare(b.key))
    setItems(filteredItems)
  }

  const formatValue = (item: LocalStorageItem): string => {
    if (typeof item.parsed === "object" && item.parsed !== null) {
      if (Array.isArray(item.parsed)) {
        return `Array (${item.parsed.length} items)`
      }
      return `Object (${Object.keys(item.parsed).length} keys)`
    }
    if (typeof item.parsed === "string") {
      const maxLength = 100
      return item.parsed.length > maxLength
        ? `${item.parsed.substring(0, maxLength)}...`
        : item.parsed
    }
    return String(item.parsed)
  }

  const getItemIcon = (item: LocalStorageItem) => {
    const lowerKey = item.key.toLowerCase()
    if (lowerKey.includes("image") || lowerKey.includes("captured")) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const isImageData = (value: string): boolean => {
    return value.startsWith("data:image/") || value.startsWith("blob:")
  }

  if (!mounted) {
    return null
  }

  if (items.length === 0) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b shrink-0 bg-emerald-50/70 p-6">
        <CardTitle className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
          <History className="h-5 w-5" />
          Local Storage Data
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.key} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getItemIcon(item)}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-medium text-sm truncate">{item.key}</span>
                        {isImageData(item.value) ? (
                          <div className="mt-2">
                            <img 
                              src={item.value} 
                              alt={item.key}
                              className="max-w-full h-auto max-h-32 rounded border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground break-words">
                            {formatValue(item)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {typeof item.parsed === "object" && item.parsed !== null
                        ? Array.isArray(item.parsed)
                          ? "Array"
                          : "Object"
                        : "String"}
                    </Badge>
                  </div>
                  {item.key.includes("captured_image_") && (
                    <div className="text-xs text-muted-foreground">
                      {formatDate(new Date(item.key.replace("captured_image_", "")))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

