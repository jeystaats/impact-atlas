"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  trackEvent,
  trackPageView,
  trackCTAClick,
  trackModuleView,
  trackQuickWinComplete,
  trackPlanCreate,
  AnalyticsEvents,
} from "@/lib/analytics";

/**
 * Extract page information from pathname for analytics
 */
function extractPageInfo(pathname: string): {
  pageName: string;
  section?: string;
  isModule: boolean;
  moduleId?: string;
} {
  const segments = pathname.split("/").filter(Boolean);

  if (pathname === "/") {
    return { pageName: "landing", section: "marketing", isModule: false };
  }

  if (pathname.startsWith("/dashboard/modules/")) {
    return {
      pageName: "module_detail",
      section: "dashboard",
      isModule: true,
      moduleId: segments[2],
    };
  }

  if (pathname.startsWith("/dashboard")) {
    const subPage = segments[1] || "overview";
    return {
      pageName: `dashboard_${subPage}`,
      section: "dashboard",
      isModule: false,
    };
  }

  if (pathname.startsWith("/sign-")) {
    return {
      pageName: pathname.slice(1).replace("/", "_"),
      section: "auth",
      isModule: false,
    };
  }

  return { pageName: segments[0] || "unknown", isModule: false };
}

/**
 * Custom hook for Umami analytics integration
 * Handles automatic page view tracking on SPA navigation
 */
export function useAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPathname = useRef<string | null>(null);

  // Track page views on route change (SPA navigation)
  useEffect(() => {
    // Skip if same path (prevents double tracking)
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;

    const pageInfo = extractPageInfo(pathname);

    // Track page view with context
    if (pageInfo.isModule && pageInfo.moduleId) {
      trackModuleView(pageInfo.moduleId);
    } else if (pageInfo.pageName !== "unknown") {
      trackPageView(pageInfo.pageName, {
        section: pageInfo.section,
      });
    }
  }, [pathname, searchParams]);

  return {
    trackEvent,
    trackCTAClick,
    trackModuleView,
    trackQuickWinComplete,
    trackPlanCreate,
    AnalyticsEvents,
  };
}

/**
 * Hook for tracking scroll depth on landing pages
 * Tracks when user scrolls past specified thresholds (default: 25%, 50%, 75%, 90%)
 */
export function useScrollDepthTracking(
  thresholds: number[] = [25, 50, 75, 90]
) {
  const trackedThresholds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) return;

      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      thresholds.forEach((threshold) => {
        if (
          scrollPercent >= threshold &&
          !trackedThresholds.current.has(threshold)
        ) {
          trackedThresholds.current.add(threshold);
          trackEvent(AnalyticsEvents.PAGE_VIEW, {
            type: "scroll_depth",
            depth: threshold,
          });
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [thresholds]);
}

/**
 * Hook for tracking element visibility (useful for CTA impression tracking)
 */
export function useVisibilityTracking(
  elementRef: React.RefObject<HTMLElement>,
  eventName: string,
  eventData?: Record<string, unknown>,
  options: { threshold?: number; triggerOnce?: boolean } = {}
) {
  const { threshold = 0.5, triggerOnce = true } = options;
  const hasTracked = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && (!triggerOnce || !hasTracked.current)) {
            hasTracked.current = true;
            trackEvent(eventName, eventData);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, eventName, eventData, threshold, triggerOnce]);
}

/**
 * Helper to create a tracked click handler
 */
export function useTrackedClick(
  eventName: string,
  eventData?: Record<string, unknown>,
  onClick?: () => void
) {
  return useCallback(() => {
    trackEvent(eventName, eventData);
    onClick?.();
  }, [eventName, eventData, onClick]);
}
