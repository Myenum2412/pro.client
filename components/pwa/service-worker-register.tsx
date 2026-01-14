"use client";

import { useEffect, useState } from "react";

export function ServiceWorkerRegister() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Check if service workers are supported
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      // Check if service worker is already registered
      if (navigator.serviceWorker.controller) {
        console.log("[PWA] Service Worker already active");
        setIsRegistered(true);
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log("[PWA] Service Worker registered:", registration.scope);

      // Check for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available
              console.log("[PWA] New service worker available");
              // Optionally show update notification to user
            }
          });
        }
      });

      // Handle controller change (new service worker activated)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("[PWA] New service worker activated");
        // Optionally reload the page
        // window.location.reload();
      });

      setIsRegistered(true);
    } catch (error) {
      console.error("[PWA] Service Worker registration failed:", error);
    }
  };

  // This component doesn't render anything visible
  return null;
}
