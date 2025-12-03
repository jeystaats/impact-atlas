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

  // Filters & Search
  FILTER_APPLY: "filter_apply",
  SEARCH_QUERY: "search_query",

  // External links
  EXTERNAL_LINK_CLICK: "external_link_click",

  // Errors
  ERROR_BOUNDARY: "error_boundary",
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

/**
 * Track filter application with context
 *
 * @param filterType - Type of filter applied
 * @param filterValues - Values selected in the filter
 * @param resultCount - Number of results after filtering
 * @param location - Page/component location
 */
export function trackFilterApply(
  filterType: string,
  filterValues: Record<string, unknown>,
  resultCount: number,
  location: string
): void {
  trackEvent(AnalyticsEvents.FILTER_APPLY, {
    filterType,
    ...filterValues,
    resultCount,
    location,
  });
}

/**
 * Track search with sanitized query (only length and result count for privacy)
 *
 * @param query - Search query (will not be stored, only length)
 * @param resultCount - Number of results
 * @param location - Page/component location
 */
export function trackSearch(
  query: string,
  resultCount: number,
  location: string
): void {
  // Don't track empty or very short queries
  if (query.length < 2) return;

  trackEvent(AnalyticsEvents.SEARCH_QUERY, {
    queryLength: query.length,
    hasResults: resultCount > 0,
    resultCount,
    location,
  });
}

/**
 * Track copilot interaction
 *
 * @param action - Type of copilot action
 * @param context - Additional context
 */
export function trackCopilotInteraction(
  action: "open" | "message" | "suggestion_click" | "save_quick_win",
  context?: {
    moduleId?: string;
    messageLength?: number;
    suggestionType?: string;
  }
): void {
  const eventMap = {
    open: AnalyticsEvents.COPILOT_OPEN,
    message: AnalyticsEvents.COPILOT_MESSAGE,
    suggestion_click: AnalyticsEvents.COPILOT_SUGGESTION,
    save_quick_win: AnalyticsEvents.QUICK_WIN_SAVE,
  };

  trackEvent(eventMap[action], context);
}

/**
 * Track city selection/change
 *
 * @param cityId - City identifier/slug
 * @param cityName - City display name
 * @param isNewCity - Whether this is a newly added city
 */
export function trackCitySelect(
  cityId: string,
  cityName: string,
  isNewCity: boolean
): void {
  trackEvent(AnalyticsEvents.CITY_SELECT, {
    cityId,
    cityName,
    isNewCity,
  });
}

/**
 * Track share/export actions
 *
 * @param contentType - Type of content being shared
 * @param method - Sharing method used
 * @param contentId - Optional content identifier
 */
export function trackShare(
  contentType: "module" | "hotspot" | "quick_win" | "plan" | "view",
  method: "copy_link" | "export_csv" | "export_pdf" | "native_share",
  contentId?: string
): void {
  trackEvent(AnalyticsEvents.SHARE_CLICK, {
    contentType,
    method,
    contentId,
  });
}

/**
 * Track external link clicks
 *
 * @param destination - Name/identifier of the destination
 * @param location - Where on the page the link was clicked
 * @param url - Optional URL (will be truncated for privacy)
 */
export function trackExternalLink(
  destination: string,
  location: string,
  url?: string
): void {
  trackEvent(AnalyticsEvents.EXTERNAL_LINK_CLICK, {
    destination,
    location,
    domain: url ? new URL(url).hostname : undefined,
  });
}

/**
 * Track hotspot interaction
 *
 * @param hotspotId - Hotspot identifier
 * @param moduleId - Parent module
 * @param action - Type of interaction
 * @param severity - Hotspot severity level
 */
export function trackHotspotInteraction(
  hotspotId: string,
  moduleId: string,
  action: "click" | "details" | "share" | "export",
  severity?: string
): void {
  const eventMap = {
    click: AnalyticsEvents.HOTSPOT_CLICK,
    details: AnalyticsEvents.HOTSPOT_DETAILS,
    share: AnalyticsEvents.SHARE_CLICK,
    export: AnalyticsEvents.EXPORT_DATA,
  };

  trackEvent(eventMap[action], {
    hotspotId,
    moduleId,
    severity,
  });
}
