"use client";

import * as React from "react";
import { Folder, ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Standard folder structure
const STANDARD_FOLDERS = [
  { name: "AE Commands", order: 1, path: "/files" },
  { name: "Contract Drawing", order: 2, path: "/files" },
  { name: "Documents", order: 3, path: "/files" },
  { name: "Approval Drawing", order: 4, path: "/files" },
  { name: "FFu", order: 5, path: "/files" },
  { name: "Take Order", order: 6, path: "/files" },
];

export function SidebarStandardFolders() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(true);

  // Check if a folder path is active
  const isFolderActive = (path: string) => {
    if (pathname === path) return true;
    if (path !== "/" && pathname.startsWith(path + "/")) return true;
    return false;
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="flex items-center justify-between px-2">
          <SidebarGroupLabel className="font-semibold text-sm">
            Standard Folders
          </SidebarGroupLabel>
          <CollapsibleTrigger asChild>
            <button
              className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <SidebarMenu>
            {STANDARD_FOLDERS.map((folder) => {
              const active = isFolderActive(folder.path);
              return (
                <SidebarMenuItem key={folder.order}>
                  <SidebarMenuButton 
                    asChild 
                    className={`w-full justify-start ${active ? "!bg-green-500 !text-white hover:!bg-green-600" : ""}`}
                    isActive={active}
                  >
                    <Link href={folder.path}>
                      <Folder className={`h-4 w-4 ${active ? "text-white" : "text-blue-500"}`} />
                      <span className="truncate">{folder.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}
