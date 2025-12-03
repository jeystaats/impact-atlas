/**
 * Hotspots Data Module
 *
 * This module provides hotspot data for all environmental modules.
 * Types are separated for better organization.
 *
 * Usage:
 * ```ts
 * import { moduleHotspots, moduleInsights } from "@/data/hotspots";
 * import type { HotspotData, ModuleInsight } from "@/data/hotspots";
 * ```
 */

// Re-export types
export type {
  HotspotData,
  GeoJSONFeature,
  GeoJSONData,
  ModuleInsight,
} from "./types";

// Re-export data from the main file
// Note: Data is kept in a single file for now to avoid breaking changes
// In the future, this can be split per module for lazy loading
export { moduleHotspots, moduleInsights } from "../hotspots";

// Import for use in helper functions
import { moduleHotspots, moduleInsights } from "../hotspots";

// Helper function to get hotspots for a specific module
export function getModuleHotspots(moduleId: string) {
  return moduleHotspots[moduleId] || [];
}

// Helper function to get insights for a specific module
export function getModuleInsights(moduleId: string) {
  return moduleInsights[moduleId] || [];
}
