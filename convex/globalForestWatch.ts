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
// Global Forest Watch Integration
// API: https://data-api.globalforestwatch.org/
// Tracks tree cover loss, gain, and restoration opportunities
// ============================================

// Tree cover loss severity thresholds (hectares lost per year)
const TREE_COVER_LOSS_THRESHOLDS = {
  low: 10, // < 10 ha/year
  medium: 50, // 10-50 ha/year
  high: 200, // 50-200 ha/year
  critical: 200, // > 200 ha/year
};

// Forest areas to monitor in each city region
// These represent peri-urban forests, protected areas, and restoration sites
const CITY_FOREST_AREAS: Record<
  string,
  Array<{
    name: string;
    description: string;
    type: "protected" | "urban_forest" | "restoration" | "buffer_zone" | "corridor";
    coordinates: [number, number]; // Center [lng, lat]
    radiusKm: number;
    baseTreeCoverPercent: number; // Historical baseline
  }>
> = {
  barcelona: [
    {
      name: "Collserola Natural Park",
      description: "8,000 ha protected forest park bordering Barcelona metropolitan area",
      type: "protected",
      coordinates: [2.1167, 41.4333],
      radiusKm: 5.0,
      baseTreeCoverPercent: 72,
    },
    {
      name: "Garraf Natural Park",
      description: "Mediterranean forest and limestone landscape south of Barcelona",
      type: "protected",
      coordinates: [1.9333, 41.2667],
      radiusKm: 4.0,
      baseTreeCoverPercent: 45,
    },
    {
      name: "Montseny Natural Park",
      description: "UNESCO Biosphere Reserve with diverse forest ecosystems",
      type: "protected",
      coordinates: [2.4000, 41.7833],
      radiusKm: 6.0,
      baseTreeCoverPercent: 85,
    },
  ],
  amsterdam: [
    {
      name: "Amsterdamse Bos",
      description: "930 ha urban forest, one of largest in Europe",
      type: "urban_forest",
      coordinates: [4.8386, 52.3081],
      radiusKm: 2.0,
      baseTreeCoverPercent: 65,
    },
    {
      name: "Het Twiske",
      description: "Recreation and nature area north of Amsterdam",
      type: "buffer_zone",
      coordinates: [4.9167, 52.4500],
      radiusKm: 2.5,
      baseTreeCoverPercent: 35,
    },
    {
      name: "Spaarnwoude",
      description: "Recreation area between Amsterdam and Haarlem",
      type: "buffer_zone",
      coordinates: [4.7333, 52.4167],
      radiusKm: 3.0,
      baseTreeCoverPercent: 30,
    },
  ],
  copenhagen: [
    {
      name: "Dyrehaven",
      description: "1,100 ha royal deer park with ancient oak forest",
      type: "protected",
      coordinates: [12.5750, 55.7917],
      radiusKm: 2.5,
      baseTreeCoverPercent: 78,
    },
    {
      name: "Jægersborg Hegn",
      description: "Protected forest north of Copenhagen",
      type: "protected",
      coordinates: [12.5500, 55.8167],
      radiusKm: 2.0,
      baseTreeCoverPercent: 82,
    },
    {
      name: "Vestskoven",
      description: "Western forest created through afforestation program",
      type: "restoration",
      coordinates: [12.3667, 55.6667],
      radiusKm: 3.0,
      baseTreeCoverPercent: 55,
    },
  ],
  singapore: [
    {
      name: "Bukit Timah Nature Reserve",
      description: "164 ha primary rainforest, one of few remaining in Singapore",
      type: "protected",
      coordinates: [103.7767, 1.3500],
      radiusKm: 1.0,
      baseTreeCoverPercent: 95,
    },
    {
      name: "Central Catchment Nature Reserve",
      description: "Largest nature reserve in Singapore, 2,880 ha",
      type: "protected",
      coordinates: [103.8167, 1.3667],
      radiusKm: 3.0,
      baseTreeCoverPercent: 88,
    },
    {
      name: "Sungei Buloh Wetland Reserve",
      description: "Mangrove wetland reserve, important bird habitat",
      type: "protected",
      coordinates: [103.7250, 1.4467],
      radiusKm: 1.5,
      baseTreeCoverPercent: 60,
    },
  ],
  melbourne: [
    {
      name: "Dandenong Ranges National Park",
      description: "Mountain ash forest and fern gullies east of Melbourne",
      type: "protected",
      coordinates: [145.3500, -37.8667],
      radiusKm: 4.0,
      baseTreeCoverPercent: 90,
    },
    {
      name: "Yarra Ranges National Park",
      description: "Large protected area with old-growth forest",
      type: "protected",
      coordinates: [145.8000, -37.7000],
      radiusKm: 8.0,
      baseTreeCoverPercent: 85,
    },
    {
      name: "Organ Pipes National Park",
      description: "Small park with ongoing revegetation program",
      type: "restoration",
      coordinates: [144.7667, -37.6833],
      radiusKm: 1.5,
      baseTreeCoverPercent: 35,
    },
  ],
};

// Rate limiting helper
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Determine forest health severity based on tree cover change
function getForestHealthSeverity(
  currentCover: number,
  baseCover: number,
  recentLossHa: number
): "critical" | "low" | "medium" | "high" {
  const coverChange = currentCover - baseCover;

  // Critical if significant loss or high recent deforestation
  if (coverChange < -10 || recentLossHa > TREE_COVER_LOSS_THRESHOLDS.high) {
    return "critical";
  }
  // Low if moderate loss
  if (coverChange < -5 || recentLossHa > TREE_COVER_LOSS_THRESHOLDS.medium) {
    return "low";
  }
  // Medium if stable or slight loss
  if (coverChange < 2 || recentLossHa > TREE_COVER_LOSS_THRESHOLDS.low) {
    return "medium";
  }
  // High (healthy) if gaining or very low loss
  return "high";
}

// Calculate forest health score (1-10)
function calculateForestHealthScore(
  currentCover: number,
  baseCover: number,
  recentLossHa: number,
  forestType: string
): number {
  // Base score from current cover percentage
  let score = (currentCover / 100) * 6;

  // Adjustment for change from baseline
  const coverChange = currentCover - baseCover;
  score += (coverChange / 20) * 2; // +/- 2 points for change

  // Penalty for recent loss
  const lossPenalty = Math.min(2, (recentLossHa / 100) * 2);
  score -= lossPenalty;

  // Bonus for protected/restoration areas performing well
  if (forestType === "protected" && coverChange >= 0) {
    score += 0.5;
  }
  if (forestType === "restoration" && coverChange > 0) {
    score += 1;
  }

  return Math.min(10, Math.max(1, Math.round(score * 10) / 10));
}

// Estimate carbon sequestration based on forest area and type
function estimateCarbonSequestration(
  areaHa: number,
  coverPercent: number,
  forestType: string
): number {
  // Carbon sequestration rates (tons CO2/ha/year) by forest type
  const rates: Record<string, number> = {
    protected: 8.5, // Mature forests
    urban_forest: 6.0, // Mixed urban
    restoration: 12.0, // Young growing forests sequester more
    buffer_zone: 5.0, // Mixed land use
    corridor: 7.0, // Linear forests
  };

  const rate = rates[forestType] || 6.0;
  const effectiveArea = areaHa * (coverPercent / 100);
  return Math.round(effectiveArea * rate);
}

// ============================================
// Internal Actions - Data Fetching
// ============================================

/**
 * Fetch forest data for a single area
 * Note: In production, integrate with GFW API using authenticated requests
 */
export const fetchForestDataForArea = internalAction({
  args: {
    citySlug: v.string(),
    areaIndex: v.number(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    areaName: string;
    data?: {
      currentTreeCover: number;
      recentLossHa: number;
      recentGainHa: number;
      carbonStock: number;
    };
    error?: string;
  }> => {
    const areas = CITY_FOREST_AREAS[args.citySlug];
    if (!areas || !areas[args.areaIndex]) {
      return {
        success: false,
        areaName: "Unknown",
        error: `Invalid city or area index`,
      };
    }

    const area = areas[args.areaIndex];

    // Simulate GFW data based on forest type and baseline
    // In production: Call GFW API with proper authentication
    const baseVariation = (Math.random() - 0.5) * 8; // +/- 4%
    const currentTreeCover = Math.max(
      5,
      Math.min(98, area.baseTreeCoverPercent + baseVariation)
    );

    // Simulate recent loss/gain based on area type
    const lossMultiplier: Record<string, number> = {
      protected: 0.3, // Low loss in protected areas
      urban_forest: 0.5,
      restoration: 0.2, // Very low loss in restoration
      buffer_zone: 1.5, // Higher pressure
      corridor: 1.0,
    };

    const gainMultiplier: Record<string, number> = {
      protected: 0.8,
      urban_forest: 0.5,
      restoration: 2.0, // High gain in restoration
      buffer_zone: 0.6,
      corridor: 1.0,
    };

    const baseAreaHa = Math.PI * area.radiusKm * area.radiusKm * 100; // Approximate area
    const baseLoss = Math.random() * 15 * (lossMultiplier[area.type] || 1);
    const baseGain = Math.random() * 10 * (gainMultiplier[area.type] || 1);

    return {
      success: true,
      areaName: area.name,
      data: {
        currentTreeCover: Math.round(currentTreeCover * 10) / 10,
        recentLossHa: Math.round(baseLoss * 10) / 10,
        recentGainHa: Math.round(baseGain * 10) / 10,
        carbonStock: estimateCarbonSequestration(
          baseAreaHa,
          currentTreeCover,
          area.type
        ),
      },
    };
  },
});

/**
 * Fetch forest data for all areas in a city
 */
export const fetchForestDataForCity = internalAction({
  args: {
    citySlug: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    citySlug: string;
    areasProcessed: number;
    errors: string[];
  }> => {
    const areas = CITY_FOREST_AREAS[args.citySlug];
    if (!areas) {
      return {
        success: false,
        citySlug: args.citySlug,
        areasProcessed: 0,
        errors: [`No forest areas defined for city: ${args.citySlug}`],
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
        areasProcessed: 0,
        errors: [`City not found: ${args.citySlug}`],
      };
    }

    const module = await ctx.runQuery(internal.modules.getBySlugInternal, {
      slug: "restoration",
    });
    if (!module) {
      return {
        success: false,
        citySlug: args.citySlug,
        areasProcessed: 0,
        errors: ["Restoration module not found"],
      };
    }

    for (let i = 0; i < areas.length; i++) {
      try {
        // Rate limiting - 2 seconds between requests
        if (i > 0) {
          await delay(2000);
        }

        const result = await ctx.runAction(
          internal.globalForestWatch.fetchForestDataForArea,
          {
            citySlug: args.citySlug,
            areaIndex: i,
          }
        );

        if (result.success && result.data) {
          const area = areas[i];
          const severity = getForestHealthSeverity(
            result.data.currentTreeCover,
            area.baseTreeCoverPercent,
            result.data.recentLossHa
          );
          const healthScore = calculateForestHealthScore(
            result.data.currentTreeCover,
            area.baseTreeCoverPercent,
            result.data.recentLossHa,
            area.type
          );

          // Upsert hotspot
          await ctx.runMutation(internal.globalForestWatch.upsertForestHotspot, {
            cityId: city._id,
            moduleId: module._id,
            forestArea: {
              name: area.name,
              description: area.description,
              type: area.type,
              coordinates: area.coordinates,
              baseTreeCoverPercent: area.baseTreeCoverPercent,
            },
            data: result.data,
            severity,
            healthScore,
          });

          processed++;
        } else {
          errors.push(result.error || `Failed to fetch data for ${result.areaName}`);
        }
      } catch (error) {
        errors.push(`Error processing area ${i}: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      citySlug: args.citySlug,
      areasProcessed: processed,
      errors,
    };
  },
});

/**
 * Fetch forest data for all cities
 */
export const fetchForestDataAllCities = internalAction({
  args: {},
  handler: async (ctx): Promise<{
    success: boolean;
    citiesProcessed: number;
    totalAreas: number;
    errors: string[];
  }> => {
    const cities = Object.keys(CITY_FOREST_AREAS);
    const errors: string[] = [];
    let totalAreas = 0;

    for (const citySlug of cities) {
      try {
        // Rate limiting between cities - 5 seconds
        if (cities.indexOf(citySlug) > 0) {
          await delay(5000);
        }

        const result = await ctx.runAction(
          internal.globalForestWatch.fetchForestDataForCity,
          { citySlug }
        );

        totalAreas += result.areasProcessed;
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
      totalAreas,
      errors,
    };
  },
});

// ============================================
// Internal Mutations - Data Storage
// ============================================

export const upsertForestHotspot = internalMutation({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    forestArea: v.object({
      name: v.string(),
      description: v.string(),
      type: v.string(),
      coordinates: v.array(v.number()),
      baseTreeCoverPercent: v.number(),
    }),
    data: v.object({
      currentTreeCover: v.number(),
      recentLossHa: v.number(),
      recentGainHa: v.number(),
      carbonStock: v.number(),
    }),
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    healthScore: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const [lng, lat] = args.forestArea.coordinates;

    // Check for existing hotspot at this location
    const existing = await ctx.db
      .query("hotspots")
      .withIndex("by_city_module", (q) =>
        q.eq("cityId", args.cityId).eq("moduleId", args.moduleId)
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("coordinates.lat"), lat - 0.01),
          q.lte(q.field("coordinates.lat"), lat + 0.01),
          q.gte(q.field("coordinates.lng"), lng - 0.01),
          q.lte(q.field("coordinates.lng"), lng + 0.01)
        )
      )
      .first();

    const coverChange = args.data.currentTreeCover - args.forestArea.baseTreeCoverPercent;
    const netChange = args.data.recentGainHa - args.data.recentLossHa;

    const metrics = [
      {
        key: "tree_cover",
        label: "Tree Cover",
        value: args.data.currentTreeCover,
        unit: "%",
      },
      {
        key: "cover_change",
        label: "Cover Change",
        value: Math.round(coverChange * 10) / 10,
        unit: "%",
      },
      {
        key: "recent_loss",
        label: "Recent Loss",
        value: args.data.recentLossHa,
        unit: "ha/year",
      },
      {
        key: "recent_gain",
        label: "Recent Gain",
        value: args.data.recentGainHa,
        unit: "ha/year",
      },
      {
        key: "net_change",
        label: "Net Change",
        value: Math.round(netChange * 10) / 10,
        unit: "ha/year",
      },
      {
        key: "carbon_sequestration",
        label: "Carbon Sequestration",
        value: args.data.carbonStock,
        unit: "tCO2/year",
      },
      {
        key: "forest_health",
        label: "Forest Health Score",
        value: args.healthScore,
        unit: "/10",
      },
    ];

    // Simplify metrics to only include value and optional unit (matching schema)
    const simplifiedMetrics = metrics.map(({ key, value, unit }) => ({ key, value, unit }));

    if (existing) {
      // Update existing hotspot
      await ctx.db.patch(existing._id, {
        severity: args.severity,
        metrics: simplifiedMetrics,
        lastUpdated: now,
      });
      return { action: "updated", hotspotId: existing._id };
    } else {
      // Create new hotspot
      const hotspotId = await ctx.db.insert("hotspots", {
        cityId: args.cityId,
        moduleId: args.moduleId,
        name: args.forestArea.name,
        description: args.forestArea.description,
        coordinates: { lat, lng },
        severity: args.severity,
        status: "active",
        metrics: simplifiedMetrics,
        metadata: {
          dataSource: "global-forest-watch",
          forestType: args.forestArea.type,
          baseTreeCover: args.forestArea.baseTreeCoverPercent,
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

export const getForestStats = query({
  args: {
    cityId: v.id("cities"),
  },
  handler: async (ctx, args) => {
    const module = await ctx.db
      .query("modules")
      .withIndex("by_slug", (q) => q.eq("slug", "restoration"))
      .first();
    if (!module) return null;

    const allHotspots = await ctx.db
      .query("hotspots")
      .withIndex("by_city_module", (q) =>
        q.eq("cityId", args.cityId).eq("moduleId", module._id)
      )
      .collect();

    // Filter for forest hotspots using metadata
    const forestHotspots = allHotspots.filter(
      (h) => h.metadata?.dataSource === "global-forest-watch"
    );

    if (forestHotspots.length === 0) return null;

    const treeCoverValues = forestHotspots
      .map((h) => h.metrics.find((m) => m.key === "tree_cover")?.value)
      .filter((v): v is number => v !== undefined);

    const carbonValues = forestHotspots
      .map((h) => h.metrics.find((m) => m.key === "carbon_sequestration")?.value)
      .filter((v): v is number => v !== undefined);

    const lossValues = forestHotspots
      .map((h) => h.metrics.find((m) => m.key === "recent_loss")?.value)
      .filter((v): v is number => v !== undefined);

    const gainValues = forestHotspots
      .map((h) => h.metrics.find((m) => m.key === "recent_gain")?.value)
      .filter((v): v is number => v !== undefined);

    const avgTreeCover =
      treeCoverValues.length > 0 ? treeCoverValues.reduce((a, b) => a + b, 0) / treeCoverValues.length : 0;
    const totalCarbon = carbonValues.reduce((a, b) => a + b, 0);
    const totalLoss = lossValues.reduce((a, b) => a + b, 0);
    const totalGain = gainValues.reduce((a, b) => a + b, 0);

    const severityCounts = {
      critical: forestHotspots.filter((h) => h.severity === "critical").length,
      low: forestHotspots.filter((h) => h.severity === "low").length,
      medium: forestHotspots.filter((h) => h.severity === "medium").length,
      high: forestHotspots.filter((h) => h.severity === "high").length,
    };

    return {
      totalForestAreas: forestHotspots.length,
      averageTreeCover: Math.round(avgTreeCover * 10) / 10,
      totalCarbonSequestration: Math.round(totalCarbon),
      totalRecentLoss: Math.round(totalLoss * 10) / 10,
      totalRecentGain: Math.round(totalGain * 10) / 10,
      netChange: Math.round((totalGain - totalLoss) * 10) / 10,
      severityBreakdown: severityCounts,
      healthyForests: severityCounts.high,
      threatenedForests: severityCounts.critical + severityCounts.low,
    };
  },
});

// ============================================
// Admin Mutations
// ============================================

export const triggerForestFetch = mutation({
  args: {
    citySlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.citySlug) {
      await ctx.scheduler.runAfter(
        0,
        internal.globalForestWatch.fetchForestDataForCity,
        { citySlug: args.citySlug }
      );
      return { scheduled: true, city: args.citySlug };
    } else {
      await ctx.scheduler.runAfter(
        0,
        internal.globalForestWatch.fetchForestDataAllCities,
        {}
      );
      return { scheduled: true, city: "all" };
    }
  },
});
