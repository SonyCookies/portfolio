"use client";
import { useEffect, useRef } from "react";

/**
 * Component to track page views
 * Calls the API to increment view count on mount
 */
export default function ViewTracker() {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per page load
    if (hasTracked.current) return;
    
    // Track view after a short delay to ensure page is fully loaded
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/views/increment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("[ViewTracker] View count incremented:", data.viewCount);
        } else {
          console.warn("[ViewTracker] Failed to increment view count");
        }
      } catch (error) {
        console.error("[ViewTracker] Error tracking view:", error);
      } finally {
        hasTracked.current = true;
      }
    }, 1000); // Wait 1 second before tracking

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
