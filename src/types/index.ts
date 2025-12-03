/**
 * Application Types
 *
 * This file provides type definitions for the UI layer.
 *
 * Architecture:
 * - Database types: Import from "convex/_generated/dataModel" using Doc<"tableName">
 * - UI types: Defined here, derived from Convex types where applicable
 *
 * Why separate UI types?
 * - Convex uses `_id: Id<TableName>` while UI uses `id: string` for simplicity
 * - UI types often include computed/derived fields not stored in DB
 * - Components may need flattened structures vs nested DB documents
 *
 * Example usage:
 * ```typescript
 * // For database operations
 * import { Doc, Id } from "@/convex/_generated/dataModel";
 * type DbModule = Doc<"modules">;
 *
 * // For UI components
 * import { Module, Hotspot } from "@/types";
 * ```
 */

import type { Doc } from "../../convex/_generated/dataModel";

// ==============================================
// Re-export Convex types for convenience
// ==============================================

/** Convex document types - use these for database operations */
export type DbModule = Doc<"modules">;
export type DbCity = Doc<"cities">;
export type DbHotspot = Doc<"hotspots">;
export type DbQuickWin = Doc<"quickWins">;
export type DbAiInsight = Doc<"aiInsights">;
export type DbActionPlan = Doc<"actionPlans">;
export type DbUser = Doc<"users">;
export type DbDataSource = Doc<"dataSources">;

// ==============================================
// UI Types
// ==============================================

/**
 * Simplified City type for UI components
 * Derived from DbCity with flattened structure
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
 * Includes computed metrics not stored in DB
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
 * Includes nested AI insights and actions
 */
export interface Hotspot {
  id: string;
  moduleId: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  severity: Severity;
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
  impact: ImpactLevel;
  effort: ImpactLevel;
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

// ==============================================
// Type conversion helpers
// ==============================================

/**
 * Convert a Convex module document to UI Module type
 */
export function toUiModule(doc: DbModule, quickWinsCount: number = 0): Module {
  return {
    id: doc.slug,
    title: doc.name,
    description: doc.description,
    icon: doc.icon,
    color: doc.color,
    metrics: doc.metrics.map((m) => ({
      label: m.label,
      value: 0, // Would be computed from actual data
      unit: m.unit,
    })),
    quickWinsCount,
    status: doc.status,
  };
}

/**
 * Convert a Convex city document to UI City type
 */
export function toUiCity(doc: DbCity): City {
  return {
    id: doc.slug,
    name: doc.name,
    country: doc.country,
    population: doc.population,
    coordinates: doc.coordinates,
  };
}

/**
 * Convert a Convex hotspot document to UI Hotspot type
 */
export function toUiHotspot(
  doc: DbHotspot,
  moduleSlug: string,
  aiInsights: AIInsight[] = [],
  actions: QuickWin[] = []
): Hotspot {
  return {
    id: doc._id,
    moduleId: moduleSlug,
    location: {
      lat: doc.coordinates.lat,
      lng: doc.coordinates.lng,
      name: doc.address || doc.neighborhood || "Unknown location",
    },
    severity: doc.severity,
    title: doc.name,
    description: doc.description,
    aiInsights,
    actions,
  };
}
