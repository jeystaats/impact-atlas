/**
 * Umami Analytics Utility
 *
 * Provides type-safe event tracking for the Impact Atlas application.
 * Events are only tracked in production and when Umami is loaded.
 *
 * @see https://umami.is/docs/track-events
 */

// Extend Window interface to include Umami
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, unknown>) => void;
    };
  }
}

// Event names for consistent tracking
export const AnalyticsEvents = {
  // Navigation
  PAGE_VIEW: "page_view",
  NAV_CLICK: "nav_click",

  // Module interactions
  MODULE_VIEW: "module_view",
  MODULE_FILTER: "module_filter",
  HOTSPOT_CLICK: "hotspot_click",
  HOTSPOT_DETAILS: "hotspot_details",

  // Quick wins
  QUICK_WIN_VIEW: "quick_win_view",
  QUICK_WIN_COMPLETE: "quick_win_complete",
  QUICK_WIN_SAVE: "quick_win_save",

  // Action plans
  PLAN_CREATE: "plan_create",
  PLAN_UPDATE: "plan_update",
  PLAN_COMPLETE: "plan_complete",
  PLAN_DELETE: "plan_delete",

  // AI Copilot
  COPILOT_OPEN: "copilot_open",
  COPILOT_MESSAGE: "copilot_message",
  COPILOT_SUGGESTION: "copilot_suggestion",

  // CTA & Conversions
  CTA_CLICK: "cta_click",
  SIGNUP_START: "signup_start",
  SIGNUP_COMPLETE: "signup_complete",
  CITY_SELECT: "city_select",

  // Sharing
  SHARE_CLICK: "share_click",
  EXPORT_DATA: "export_data",
} as const;

export type AnalyticsEvent = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

/**
 * Track a custom event in Umami
 *
 * @param eventName - The name of the event to track
 * @param eventData - Optional data to attach to the event
 *
 * @example
 * ```ts
 * trackEvent(AnalyticsEvents.MODULE_VIEW, { moduleId: 'urban-heat' });
 * trackEvent(AnalyticsEvents.QUICK_WIN_COMPLETE, { quickWinId: 'qw-123', moduleId: 'biodiversity' });
 * ```
 */
export function trackEvent(
  eventName: AnalyticsEvent | string,
  eventData?: Record<string, unknown>
): void {
  // Only track in browser environment
  if (typeof window === "undefined") return;

  // Check if Umami is loaded
  if (!window.umami) {
    // Log in development for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics]", eventName, eventData);
    }
    return;
  }

  try {
    window.umami.track(eventName, eventData);
  } catch (error) {
    // Silently fail - don't break the app for analytics
    if (process.env.NODE_ENV === "development") {
      console.error("[Analytics Error]", error);
    }
  }
}

/**
 * Track a page view with custom properties
 * Note: Umami automatically tracks page views, use this for SPA navigation or custom data
 *
 * @param pageName - Custom page name
 * @param properties - Additional page properties
 */
export function trackPageView(
  pageName: string,
  properties?: Record<string, unknown>
): void {
  trackEvent(AnalyticsEvents.PAGE_VIEW, {
    page: pageName,
    ...properties,
  });
}

/**
 * Track a CTA click conversion
 *
 * @param ctaName - Name/identifier of the CTA
 * @param location - Where on the page the CTA was clicked
 */
export function trackCTAClick(ctaName: string, location?: string): void {
  trackEvent(AnalyticsEvents.CTA_CLICK, {
    cta: ctaName,
    location,
  });
}

/**
 * Track module view
 *
 * @param moduleId - The module being viewed
 * @param cityId - Optional city context
 */
export function trackModuleView(moduleId: string, cityId?: string): void {
  trackEvent(AnalyticsEvents.MODULE_VIEW, {
    moduleId,
    cityId,
  });
}

/**
 * Track quick win completion
 *
 * @param quickWinId - ID of the completed quick win
 * @param moduleId - Module the quick win belongs to
 */
export function trackQuickWinComplete(
  quickWinId: string,
  moduleId: string
): void {
  trackEvent(AnalyticsEvents.QUICK_WIN_COMPLETE, {
    quickWinId,
    moduleId,
  });
}

/**
 * Track action plan creation
 *
 * @param planId - ID of the created plan
 * @param quickWinCount - Number of quick wins in the plan
 */
export function trackPlanCreate(planId: string, quickWinCount: number): void {
  trackEvent(AnalyticsEvents.PLAN_CREATE, {
    planId,
    quickWinCount,
  });
}
