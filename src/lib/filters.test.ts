import { describe, it, expect } from "vitest";
import {
  applyFilters,
  countActiveFilters,
  getFilterSummary,
  extractNumericValue,
  DEFAULT_FILTER_STATE,
  type FilterState,
} from "./filters";

describe("filters", () => {
  const mockHotspots = [
    {
      id: "1",
      label: "Heat Island A",
      location: "Downtown",
      lat: 41.38,
      lng: 2.17,
      severity: "critical" as const,
      value: "+5.2°C",
      description: "Critical heat zone",
      recommendations: [],
    },
    {
      id: "2",
      label: "Heat Island B",
      location: "Industrial Zone",
      lat: 41.39,
      lng: 2.18,
      severity: "high" as const,
      value: "+3.8°C",
      description: "High impact area",
      recommendations: [],
    },
    {
      id: "3",
      label: "Heat Island C",
      location: "Residential",
      lat: 41.40,
      lng: 2.19,
      severity: "medium" as const,
      value: "+2.1°C",
      description: "Moderate concern",
      recommendations: [],
    },
    {
      id: "4",
      label: "Heat Island D",
      location: "Park Area",
      lat: 41.41,
      lng: 2.20,
      severity: "low" as const,
      value: "+1.0°C",
      description: "Low priority",
      recommendations: [],
    },
  ];

  describe("applyFilters", () => {
    it("returns all hotspots when no filters are active", () => {
      const result = applyFilters(mockHotspots, DEFAULT_FILTER_STATE);
      expect(result).toHaveLength(4);
    });

    it("filters by severity correctly", () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        severities: ["critical", "high"],
      };
      const result = applyFilters(mockHotspots, filters);
      expect(result).toHaveLength(2);
      expect(result.map((h) => h.id)).toEqual(["1", "2"]);
    });

    it("filters by search query correctly", () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        search: "Industrial",
      };
      const result = applyFilters(mockHotspots, filters);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("combines severity and search filters", () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        severities: ["critical", "high", "medium"],
        search: "Heat",
      };
      const result = applyFilters(mockHotspots, filters);
      expect(result).toHaveLength(3);
    });
  });

  describe("countActiveFilters", () => {
    it("returns 0 for default filter state", () => {
      expect(countActiveFilters(DEFAULT_FILTER_STATE)).toBe(0);
    });

    it("counts severity filters correctly", () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        severities: ["critical", "high"],
      };
      expect(countActiveFilters(filters)).toBeGreaterThan(0);
    });

    it("counts search query as a filter", () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        search: "test",
      };
      expect(countActiveFilters(filters)).toBeGreaterThan(0);
    });
  });

  describe("getFilterSummary", () => {
    it("returns empty array for default filters", () => {
      const summary = getFilterSummary(DEFAULT_FILTER_STATE);
      expect(summary).toHaveLength(0);
    });
  });

  describe("extractNumericValue", () => {
    it("extracts positive values with degree symbol", () => {
      expect(extractNumericValue("+5.2°C")).toBe(5.2);
    });

    it("extracts negative values", () => {
      expect(extractNumericValue("-3.5°C")).toBe(-3.5);
    });

    it("extracts values with comma separators", () => {
      expect(extractNumericValue("2,400 kg/week")).toBe(2400);
    });

    it("returns null for undefined", () => {
      expect(extractNumericValue(undefined)).toBe(null);
    });

    it("returns null for non-numeric strings", () => {
      expect(extractNumericValue("no numbers here")).toBe(null);
    });
  });
});
