/**
 * Application Types
 *
 * This file provides type definitions for the application.
 * UI-specific types are defined here. For Convex database types,
 * import directly from "convex/_generated/dataModel".
 *
 * Note: UI types use `id: string` while Convex uses `_id: Id<TableName>`.
 * Transform data when moving between layers.
 */

// ==============================================
// UI Types
// ==============================================

/**
 * Simplified City type for UI components
 */
export interface City {
  id: string;
  name: string;
  country: string;
  population: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

/**
 * Simplified Module type for UI components
 */
export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  metrics: ModuleMetric[];
  quickWinsCount: number;
  status: "active" | "coming-soon" | "beta";
}

export interface ModuleMetric {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

/**
 * Simplified Hotspot type for UI components
 */
export interface Hotspot {
  id: string;
  moduleId: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  aiInsights: AIInsight[];
  actions: QuickWin[];
}

export interface AIInsight {
  id: string;
  type: "observation" | "recommendation" | "warning" | "opportunity";
  title: string;
  description: string;
  confidence: number;
  dataSource: string;
}

export interface QuickWin {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  estimatedCost?: string;
  estimatedBenefit?: string;
  priority: number;
}

export interface DataSource {
  id: string;
  name: string;
  logo?: string;
  description: string;
  url: string;
}

// ==============================================
// Utility types
// ==============================================

/** Coordinates for map positioning */
export type Coordinates = {
  lat: number;
  lng: number;
};

/** Bounding box for map views */
export type BoundingBox = {
  north: number;
  south: number;
  east: number;
  west: number;
};

/** Severity levels used across modules */
export type Severity = "low" | "medium" | "high" | "critical";

/** Impact/Effort levels for quick wins */
export type ImpactLevel = "low" | "medium" | "high";

/** Trend direction for metrics */
export type TrendDirection = "up" | "down" | "neutral";

/** Generic API response wrapper */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
