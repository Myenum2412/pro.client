"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, FileText, FolderIcon, Clock } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  extension?: string;
  size?: number;
  driveId?: string;
  webViewLink?: string;
};

type SearchResult = FileNode & {
  matchType: "name" | "extension" | "path";
};

type FloatingSearchProps = {
  files: FileNode[];
  onSelectFile: (file: FileNode) => void;
};

export function FloatingSearch({ files, onSelectFile }: FloatingSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentFileSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Keyboard shortcut: Ctrl+K or Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Flatten file tree for searching
  const flattenFiles = useCallback((nodes: FileNode[]): FileNode[] => {
    const result: FileNode[] = [];
    
    const traverse = (items: FileNode[]) => {
      items.forEach((item) => {
        result.push(item);
        if (item.type === "folder" && (item as any).children) {
          traverse((item as any).children);
        }
      });
    };
    
    traverse(nodes);
    return result;
  }, []);

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSelectedIndex(0);
      return;
    }

    const query = searchQuery.toLowerCase();
    const allFiles = flattenFiles(files);
    
    const results: SearchResult[] = allFiles
      .map((file) => {
        const nameLower = file.name.toLowerCase();
        const pathLower = file.path.toLowerCase();
        const extLower = file.extension?.toLowerCase() || "";

        let matchType: "name" | "extension" | "path" = "name";
        let score = 0;

        // Exact name match
        if (nameLower === query) {
          score = 100;
          matchType = "name";
        }
        // Name starts with query
        else if (nameLower.startsWith(query)) {
          score = 90;
          matchType = "name";
        }
        // Name contains query
        else if (nameLower.includes(query)) {
          score = 80;
          matchType = "name";
        }
        // Extension match
        else if (extLower.includes(query)) {
          score = 70;
          matchType = "extension";
        }
        // Path match
        else if (pathLower.includes(query)) {
          score = 60;
          matchType = "path";
        }
        // No match
        else {
          return null;
        }

        return { ...file, matchType, score } as SearchResult & { score: number };
      })
      .filter((result): result is SearchResult & { score: number } => result !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Limit to 20 results

    setSearchResults(results);
    setSelectedIndex(0);
  }, [searchQuery, files, flattenFiles]);

  // Handle result selection
  const handleSelectResult = (file: FileNode) => {
    // Save to recent searches
    const newRecent = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem("recentFileSearches", JSON.stringify(newRecent));

    // Close and select file
    setIsOpen(false);
    setSearchQuery("");
    onSelectFile(file);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && searchResults[selectedIndex]) {
        e.preventDefault();
        handleSelectResult(searchResults[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, searchResults, selectedIndex]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <>

      {/* Search Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
          {/* Search Input */}
          <div className="relative border-b">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, pages..."
              className="border-0 pl-12 pr-12 h-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Search Results */}
          <ScrollArea className="max-h-[400px]">
            <div className="p-2">
              {!searchQuery && recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <Clock className="h-3 w-3" />
                    Recent Searches
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(search)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-left transition-colors"
                    >
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">No results found</p>
                  <p className="text-xs text-muted-foreground">
                    Try searching with different keywords
                  </p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Files & Folders ({searchResults.length})
                  </div>
                  {searchResults.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectResult(result)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-md text-left transition-colors",
                        index === selectedIndex
                          ? "bg-accent"
                          : "hover:bg-accent/50"
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          result.type === "folder"
                            ? "bg-blue-100 dark:bg-blue-950"
                            : "bg-gray-100 dark:bg-gray-800"
                        )}
                      >
                        {result.type === "folder" ? (
                          <FolderIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {result.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span className="truncate">{result.path}</span>
                          {result.size && (
                            <>
                              <span>•</span>
                              <span>{formatFileSize(result.size)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Match Badge */}
                      {result.matchType !== "name" && (
                        <div className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                          {result.matchType}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t px-4 py-3 flex items-center justify-between text-xs text-muted-foreground bg-muted/30">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-background border">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-background border">↓</kbd>
                <span className="ml-1">Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-background border">Enter</kbd>
                <span className="ml-1">Select</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-background border">Esc</kbd>
                <span className="ml-1">Close</span>
              </div>
            </div>
            <div className="text-xs">
              {searchResults.length > 0 && `${searchResults.length} results`}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

