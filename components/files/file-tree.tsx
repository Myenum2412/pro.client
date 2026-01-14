"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, File, MoreHorizontal, Download, Eye, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  extension?: string;
  size?: number;
};

type FileTreeItemProps = {
  node: FileNode;
  level?: number;
  onSelect?: (node: FileNode) => void;
  onHover?: (node: FileNode) => void;
  selectedId?: string;
  expandedIds?: Set<string>;
};

function FileTreeItem({ node, level = 0, onSelect, onHover, selectedId, expandedIds }: FileTreeItemProps) {
  // Consider folders with empty children array as having children (for standard folders)
  const hasChildren = node.type === "folder" && (node.children !== undefined);
  const isSelected = selectedId === node.id;
  const isOpen = expandedIds?.has(node.id) ?? false;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === "folder") {
      // Toggle expand/collapse by calling onSelect
      // The parent will handle updating expandedIds
      onSelect?.(node);
    } else {
      // For files, just select
      onSelect?.(node);
    }
  };

  const handleMouseEnter = () => {
    if (node.type === "folder") {
      onHover?.(node);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 group/item px-2 py-1.5 rounded-md hover:bg-accent transition-colors",
          isSelected && "bg-accent",
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <div
          className="flex items-center gap-2 flex-1 cursor-pointer min-w-0"
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
        >
          {node.type === "folder" && (
            <span className="shrink-0">
              {hasChildren ? (
                isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )
              ) : (
                <div className="w-4" />
              )}
            </span>
          )}
          
          <span className="shrink-0">
            {node.type === "folder" ? (
              isOpen ? (
                <FolderOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 text-blue-500" />
              )
            ) : (
              <FileText className="h-4 w-4 text-gray-500" />
            )}
          </span>

          <span className="text-sm truncate flex-1">{node.name}</span>
        </div>

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover/item:opacity-100 h-6 w-6 flex items-center justify-center rounded hover:bg-accent transition-opacity shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">More options</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={node.path || `#`} target={node.path?.startsWith('http') ? "_blank" : undefined}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={node.path || `#`} download>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            {node.type === "folder" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <span className="text-xs text-muted-foreground">Folder Actions</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {node.type === "folder" && isOpen && hasChildren && node.children && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              onHover={onHover}
              selectedId={selectedId}
              expandedIds={expandedIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type FileTreeProps = {
  data: FileNode[];
  onSelect?: (node: FileNode) => void;
  onHover?: (node: FileNode) => void;
  selectedId?: string;
  expandedIds?: Set<string>;
};

export function FileTree({ data, onSelect, onHover, selectedId, expandedIds }: FileTreeProps) {
  return (
    <div className="space-y-1">
      {data.map((node) => (
        <FileTreeItem
          key={node.id}
          node={node}
          onSelect={onSelect}
          onHover={onHover}
          selectedId={selectedId}
          expandedIds={expandedIds}
        />
      ))}
    </div>
  );
}

