"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  FolderKanban,
  FileText,
  DollarSign,
  Upload,
  Settings,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    project: "Project",
    drawing: "Drawing",
    invoice: "Billing",
    submission: "Submission",
    "change-order": "Change Order",
    rfi: "RFI",
  };
  return labels[type] || type;
};

export function ProjectSearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setResults([]);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }
        const data = await response.json();
        if (!cancelled) {
          setResults(data.results || []);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : "Failed to search";
          setError(errorMessage);
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      cancelled = true;
    };
  }, [query]);

  if (!query || query.trim().length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Searching for &quot;{query}&quot;...</span>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0 && !isLoading) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {error ? (
              <div>
                <p className="text-sm text-destructive mb-2">Error: {error}</p>
                <p className="text-sm text-muted-foreground">
                  Please try again or search with different terms.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No results found for &quot;{query}&quot;
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    const type = result.type || "other";
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(result);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>
          Search Results for &quot;{query}&quot; ({results.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedResults).map(([type, typeResults]) => {
          const typedResults = typeResults as any[];
          return (
          <div key={type}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              {getTypeLabel(type)} ({typedResults.length})
            </h3>
            <div className="space-y-2">
              {typedResults.map((result) => {
                const IconComponent = getIcon(result.icon);
                return (
                  <Link
                    key={result.id}
                    href={result.url || "#"}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto py-3 px-4 hover:bg-accent"
                    >
                      <IconComponent className="mr-3 h-5 w-5 shrink-0" />
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium truncate">{result.label}</div>
                        {result.description && (
                          <div className="text-xs text-muted-foreground truncate mt-1">
                            {result.description}
                          </div>
                        )}
                      </div>
                      {result.end && (
                        <span className="ml-2 text-xs text-muted-foreground shrink-0">
                          {result.end}
                        </span>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
