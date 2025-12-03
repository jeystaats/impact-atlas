/**
 * Hotspot Data Types
 *
 * Shared type definitions for all module hotspot data.
 */

export interface HotspotData {
  id: string;
  lat: number;
  lng: number;
  severity: "low" | "medium" | "high" | "critical";
  label: string;
  value?: string;
  description: string;
  location: string;
  recommendations: string[];
  // Enhanced fields for rich popup display
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  lastUpdated?: string;
  dataPoints?: number;
}

// GeoJSON types for polygon/area data layers
export interface GeoJSONFeature {
  type: "Feature";
  properties: {
    id: string;
    name: string;
    severity?: "low" | "medium" | "high" | "critical";
    value?: string | number;
    description?: string;
    [key: string]: unknown;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJSONData {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export interface ModuleInsight {
  type: "insight" | "recommendation" | "warning";
  title: string;
  description: string;
  confidence?: number;
  impact?: "low" | "medium" | "high";
  effort?: "low" | "medium" | "high";
}
