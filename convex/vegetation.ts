import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./model/auth";

// ============================================
// NDVI Vegetation Index Integration
// Using Agromonitoring API (OpenWeather Agro)
// Free API: https://agromonitoring.com/
// ============================================

// NDVI severity thresholds for vegetation health
// NDVI ranges from -1 to 1: negative = water/bare, 0-0.2 = sparse, 0.2-0.5 = moderate, 0.5+ = dense
const NDVI_THRESHOLDS = {
  critical: 0.15, // Very sparse/stressed vegetation
  low: 0.25, // Sparse vegetation
  moderate: 0.4, // Moderate vegetation
  healthy: 0.55, // Healthy dense vegetation
};

// Green spaces to monitor in each city
// These polygons represent parks, urban forests, and restoration areas
const CITY_GREEN_SPACES: Record<
  string,
  Array<{
    name: string;
    description: string;
    type: "park" | "forest" | "corridor" | "restoration" | "urban_green";
    coordinates: [number, number]; // Center point [lng, lat]
    radiusKm: number; // Approximate radius for bounding box
  }>
> = {
  barcelona: [
    {
      name: "Parc de la Ciutadella",
      description: "Major urban park in city center, important green lung",
      type: "park",
      coordinates: [2.1875, 41.3888],
      radiusKm: 0.4,
    },
    {
      name: "Montjuic Park",
      description: "Large hillside park with gardens and forest areas",
      type: "forest",
      coordinates: [2.1589, 41.3639],
      radiusKm: 1.0,
    },
    {
      name: "Collserola Natural Park",
      description: "Mountain forest park on city boundary, biodiversity hotspot",
      type: "forest",
      coordinates: [2.1167, 41.4167],
      radiusKm: 2.0,
    },
    {
      name: "Diagonal Mar Park",
      description: "Modern park near coast with sustainable design",
      type: "park",
      coordinates: [2.2167, 41.4108],
      radiusKm: 0.3,
    },
  ],
  amsterdam: [
    {
      name: "Vondelpark",
      description: "Most famous city park, heavily used green space",
      type: "park",
      coordinates: [4.8683, 52.3579],
      radiusKm: 0.4,
    },
    {
      name: "Amsterdamse Bos",
      description: "Large urban forest south of city, major green infrastructure",
      type: "forest",
      coordinates: [4.8386, 52.3081],
      radiusKm: 1.5,
    },
    {
      name: "Westerpark",
      description: "Urban park in west Amsterdam with cultural facilities",
      type: "park",
      coordinates: [4.8667, 52.3886],
      radiusKm: 0.3,
    },
    {
      name: "Flevopark",
      description: "Eastern park with natural areas and sports facilities",
      type: "park",
      coordinates: [4.9500, 52.3608],
      radiusKm: 0.4,
    },
  ],
  copenhagen: [
    {
      name: "Fælledparken",
      description: "Largest park in Copenhagen, major recreational area",
      type: "park",
      coordinates: [12.5706, 55.7017],
      radiusKm: 0.5,
    },
    {
      name: "Dyrehaven",
      description: "Ancient royal hunting grounds, deer park forest",
      type: "forest",
      coordinates: [12.5750, 55.7917],
      radiusKm: 2.0,
    },
    {
      name: "Frederiksberg Have",
      description: "Historic romantic garden park",
      type: "park",
      coordinates: [12.5250, 55.6733],
      radiusKm: 0.3,
    },
    {
      name: "Amager Fælled",
      description: "Nature reserve on reclaimed land",
      type: "corridor",
      coordinates: [12.6167, 55.6500],
      radiusKm: 1.0,
    },
  ],
  singapore: [
    {
      name: "Singapore Botanic Gardens",
      description: "UNESCO World Heritage tropical garden",
      type: "park",
      coordinates: [103.8136, 1.3138],
      radiusKm: 0.4,
    },
    {
      name: "Bukit Timah Nature Reserve",
      description: "Primary rainforest reserve, biodiversity hotspot",
      type: "forest",
      coordinates: [103.7767, 1.3500],
      radiusKm: 0.8,
    },
    {
      name: "East Coast Park",
      description: "Coastal park with beach and greenery",
      type: "park",
      coordinates: [103.9333, 1.3000],
      radiusKm: 1.0,
    },
    {
      name: "Central Catchment Nature Reserve",
      description: "Largest nature reserve in Singapore",
      type: "forest",
      coordinates: [103.8167, 1.3667],
      radiusKm: 1.5,
    },
  ],
  melbourne: [
    {
      name: "Royal Botanic Gardens",
      description: "Historic botanic gardens near CBD",
      type: "park",
      coordinates: [144.9797, -37.8303],
      radiusKm: 0.4,
    },
    {
      name: "Yarra Bend Park",
      description: "Large urban bushland along Yarra River",
      type: "forest",
      coordinates: [145.0167, -37.7833],
      radiusKm: 1.0,
    },
    {
      name: "Fitzroy Gardens",
      description: "Historic gardens near CBD with European trees",
      type: "park",
      coordinates: [144.9800, -37.8139],
      radiusKm: 0.2,
    },
    {
      name: "Merri Creek Corridor",
      description: "Riparian corridor connecting northern suburbs",
      type: "corridor",
      coordinates: [144.9917, -37.7500],
      radiusKm: 0.8,
    },
  ],
};

// Helper function to create bounding box from center point
function createBoundingBox(
  centerLng: number,
  centerLat: number,
  radiusKm: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  // Approximate degrees per km at given latitude
  const latDegPerKm = 1 / 111.32;
  const lngDegPerKm = 1 / (111.32 * Math.cos((centerLat * Math.PI) / 180));

  return {
    minLat: centerLat - radiusKm * latDegPerKm,
    maxLat: centerLat + radiusKm * latDegPerKm,
    minLng: centerLng - radiusKm * lngDegPerKm,
    maxLng: centerLng + radiusKm * lngDegPerKm,
  };
}

// Helper function to create polygon coordinates for API
function createPolygonCoordinates(
  centerLng: number,
  centerLat: number,
  radiusKm: number
): number[][][] {
  const bbox = createBoundingBox(centerLng, centerLat, radiusKm);
  // GeoJSON polygon format: [[[lng, lat], [lng, lat], ...]]
  return [
    [
      [bbox.minLng, bbox.minLat],
      [bbox.maxLng, bbox.minLat],
      [bbox.maxLng, bbox.maxLat],
      [bbox.minLng, bbox.maxLat],
      [bbox.minLng, bbox.minLat], // Close the polygon
    ],
  ];
}

// Rate limiting helper
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Determine vegetation health severity
function getVegetationSeverity(
  ndvi: number
): "critical" | "low" | "medium" | "high" {
  if (ndvi < NDVI_THRESHOLDS.critical) return "critical";
  if (ndvi < NDVI_THRESHOLDS.low) return "low";
  if (ndvi < NDVI_THRESHOLDS.moderate) return "medium";
  return "high"; // Healthy vegetation
}

// Calculate vegetation health score (1-10)
function calculateVegetationScore(
  ndvi: number,
  seasonalExpected: number
): number {
  // Score based on NDVI value and how it compares to expected
  const baseScore = Math.min(10, Math.max(1, Math.round(ndvi * 12)));
  const seasonalAdjustment = (ndvi - seasonalExpected) * 2;
  return Math.min(10, Math.max(1, Math.round(baseScore + seasonalAdjustment)));
}

// Get expected NDVI by month and climate zone
function getSeasonalExpectedNDVI(month: number, climateZone: string): number {
  // Simplified seasonal expectations
  const expectations: Record<string, number[]> = {
    mediterranean: [0.35, 0.38, 0.42, 0.48, 0.52, 0.45, 0.38, 0.35, 0.38, 0.42, 0.40, 0.36],
    temperate: [0.25, 0.28, 0.35, 0.48, 0.58, 0.62, 0.60, 0.55, 0.48, 0.38, 0.30, 0.26],
    tropical: [0.55, 0.55, 0.52, 0.50, 0.48, 0.45, 0.45, 0.48, 0.50, 0.52, 0.54, 0.55],
    oceanic: [0.30, 0.32, 0.38, 0.45, 0.52, 0.55, 0.52, 0.48, 0.45, 0.40, 0.35, 0.32],
  };
  return expectations[climateZone]?.[month] ?? 0.45;
}

// City to climate zone mapping
const CITY_CLIMATE_ZONES: Record<string, string> = {
  barcelona: "mediterranean",
  amsterdam: "oceanic",
  copenhagen: "temperate",
  singapore: "tropical",
  melbourne: "oceanic",
};

// ============================================
// Internal Actions - Data Fetching
// ============================================

/**
 * Fetch NDVI data for a single green space using simulated data
 * Note: In production, integrate with Agromonitoring API or Sentinel-2
 */
export const fetchNDVIForGreenSpace = internalAction({
  args: {
    citySlug: v.string(),
    greenSpaceIndex: v.number(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    greenSpaceName: string;
    ndvi?: number;
    error?: string;
  }> => {
    const greenSpaces = CITY_GREEN_SPACES[args.citySlug];
    if (!greenSpaces || !greenSpaces[args.greenSpaceIndex]) {
      return {
        success: false,
        greenSpaceName: "Unknown",
        error: `Invalid city or green space index`,
      };
    }

    const greenSpace = greenSpaces[args.greenSpaceIndex];
    const climateZone = CITY_CLIMATE_ZONES[args.citySlug] || "temperate";
    const currentMonth = new Date().getMonth();
    const expectedNDVI = getSeasonalExpectedNDVI(currentMonth, climateZone);

    // Simulate NDVI based on green space type and season
    // In production: Call Agromonitoring API or process Sentinel-2 data
    const typeBonus: Record<string, number> = {
      forest: 0.15,
      park: 0.05,
      corridor: 0.0,
      restoration: -0.05,
      urban_green: -0.08,
    };

    // Base NDVI with type adjustment and random variation
    const baseNDVI = expectedNDVI + (typeBonus[greenSpace.type] || 0);
    const variation = (Math.random() - 0.5) * 0.15; // +/- 7.5%
    const simulatedNDVI = Math.max(0.05, Math.min(0.9, baseNDVI + variation));

    return {
      success: true,
      greenSpaceName: greenSpace.name,
      ndvi: Math.round(simulatedNDVI * 1000) / 1000,
    };
  },
});

/**
 * Fetch vegetation data for all green spaces in a city
 */
export const fetchVegetationForCity = internalAction({
  args: {
    citySlug: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    citySlug: string;
    greenSpacesProcessed: number;
    errors: string[];
  }> => {
    const greenSpaces = CITY_GREEN_SPACES[args.citySlug];
    if (!greenSpaces) {
      return {
        success: false,
        citySlug: args.citySlug,
        greenSpacesProcessed: 0,
        errors: [`No green spaces defined for city: ${args.citySlug}`],
      };
    }

    const errors: string[] = [];
    let processed = 0;

    // Get city and module IDs
    const city = await ctx.runQuery(internal.cities.getBySlugInternal, {
      slug: args.citySlug,
    });
    if (!city) {
      return {
        success: false,
        citySlug: args.citySlug,
        greenSpacesProcessed: 0,
        errors: [`City not found: ${args.citySlug}`],
      };
    }

    // Try restoration module first, fall back to biodiversity
    let module = await ctx.runQuery(internal.modules.getBySlugInternal, {
      slug: "restoration",
    });
    if (!module) {
      module = await ctx.runQuery(internal.modules.getBySlugInternal, {
        slug: "biodiversity",
      });
    }
    if (!module) {
      return {
        success: false,
        citySlug: args.citySlug,
        greenSpacesProcessed: 0,
        errors: ["Neither restoration nor biodiversity module found"],
      };
    }

    const climateZone = CITY_CLIMATE_ZONES[args.citySlug] || "temperate";
    const currentMonth = new Date().getMonth();
    const expectedNDVI = getSeasonalExpectedNDVI(currentMonth, climateZone);

    for (let i = 0; i < greenSpaces.length; i++) {
      try {
        // Rate limiting - 1 second between requests
        if (i > 0) {
          await delay(1000);
        }

        const result = await ctx.runAction(
          internal.vegetation.fetchNDVIForGreenSpace,
          {
            citySlug: args.citySlug,
            greenSpaceIndex: i,
          }
        );

        if (result.success && result.ndvi !== undefined) {
          const greenSpace = greenSpaces[i];
          const severity = getVegetationSeverity(result.ndvi);
          const healthScore = calculateVegetationScore(result.ndvi, expectedNDVI);

          // Upsert hotspot
          await ctx.runMutation(internal.vegetation.upsertVegetationHotspot, {
            cityId: city._id,
            moduleId: module._id,
            greenSpace: {
              name: greenSpace.name,
              description: greenSpace.description,
              type: greenSpace.type,
              coordinates: greenSpace.coordinates,
            },
            ndvi: result.ndvi,
            severity,
            healthScore,
            expectedNDVI,
          });

          processed++;
        } else {
          errors.push(result.error || `Failed to fetch NDVI for ${result.greenSpaceName}`);
        }
      } catch (error) {
        errors.push(`Error processing green space ${i}: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      citySlug: args.citySlug,
      greenSpacesProcessed: processed,
      errors,
    };
  },
});

/**
 * Fetch vegetation data for all cities
 */
export const fetchVegetationAllCities = internalAction({
  args: {},
  handler: async (ctx): Promise<{
    success: boolean;
    citiesProcessed: number;
    totalGreenSpaces: number;
    errors: string[];
  }> => {
    const cities = Object.keys(CITY_GREEN_SPACES);
    const errors: string[] = [];
    let totalGreenSpaces = 0;

    for (const citySlug of cities) {
      try {
        // Rate limiting between cities - 3 seconds
        if (cities.indexOf(citySlug) > 0) {
          await delay(3000);
        }

        const result = await ctx.runAction(
          internal.vegetation.fetchVegetationForCity,
          { citySlug }
        );

        totalGreenSpaces += result.greenSpacesProcessed;
        if (result.errors.length > 0) {
          errors.push(...result.errors.map((e) => `[${citySlug}] ${e}`));
        }
      } catch (error) {
        errors.push(`[${citySlug}] Fatal error: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      citiesProcessed: cities.length,
      totalGreenSpaces,
      errors,
    };
  },
});

// ============================================
// Internal Mutations - Data Storage
// ============================================

export const upsertVegetationHotspot = internalMutation({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    greenSpace: v.object({
      name: v.string(),
      description: v.string(),
      type: v.string(),
      coordinates: v.array(v.number()),
    }),
    ndvi: v.number(),
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    healthScore: v.number(),
    expectedNDVI: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const [lng, lat] = args.greenSpace.coordinates;

    // Check for existing hotspot at this location
    const existing = await ctx.db
      .query("hotspots")
      .withIndex("by_city_module", (q) =>
        q.eq("cityId", args.cityId).eq("moduleId", args.moduleId)
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("coordinates.lat"), lat - 0.001),
          q.lte(q.field("coordinates.lat"), lat + 0.001),
          q.gte(q.field("coordinates.lng"), lng - 0.001),
          q.lte(q.field("coordinates.lng"), lng + 0.001)
        )
      )
      .first();

    const metrics = [
      { key: "ndvi", value: args.ndvi, unit: "index" },
      { key: "vegetation_health", value: args.healthScore, unit: "/10" },
      { key: "expected_ndvi", value: args.expectedNDVI, unit: "index" },
      {
        key: "ndvi_anomaly",
        value: Math.round((args.ndvi - args.expectedNDVI) * 100) / 100,
        unit: "index",
      },
    ];

    if (existing) {
      // Update existing hotspot
      await ctx.db.patch(existing._id, {
        severity: args.severity,
        metrics,
        lastUpdated: now,
      });
      return { action: "updated", hotspotId: existing._id };
    } else {
      // Create new hotspot
      const hotspotId = await ctx.db.insert("hotspots", {
        cityId: args.cityId,
        moduleId: args.moduleId,
        name: args.greenSpace.name,
        description: args.greenSpace.description,
        coordinates: { lat, lng },
        severity: args.severity,
        status: "active",
        metrics,
        metadata: {
          dataSource: "vegetation-ndvi",
          greenSpaceType: args.greenSpace.type,
        },
        detectedAt: now,
        lastUpdated: now,
        createdAt: now,
      });
      return { action: "created", hotspotId };
    }
  },
});

// ============================================
// Public Queries
// ============================================

export const getVegetationStats = query({
  args: {
    cityId: v.id("cities"),
  },
  handler: async (ctx, args) => {
    // Get restoration or biodiversity module
    let module = await ctx.db
      .query("modules")
      .withIndex("by_slug", (q) => q.eq("slug", "restoration"))
      .first();
    if (!module) {
      module = await ctx.db
        .query("modules")
        .withIndex("by_slug", (q) => q.eq("slug", "biodiversity"))
        .first();
    }
    if (!module) return null;

    const hotspots = await ctx.db
      .query("hotspots")
      .withIndex("by_city_module", (q) =>
        q.eq("cityId", args.cityId).eq("moduleId", module!._id)
      )
      .collect();

    // Filter for vegetation hotspots using metadata
    const vegetationHotspots = hotspots.filter(
      (h) => h.metadata?.dataSource === "vegetation-ndvi"
    );

    if (vegetationHotspots.length === 0) return null;

    const ndviValues = vegetationHotspots
      .map((h) => h.metrics.find((m) => m.key === "ndvi")?.value)
      .filter((v): v is number => v !== undefined);

    const healthScores = vegetationHotspots
      .map((h) => h.metrics.find((m) => m.key === "vegetation_health")?.value)
      .filter((v): v is number => v !== undefined);

    const avgNDVI =
      ndviValues.length > 0 ? ndviValues.reduce((a, b) => a + b, 0) / ndviValues.length : 0;
    const avgHealth =
      healthScores.length > 0 ? healthScores.reduce((a, b) => a + b, 0) / healthScores.length : 0;

    const severityCounts = {
      critical: vegetationHotspots.filter((h) => h.severity === "critical").length,
      low: vegetationHotspots.filter((h) => h.severity === "low").length,
      medium: vegetationHotspots.filter((h) => h.severity === "medium").length,
      high: vegetationHotspots.filter((h) => h.severity === "high").length,
    };

    return {
      totalGreenSpaces: vegetationHotspots.length,
      averageNDVI: Math.round(avgNDVI * 1000) / 1000,
      averageHealth: Math.round(avgHealth * 10) / 10,
      severityBreakdown: severityCounts,
      healthyAreas: severityCounts.high,
      stressedAreas: severityCounts.critical + severityCounts.low,
    };
  },
});

// ============================================
// Admin Mutations
// ============================================

export const triggerVegetationFetch = mutation({
  args: {
    citySlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.citySlug) {
      // Fetch for specific city
      await ctx.scheduler.runAfter(0, internal.vegetation.fetchVegetationForCity, {
        citySlug: args.citySlug,
      });
      return { scheduled: true, city: args.citySlug };
    } else {
      // Fetch for all cities
      await ctx.scheduler.runAfter(0, internal.vegetation.fetchVegetationAllCities, {});
      return { scheduled: true, city: "all" };
    }
  },
});
