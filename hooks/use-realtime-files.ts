"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  extension?: string;
  size?: number;
};

type UseRealtimeFilesOptions = {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  onUpdate?: (files: FileNode[]) => void;
  onError?: (error: Error) => void;
};

type UseRealtimeFilesReturn = {
  files: FileNode[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
};

export function useRealtimeFiles(
  options: UseRealtimeFilesOptions = {}
): UseRealtimeFilesReturn {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds default
    onUpdate,
    onError,
  } = options;

  const [files, setFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchFiles = useCallback(async (isBackgroundRefresh = false) => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      if (!isBackgroundRefresh) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      setError(null);

      const response = await fetch("/api/files/directory", {
        signal: abortControllerRef.current.signal,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const newFiles = data.data || [];
      
      // Always update to ensure consistency
      setFiles((prevFiles) => {
        // Only update if data has actually changed
        const hasChanged = JSON.stringify(prevFiles) !== JSON.stringify(newFiles);
        if (hasChanged) {
          setLastUpdated(new Date());
          if (onUpdate) {
            onUpdate(newFiles);
          }
          return newFiles;
        }
        return prevFiles;
      });

    } catch (err: any) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        return;
      }

      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [onUpdate, onError]);

  const refresh = useCallback(async () => {
    await fetchFiles(true);
  }, [fetchFiles]);

  // Initial fetch
  useEffect(() => {
    fetchFiles(false);
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      fetchFiles(true);
    }, refreshInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchFiles]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    files,
    isLoading,
    error,
    lastUpdated,
    refresh,
    isRefreshing,
  };
}

