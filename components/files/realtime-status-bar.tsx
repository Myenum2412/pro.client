"use client";

import { RefreshCw, Wifi, WifiOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type RealtimeStatusBarProps = {
  isConnected: boolean;
  lastUpdated: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  autoRefreshEnabled: boolean;
  onToggleAutoRefresh: () => void;
};

export function RealtimeStatusBar({
  isConnected,
  lastUpdated,
  isRefreshing,
  onRefresh,
  autoRefreshEnabled,
  onToggleAutoRefresh,
}: RealtimeStatusBarProps) {
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return "Never";
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 10) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    
    return date.toLocaleTimeString();
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-600">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-600" />
              <span className="text-xs font-medium text-red-600">Disconnected</span>
            </>
          )}
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Updated {formatLastUpdated(lastUpdated)}</span>
        </div>

        {/* Auto-refresh Badge */}
        {autoRefreshEnabled && (
          <Badge variant="secondary" className="text-xs">
            Auto-refresh: 30s
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Auto-refresh Toggle */}
        <Button
          size="sm"
          variant={autoRefreshEnabled ? "default" : "outline"}
          onClick={onToggleAutoRefresh}
          className="h-7 text-xs"
        >
          {autoRefreshEnabled ? "Auto-refresh ON" : "Auto-refresh OFF"}
        </Button>

        {/* Manual Refresh Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-7"
        >
          <RefreshCw
            className={cn("h-3 w-3 mr-1", isRefreshing && "animate-spin")}
          />
          <span className="text-xs">Refresh</span>
        </Button>
      </div>
    </div>
  );
}

