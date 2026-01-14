"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useDebounce from "@/hooks/use-debounce";

interface TopHeaderSearchProps {
  placeholder: string;
  searchKey?: string;
}

export function TopHeaderSearch({ placeholder, searchKey = "q" }: TopHeaderSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => {
    return searchParams.get(searchKey) || "";
  });
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Update URL when debounced query changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery.trim()) {
      params.set(searchKey, debouncedQuery);
    } else {
      params.delete(searchKey);
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [debouncedQuery, searchKey, router, searchParams]);

  // Sync with URL changes
  useEffect(() => {
    const urlQuery = searchParams.get(searchKey) || "";
    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams, searchKey]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Search is handled by the debounced effect
  }, []);

  const handleClear = useCallback(() => {
    setSearchQuery("");
    // Immediately update URL to remove query param
    const params = new URLSearchParams(searchParams.toString());
    params.delete(searchKey);
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [searchKey, router, searchParams]);

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="w-full max-w-md"
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          className="pl-9 pr-9 w-full"
          autoComplete="off"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}

