"use client";

import * as React from "react";
import { MoreHorizontal, Eye, Filter, RefreshCw, Download } from "lucide-react";
import { CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem as DropdownMenuItemPrimitive,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type CardTitleDropdownMenuItem =
  | {
      label: string;
      icon?: React.ComponentType<{ className?: string }>;
      onClick?: () => void;
      disabled?: boolean;
      badge?: string | number;
      variant?: "default" | "destructive";
      separator?: false;
    }
  | {
      separator: true;
    };

export interface CardTitleWithDropdownProps {
  /** Title text */
  children?: React.ReactNode;
  /** Class applied to the title text (backward-compatible: previously `className`) */
  className?: string;
  /** Class applied to the outer container */
  containerClassName?: string;
  /** Dropdown menu items */
  menuItems?: CardTitleDropdownMenuItem[];
  /** Optional badge to show on the dropdown trigger */
  triggerBadge?: string | number;
  /** Custom dropdown content (takes precedence over menuItems) */
  dropdownContent?: React.ReactNode;
  /** Whether to show the dropdown icon */
  showDropdown?: boolean;
  /** Alignment of the dropdown (default: 'right') */
  align?: "left" | "right" | "center";
}

export function CardTitleWithDropdown({
  className,
  containerClassName,
  menuItems = [],
  triggerBadge,
  children,
  dropdownContent,
  showDropdown = true,
  align = "right",
}: CardTitleWithDropdownProps) {
  const [open, setOpen] = React.useState(false);

  // Default menu items if none provided
  const defaultMenuItems: CardTitleDropdownMenuItem[] = React.useMemo(
    () => [
      {
        label: "View All",
        icon: Eye,
        onClick: () => {
          // Default action - can be overridden
        },
      },
      {
        label: "Filter",
        icon: Filter,
        onClick: () => {
          // Filter action
        },
      },
      {
        separator: true,
      },
      {
        label: "Refresh",
        icon: RefreshCw,
        onClick: () => {
          // Refresh action - could trigger a data refetch here
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        },
      },
      {
        label: "Export",
        icon: Download,
        onClick: () => {
          // Export action
        },
      },
    ],
    []
  );

  const itemsToRender = menuItems.length > 0 ? menuItems : defaultMenuItems;

  // Check if children has actual content (not just whitespace or comments)
  const hasChildren = children && React.Children.count(children) > 0;

  // Map friendly align values to Radix align values
  const dropdownAlign: "start" | "center" | "end" =
    align === "left" ? "start" : align === "right" ? "end" : "center";

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        hasChildren ? "justify-between w-full" : "justify-end",
        containerClassName
      )}
    >
      {hasChildren && (
        <CardTitle
          className={cn("leading-none font-semibold flex-1", className)}
        >
          {children}
        </CardTitle>
      )}
      {showDropdown && (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "group relative inline-flex items-center justify-center",
                "h-7 w-7 rounded-md transition-all duration-200",
                "bg-emerald-100/80 hover:bg-emerald-200",
                "text-emerald-900 hover:text-emerald-950",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                "active:scale-95",
                "disabled:pointer-events-none disabled:opacity-50",
                "border border-emerald-200/50"
              )}
              aria-label="Card options"
              aria-haspopup="true"
              aria-expanded={open}
            >
              <MoreHorizontal className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              {triggerBadge && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center rounded-full bg-emerald-600 text-white"
                >
                  {triggerBadge}
                </Badge>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={dropdownAlign}
            sideOffset={8}
            className="min-w-[180px]"
            onCloseAutoFocus={(e) => {
              // Prevent focus from going to the trigger after closing
              e.preventDefault();
            }}
          >
            {dropdownContent ? (
              dropdownContent
            ) : (
              <>
                {itemsToRender.map((item, index) => {
                  if (item.separator) {
                    return <DropdownMenuSeparator key={`separator-${index}`} />;
                  }

                  const Icon = item.icon;
                  return (
                    <DropdownMenuItemPrimitive
                      key={`item-${index}`}
                      onClick={(e) => {
                        e.preventDefault();
                        item.onClick?.();
                        setOpen(false);
                      }}
                      disabled={item.disabled}
                      variant={item.variant}
                      className="cursor-pointer"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && (
                        <Badge
                          variant="secondary"
                          className="ml-2 h-5 min-w-5 px-1.5 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </DropdownMenuItemPrimitive>
                  );
                })}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

