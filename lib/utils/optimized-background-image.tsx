/**
 * Optimized Background Image Component
 * Provides lazy loading and optimization for background images
 */

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedBackgroundImageProps {
  src: string;
  className?: string;
  opacity?: number;
  onLoad?: () => void;
}

/**
 * Optimized background image component with lazy loading
 */
export function OptimizedBackgroundImage({
  src,
  className,
  opacity = 0.1,
  onLoad,
}: OptimizedBackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    // Lazy load image
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };

    img.onerror = () => {
      // Silently fail - background image is decorative
      setIsLoaded(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad]);

  if (!isLoaded || !imageSrc) {
    return null;
  }

  return (
    <div
      className={cn("absolute inset-0 bg-cover bg-center bg-no-repeat", className)}
      style={{
        backgroundImage: `url('${imageSrc}')`,
        opacity,
      }}
      aria-hidden="true"
    />
  );
}

