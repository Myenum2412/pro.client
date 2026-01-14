"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  Upload,
  DollarSign,
  MessageSquare,
  FileText,
  Folder,
  Calendar,
  User,
  CreditCard,
  Settings,
  Loader2,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import useDebounce from "@/hooks/use-debounce";

const getIcon = (iconName: string) => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    folder: FolderKanban,
    "file-text": FileText,
    "dollar-sign": DollarSign,
    send: Upload,
    "alert-circle": Settings,
    "help-circle": MessageSquare,
  };
  return icons[iconName] || FileText;
};

export function FloatingSearchButton() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // Check if we're on login page
  const isLoginPage = pathname === "/login";
  
  // Mark as mounted after hydration to avoid mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if any dialog is open and hide the floating search button
  useEffect(() => {
    if (!isMounted) return;

    const checkDialog = () => {
      const dialogOverlay = document.querySelector('[data-slot="dialog-overlay"][data-state="open"]');
      setIsDialogOpen(!!dialogOverlay);
    };

    // Check initially
    checkDialog();

    // Watch for dialog changes
    const observer = new MutationObserver(checkDialog);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state'],
    });

    return () => observer.disconnect();
  }, [isMounted]);

  // Fetch search results when query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const fetchResults = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    if (!isMounted || isLoginPage || typeof window === "undefined") return;
    
      const handleKeyDown = (e: KeyboardEvent) => {
        try {
          if ((e.metaKey || e.ctrlKey) && e.key === "k") {
            e.preventDefault();
          setIsOpen((prev) => !prev);
          }
      } catch (error) {
        // Silently handle keyboard event errors
        }
      };

    try {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        try {
          window.removeEventListener("keydown", handleKeyDown);
        } catch {
          // Silently handle cleanup errors
        }
      };
    } catch (error) {
      // Silently handle event listener errors
      return;
    }
  }, [isMounted, isLoginPage]);

  const runCommand = (command: () => void) => {
    setIsOpen(false);
    setSearchQuery("");
    command();
  };

  // Navigation items (always shown)
  const navigationItems = useMemo(() => [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      shortcut: "⌘D",
    },
    {
      title: "Projects",
      url: "/client/projects",
      icon: FolderKanban,
      shortcut: "⌘P",
    },
    {
      title: "Submissions",
      url: "/submissions",
      icon: Upload,
      shortcut: "⌘S",
    },
    {
      title: "Billing",
      url: "/billing",
      icon: DollarSign,
      shortcut: "⌘B",
    },
    {
      title: "Chat",
      url: "/chat",
      icon: MessageSquare,
      shortcut: "⌘C",
    },
  ], []);

  if (!isMounted || isLoginPage) return null;

  return (
    <>
      {/* Floating Search Button */}
      <div className={`fixed top-4 right-4 z-50 ${isDialogOpen ? 'hidden' : ''}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 p-0 bg-emerald-600 hover:bg-emerald-700"
          size="icon"
          aria-label="Open search (⌘K)"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Command Palette */}
      <CommandDialog open={isOpen} onOpenChange={(open) => {
              setIsOpen(open);
        if (!open) {
          setSearchQuery("");
          setSearchResults([]);
            }
      }}>
        <CommandInput 
          placeholder="Search all projects, drawings, billing, submissions..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {isSearching && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
            <CommandEmpty>No results found for &quot;{searchQuery}&quot;</CommandEmpty>
          )}

          {!isSearching && searchQuery.trim() && searchResults.length > 0 && (
            <>
              {Object.entries(
                searchResults.reduce((acc, result) => {
                  const type = result.type || "other";
                  if (!acc[type]) acc[type] = [];
                  acc[type].push(result);
                  return acc;
                }, {} as Record<string, typeof searchResults>)
              ).map(([type, typeResults]) => {
                const typedResults = typeResults as typeof searchResults;
                return (
                <CommandGroup key={type} heading={`${type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " ")} (${typedResults.length})`}>
                  {typedResults.map((result) => {
                    const IconComponent = getIcon(result.icon);
                    return (
                      <CommandItem
                        key={result.id}
                        onSelect={() => runCommand(() => {
                          if (result.url) {
                            router.push(result.url);
                          }
                        })}
                      >
                        <IconComponent className="mr-2 h-4 w-4" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="truncate">{result.label}</span>
                          {result.description && (
                            <span className="text-xs text-muted-foreground truncate">{result.description}</span>
                          )}
                        </div>
                        {result.end && (
                          <span className="ml-auto text-xs text-muted-foreground shrink-0">{result.end}</span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                );
              })}
            </>
          )}

          {!searchQuery.trim() && (
            <>
              <CommandGroup heading="Navigation">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <CommandItem
                      key={item.title}
                      onSelect={() => runCommand(() => router.push(item.url))}
                    >
                      <IconComponent className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                      {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              
              <CommandSeparator />
              
              <CommandGroup heading="Quick Actions">
                <CommandItem onSelect={() => runCommand(() => {
                  // Search documents action
                })}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Search Documents</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => {
                  // Browse files action
                })}>
                  <Folder className="mr-2 h-4 w-4" />
                  <span>Browse Files</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => {
                  // Open calendar action
                })}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Open Calendar</span>
                </CommandItem>
              </CommandGroup>
              
              <CommandSeparator />
              
              <CommandGroup heading="Settings">
                <CommandItem onSelect={() => runCommand(() => {
                  // Profile action
                })}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                  <CommandShortcut>⌘⇧P</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => {
                  router.push("/billing");
                })}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing Settings</span>
                  <CommandShortcut>⌘⇧B</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => {
                  // Settings action
                })}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                  <CommandShortcut>⌘⇧S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

