/**
 * Filter Types and Utilities for Impact Atlas
 *
 * Comprehensive filtering system for hotspot data with support for
 * multi-select severity, date ranges, trends, and value ranges.
 */

import { HotspotData } from "@/data/hotspots";

// =============================================================================
// FILTER TYPES
// =============================================================================

export type Severity = "low" | "medium" | "high" | "critical";
export type Trend = "up" | "down" | "stable";
export type DateRangePreset = "7d" | "30d" | "90d" | "custom";

export interface DateRange {
  preset: DateRangePreset;
  startDate?: Date;
  endDate?: Date;
}

export interface ValueRange {
  min: number;
  max: number;
  unit?: string;
}

export interface FilterState {
  search: string;
  severities: Severity[];
  dateRange: DateRange;
  trends: Trend[];
  valueRange: ValueRange | null;
}

export interface FilterConfig {
  valueRangeLabel?: string;
  valueRangeUnit?: string;
  valueRangeMin?: number;
  valueRangeMax?: number;
  valueRangeStep?: number;
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULT_FILTER_STATE: FilterState = {
  search: "",
  severities: [],
  dateRange: { preset: "30d" },
  trends: [],
  valueRange: null,
};

export const SEVERITY_OPTIONS: { value: Severity; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "#10B981" },
  { value: "medium", label: "Medium", color: "#F59E0B" },
  { value: "high", label: "High", color: "#F97316" },
  { value: "critical", label: "Critical", color: "#EF4444" },
];

export const TREND_OPTIONS: { value: Trend; label: string; icon: string }[] = [
  { value: "up", label: "Worsening", icon: "trendingUp" },
  { value: "stable", label: "Stable", icon: "minus" },
  { value: "down", label: "Improving", icon: "trendingDown" },
];

export const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "custom", label: "Custom range" },
];

// =============================================================================
// FILTER UTILITIES
// =============================================================================

/**
 * Extract numeric value from hotspot value string
 * Handles formats like "+5.2°C", "2,400 kg/week", "850 tonnes CO2/day"
 */
export function extractNumericValue(value: string | undefined): number | null {
  if (!value) return null;

  // Remove any non-numeric characters except decimal point, minus, and comma
  const match = value.match(/[-+]?[\d,]+\.?\d*/);
  if (!match) return null;

  // Remove commas and parse
  const numStr = match[0].replace(/,/g, "");
  const num = parseFloat(numStr);

  return isNaN(num) ? null : num;
}

/**
 * Parse lastUpdated string to estimate date
 * Handles formats like "2 hours ago", "1 day ago", etc.
 */
export function parseLastUpdated(lastUpdated: string | undefined): Date | null {
  if (!lastUpdated) return null;

  const now = new Date();
  const match = lastUpdated.match(/(\d+)\s*(hour|day|week|month|minute)/i);

  if (!match) return null;

  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const msMultipliers: Record<string, number> = {
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
  };

  const ms = msMultipliers[unit];
  if (!ms) return null;

  return new Date(now.getTime() - amount * ms);
}

/**
 * Get date threshold based on preset
 */
export function getDateThreshold(preset: DateRangePreset): Date {
  const now = new Date();

  switch (preset) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(0); // Return epoch for custom (will use custom dates)
  }
}

/**
 * Check if a hotspot matches search query
 * Searches across label, description, location, and value
 */
export function matchesSearch(hotspot: HotspotData, query: string): boolean {
  if (!query.trim()) return true;

  const searchLower = query.toLowerCase().trim();

  const searchableFields = [
    hotspot.label,
    hotspot.description,
    hotspot.location,
    hotspot.value,
    ...hotspot.recommendations,
  ].filter(Boolean);

  return searchableFields.some(field =>
    field?.toLowerCase().includes(searchLower)
  );
}

/**
 * Check if a hotspot matches severity filter
 */
export function matchesSeverity(hotspot: HotspotData, severities: Severity[]): boolean {
  if (severities.length === 0) return true;
  return severities.includes(hotspot.severity);
}

/**
 * Check if a hotspot matches trend filter
 */
export function matchesTrend(hotspot: HotspotData, trends: Trend[]): boolean {
  if (trends.length === 0) return true;
  if (!hotspot.trend) return false;
  return trends.includes(hotspot.trend);
}

/**
 * Check if a hotspot matches date range filter
 */
export function matchesDateRange(hotspot: HotspotData, dateRange: DateRange): boolean {
  if (!hotspot.lastUpdated) return true;

  const hotspotDate = parseLastUpdated(hotspot.lastUpdated);
  if (!hotspotDate) return true;

  if (dateRange.preset === "custom") {
    if (dateRange.startDate && hotspotDate < dateRange.startDate) return false;
    if (dateRange.endDate && hotspotDate > dateRange.endDate) return false;
    return true;
  }

  const threshold = getDateThreshold(dateRange.preset);
  return hotspotDate >= threshold;
}

/**
 * Check if a hotspot matches value range filter
 */
export function matchesValueRange(hotspot: HotspotData, valueRange: ValueRange | null): boolean {
  if (!valueRange) return true;

  const numericValue = extractNumericValue(hotspot.value);
  if (numericValue === null) return true;

  // Use absolute value for comparison (handles negative values like temperature deltas)
  const absValue = Math.abs(numericValue);

  return absValue >= valueRange.min && absValue <= valueRange.max;
}

/**
 * Apply all filters to a list of hotspots
 * Returns filtered list maintaining original order
 */
export function applyFilters(
  hotspots: HotspotData[],
  filters: FilterState
): HotspotData[] {
  return hotspots.filter(hotspot => {
    // All filters must pass (AND logic)
    return (
      matchesSearch(hotspot, filters.search) &&
      matchesSeverity(hotspot, filters.severities) &&
      matchesTrend(hotspot, filters.trends) &&
      matchesDateRange(hotspot, filters.dateRange) &&
      matchesValueRange(hotspot, filters.valueRange)
    );
  });
}

/**
 * Count active (non-default) filters
 */
export function countActiveFilters(filters: FilterState): number {
  let count = 0;

  if (filters.search.trim()) count++;
  if (filters.severities.length > 0) count++;
  if (filters.trends.length > 0) count++;
  if (filters.dateRange.preset !== "30d" || filters.dateRange.startDate || filters.dateRange.endDate) count++;
  if (filters.valueRange !== null) count++;

  return count;
}

/**
 * Get human-readable description of active filters
 */
export function getFilterSummary(filters: FilterState): string[] {
  const summaries: string[] = [];

  if (filters.search.trim()) {
    summaries.push(`Search: "${filters.search}"`);
  }

  if (filters.severities.length > 0) {
    const labels = filters.severities
      .map(s => SEVERITY_OPTIONS.find(opt => opt.value === s)?.label)
      .filter(Boolean);
    summaries.push(`Severity: ${labels.join(", ")}`);
  }

  if (filters.trends.length > 0) {
    const labels = filters.trends
      .map(t => TREND_OPTIONS.find(opt => opt.value === t)?.label)
      .filter(Boolean);
    summaries.push(`Trend: ${labels.join(", ")}`);
  }

  if (filters.dateRange.preset === "custom") {
    if (filters.dateRange.startDate && filters.dateRange.endDate) {
      summaries.push(
        `Date: ${filters.dateRange.startDate.toLocaleDateString()} - ${filters.dateRange.endDate.toLocaleDateString()}`
      );
    }
  } else if (filters.dateRange.preset !== "30d") {
    const label = DATE_RANGE_OPTIONS.find(opt => opt.value === filters.dateRange.preset)?.label;
    if (label) summaries.push(`Date: ${label}`);
  }

  if (filters.valueRange) {
    const unit = filters.valueRange.unit || "";
    summaries.push(`Value: ${filters.valueRange.min}${unit} - ${filters.valueRange.max}${unit}`);
  }

  return summaries;
}

/**
 * Check if filters are in default state
 */
export function isDefaultFilterState(filters: FilterState): boolean {
  return (
    filters.search === "" &&
    filters.severities.length === 0 &&
    filters.trends.length === 0 &&
    filters.dateRange.preset === "30d" &&
    !filters.dateRange.startDate &&
    !filters.dateRange.endDate &&
    filters.valueRange === null
  );
}

/**
 * Create a partial filter update while preserving other values
 */
export function updateFilter<K extends keyof FilterState>(
  currentFilters: FilterState,
  key: K,
  value: FilterState[K]
): FilterState {
  return {
    ...currentFilters,
    [key]: value,
  };
}

/**
 * Toggle a value in a multi-select array filter
 */
export function toggleArrayFilter<T>(array: T[], value: T): T[] {
  if (array.includes(value)) {
    return array.filter(item => item !== value);
  }
  return [...array, value];
}

/**
 * Get computed statistics about filtered results
 */
export function getFilterStats(
  originalHotspots: HotspotData[],
  filteredHotspots: HotspotData[]
): {
  total: number;
  filtered: number;
  percentage: number;
  bySeverity: Record<Severity, number>;
} {
  const bySeverity: Record<Severity, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  filteredHotspots.forEach(hotspot => {
    bySeverity[hotspot.severity]++;
  });

  return {
    total: originalHotspots.length,
    filtered: filteredHotspots.length,
    percentage: originalHotspots.length > 0
      ? Math.round((filteredHotspots.length / originalHotspots.length) * 100)
      : 0,
    bySeverity,
  };
}
