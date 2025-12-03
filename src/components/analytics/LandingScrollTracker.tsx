"use client";

import { useScrollDepthTracking } from "@/hooks/useAnalytics";

/**
 * Invisible component that tracks scroll depth on landing pages.
 * Tracks when users scroll past 25%, 50%, 75%, and 90% of the page.
 */
export function LandingScrollTracker() {
  useScrollDepthTracking([25, 50, 75, 90]);
  return null;
}
