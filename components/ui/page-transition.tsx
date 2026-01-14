"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { animations } from "@/lib/utils/animations";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Smooth page transition wrapper
 * Adds fade and slide animations when route changes
 */
export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsAnimating(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname, children]);

  return (
    <div
      key={pathname}
      className={`${animations.pageEnter} ${className}`}
      style={{
        animationFillMode: "both",
      }}
    >
      {displayChildren}
    </div>
  );
}

