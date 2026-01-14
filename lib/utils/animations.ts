/**
 * Global Animation Utilities
 * Provides consistent animation classes and utilities across the app
 */

export const animations = {
  // Page transitions
  pageEnter: "animate-in fade-in slide-in-from-bottom-2 duration-500",
  pageExit: "animate-out fade-out slide-out-to-top-2 duration-300",
  
  // Card animations
  cardEnter: "animate-in fade-in slide-in-from-bottom-1 duration-300",
  cardStagger: (index: number) => 
    `animate-in fade-in slide-in-from-bottom-1 duration-300 delay-${Math.min(index * 50, 500)}`,
  
  // Button animations
  buttonHover: "transition-all duration-200 hover:scale-105 active:scale-95",
  buttonSmooth: "transition-all duration-300 ease-in-out",
  
  // Modal animations
  modalEnter: "animate-in fade-in zoom-in-95 duration-200",
  modalExit: "animate-out fade-out zoom-out-95 duration-150",
  
  // List animations
  listItem: (index: number) =>
    `animate-in fade-in slide-in-from-left-2 duration-300`,
  
  // Smooth transitions
  smooth: "transition-all duration-300 ease-in-out",
  smoothFast: "transition-all duration-200 ease-in-out",
  smoothSlow: "transition-all duration-500 ease-in-out",
  
  // Fade animations
  fadeIn: "animate-in fade-in duration-300",
  fadeOut: "animate-out fade-out duration-200",
  
  // Slide animations
  slideUp: "animate-in slide-in-from-bottom-2 duration-300",
  slideDown: "animate-in slide-in-from-top-2 duration-300",
  slideLeft: "animate-in slide-in-from-right-2 duration-300",
  slideRight: "animate-in slide-in-from-left-2 duration-300",
  
  // Scale animations
  scaleIn: "animate-in zoom-in-95 duration-300",
  scaleOut: "animate-out zoom-out-95 duration-200",
  
  // Loading animations
  pulse: "animate-pulse",
  spin: "animate-spin",
  
  // Hover effects
  hoverLift: "transition-transform duration-200 hover:-translate-y-1",
  hoverScale: "transition-transform duration-200 hover:scale-105",
  hoverGlow: "transition-shadow duration-200 hover:shadow-lg",
};

/**
 * Get staggered animation delay class
 */
export function getStaggerDelay(index: number, baseDelay: number = 50): string {
  const delay = Math.min(index * baseDelay, 1000);
  return `delay-[${delay}ms]`;
}

/**
 * Combine multiple animation classes
 */
export function combineAnimations(...classes: (string | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

