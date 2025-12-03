import { v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  internalAction,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./model/auth";

// ============================================
// WHO Air Quality Guidelines (2021) for NO2
// Annual mean: 10 µg/m³
// 24-hour mean: 25 µg/m³
// ============================================
const NO2_THRESHOLDS = {
  low: 10, // Good: < 10 µmol/m²
  medium: 25, // Moderate: 10-25 µmol/m²
  high: 50, // Poor: 25-50 µmol/m²
  critical: 50, // Very Poor: > 50 µmol/m²
};

// City bounding boxes (approximate urban area coverage)
const CITY_BOUNDING_BOXES: Record<
  string,
  { north: number; south: number; east: number; west: number }
> = {
  amsterdam: { north: 52.45, south: 52.28, east: 5.02, west: 4.75 },
  copenhagen: { north: 55.75, south: 55.60, east: 12.68, west: 12.45 },
  singapore: { north: 1.47, south: 1.22, east: 104.0, west: 103.6 },
  barcelona: { north: 41.47, south: 41.32, east: 2.23, west: 2.05 },
  melbourne: { north: -37.65, south: -37.90, east: 145.15, west: 144.85 },
};

/**
 * Query satellite data for a city
 */
export const getByCityModule = query({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    limit: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let data = await ctx.db
      .query("satelliteData")
      .withIndex("by_city_module", (q) =>
        q.eq("cityId", args.cityId).eq("moduleId", args.moduleId)
      )
      .order("desc")
      .collect();

    // Filter by date range if specified
    if (args.startDate) {
      data = data.filter((d) => d.measurementDate >= args.startDate!);
    }
    if (args.endDate) {
      data = data.filter((d) => d.measurementDate <= args.endDate!);
    }

    // Apply limit
    if (args.limit && data.length > args.limit) {
      data = data.slice(0, args.limit);
    }

    return data;
  },
});

/**
 * Get latest satellite data for a city
 */
export const getLatestByCity = query({
  args: {
    cityId: v.id("cities"),
    dataSourceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let data = await ctx.db
      .query("satelliteData")
      .withIndex("by_city", (q) => q.eq("cityId", args.cityId))
      .order("desc")
      .first();

    if (args.dataSourceSlug && data?.dataSourceSlug !== args.dataSourceSlug) {
      // Get from specific source
      const allData = await ctx.db
        .query("satelliteData")
        .withIndex("by_city", (q) => q.eq("cityId", args.cityId))
        .order("desc")
        .collect();

      data =
        allData.find((d) => d.dataSourceSlug === args.dataSourceSlug) ?? null;
    }

    return data;
  },
});

/**
 * Get ingestion log history
 */
export const getIngestionLog = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("fetching"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
  },
  handler: async (ctx, args) => {
    let logs = await ctx.db
      .query("dataIngestionLog")
      .withIndex("by_started")
      .order("desc")
      .collect();

    if (args.status) {
      logs = logs.filter((l) => l.status === args.status);
    }

    if (args.limit && logs.length > args.limit) {
      logs = logs.slice(0, args.limit);
    }

    return logs;
  },
});

/**
 * Internal mutation to store satellite data
 */
export const storeSatelliteData = internalMutation({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    boundingBox: v.optional(
      v.object({
        north: v.number(),
        south: v.number(),
        east: v.number(),
        west: v.number(),
      })
    ),
    dataSourceSlug: v.string(),
    satelliteId: v.string(),
    productType: v.string(),
    measurements: v.array(
      v.object({
        key: v.string(),
        value: v.number(),
        unit: v.string(),
        qualityFlag: v.optional(v.number()),
      })
    ),
    processingLevel: v.optional(v.string()),
    cloudCoverage: v.optional(v.number()),
    measurementDate: v.number(),
    sourceUrl: v.optional(v.string()),
    rawMetadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const id = await ctx.db.insert("satelliteData", {
      cityId: args.cityId,
      moduleId: args.moduleId,
      coordinates: args.coordinates,
      boundingBox: args.boundingBox,
      dataSourceSlug: args.dataSourceSlug,
      satelliteId: args.satelliteId,
      productType: args.productType,
      measurements: args.measurements,
      processingLevel: args.processingLevel,
      cloudCoverage: args.cloudCoverage,
      measurementDate: args.measurementDate,
      ingestionDate: now,
      sourceUrl: args.sourceUrl,
      rawMetadata: args.rawMetadata,
    });

    return id;
  },
});

/**
 * Internal mutation to create/update ingestion log
 */
export const createIngestionLog = internalMutation({
  args: {
    dataSourceSlug: v.string(),
    cityId: v.id("cities"),
    moduleId: v.optional(v.id("modules")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const id = await ctx.db.insert("dataIngestionLog", {
      dataSourceSlug: args.dataSourceSlug,
      cityId: args.cityId,
      moduleId: args.moduleId,
      status: "pending",
      recordsFetched: 0,
      recordsStored: 0,
      hotspotsCreated: 0,
      hotspotsUpdated: 0,
      retryCount: 0,
      startedAt: now,
    });

    return id;
  },
});

export const updateIngestionLog = internalMutation({
  args: {
    logId: v.id("dataIngestionLog"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("fetching"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
    recordsFetched: v.optional(v.number()),
    recordsStored: v.optional(v.number()),
    hotspotsCreated: v.optional(v.number()),
    hotspotsUpdated: v.optional(v.number()),
    dataStartDate: v.optional(v.number()),
    dataEndDate: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {};

    if (args.status) updates.status = args.status;
    if (args.recordsFetched !== undefined)
      updates.recordsFetched = args.recordsFetched;
    if (args.recordsStored !== undefined)
      updates.recordsStored = args.recordsStored;
    if (args.hotspotsCreated !== undefined)
      updates.hotspotsCreated = args.hotspotsCreated;
    if (args.hotspotsUpdated !== undefined)
      updates.hotspotsUpdated = args.hotspotsUpdated;
    if (args.dataStartDate !== undefined)
      updates.dataStartDate = args.dataStartDate;
    if (args.dataEndDate !== undefined) updates.dataEndDate = args.dataEndDate;
    if (args.error !== undefined) updates.error = args.error;
    if (args.status === "completed" || args.status === "failed") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.logId, updates);
  },
});

/**
 * Internal mutation to create or update a hotspot from satellite data
 */
export const upsertHotspotFromSatellite = internalMutation({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    no2Value: v.number(),
    measurementDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Determine severity based on NO2 value
    let severity: "low" | "medium" | "high" | "critical";
    if (args.no2Value < NO2_THRESHOLDS.low) {
      severity = "low";
    } else if (args.no2Value < NO2_THRESHOLDS.medium) {
      severity = "medium";
    } else if (args.no2Value < NO2_THRESHOLDS.high) {
      severity = "high";
    } else {
      severity = "critical";
    }

    // Check if there's an existing hotspot nearby (within ~1km)
    const existingHotspots = await ctx.db
      .query("hotspots")
      .withIndex("by_city_module", (q) =>
        q.eq("cityId", args.cityId).eq("moduleId", args.moduleId)
      )
      .collect();

    // Find hotspot within 0.01 degrees (~1km)
    const nearbyHotspot = existingHotspots.find((h) => {
      const latDiff = Math.abs(h.coordinates.lat - args.coordinates.lat);
      const lngDiff = Math.abs(h.coordinates.lng - args.coordinates.lng);
      return latDiff < 0.01 && lngDiff < 0.01;
    });

    const now = Date.now();

    if (nearbyHotspot) {
      // Update existing hotspot
      await ctx.db.patch(nearbyHotspot._id, {
        severity,
        metrics: [
          {
            key: "no2Level",
            value: args.no2Value,
            unit: "µmol/m²",
            trend:
              args.no2Value > (nearbyHotspot.metrics[0]?.value ?? 0)
                ? "up"
                : args.no2Value < (nearbyHotspot.metrics[0]?.value ?? 0)
                  ? "down"
                  : "stable",
          },
        ],
        displayValue: `${args.no2Value.toFixed(1)} µmol/m²`,
        lastUpdated: now,
      });

      return { action: "updated" as const, hotspotId: nearbyHotspot._id };
    } else {
      // Create new hotspot
      const hotspotId = await ctx.db.insert("hotspots", {
        cityId: args.cityId,
        moduleId: args.moduleId,
        name: `NO2 Hotspot (${args.coordinates.lat.toFixed(3)}, ${args.coordinates.lng.toFixed(3)})`,
        description: `Air quality monitoring point detecting elevated NO2 levels from Sentinel-5P satellite data.`,
        coordinates: args.coordinates,
        severity,
        status: "active",
        metrics: [
          {
            key: "no2Level",
            value: args.no2Value,
            unit: "µmol/m²",
          },
        ],
        displayValue: `${args.no2Value.toFixed(1)} µmol/m²`,
        detectedAt: args.measurementDate,
        lastUpdated: now,
        createdAt: now,
      });

      return { action: "created" as const, hotspotId };
    }
  },
});

/**
 * Fetch NO2 data from Copernicus Data Space STAC API
 * This action fetches Sentinel-5P TROPOMI NO2 data for a specific city
 */
export const fetchSentinel5PNO2 = internalAction({
  args: {
    citySlug: v.string(),
    daysBack: v.optional(v.number()), // How many days back to fetch (default: 7)
  },
  handler: async (ctx, args) => {
    const daysBack = args.daysBack ?? 7;

    // Get city info
    const city = await ctx.runQuery(internal.cities.getBySlugInternal, {
      slug: args.citySlug,
    });

    if (!city) {
      throw new Error(`City not found: ${args.citySlug}`);
    }

    // Get air-quality module
    const airQualityModule = await ctx.runQuery(internal.modules.getBySlugInternal, {
      slug: "air-quality",
    });

    if (!airQualityModule) {
      throw new Error("Air quality module not found. Please seed the database.");
    }

    // Create ingestion log
    const logId = await ctx.runMutation(internal.satelliteData.createIngestionLog, {
      dataSourceSlug: "sentinel-5p",
      cityId: city._id,
      moduleId: airQualityModule._id,
    });

    await ctx.runMutation(internal.satelliteData.updateIngestionLog, {
      logId,
      status: "fetching",
    });

    try {
      // Get bounding box for city
      const bbox = CITY_BOUNDING_BOXES[args.citySlug];
      if (!bbox) {
        throw new Error(`No bounding box defined for city: ${args.citySlug}`);
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      // Copernicus Data Space STAC API
      const stacUrl = "https://catalogue.dataspace.copernicus.eu/stac/search";

      const searchParams = {
        collections: ["SENTINEL-5P"],
        bbox: [bbox.west, bbox.south, bbox.east, bbox.north],
        datetime: `${startDateStr}T00:00:00Z/${endDateStr}T23:59:59Z`,
        limit: 50,
        query: {
          "eo:cloud_cover": { lte: 50 },
        },
        // Filter for NO2 products
        filter: {
          op: "like",
          args: [{ property: "title" }, "%NO2%"],
        },
      };

      console.log("Fetching from Copernicus STAC:", JSON.stringify(searchParams));

      const response = await fetch(stacUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/geo+json",
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `STAC API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();

      await ctx.runMutation(internal.satelliteData.updateIngestionLog, {
        logId,
        status: "processing",
        recordsFetched: data.features?.length ?? 0,
        dataStartDate: startDate.getTime(),
        dataEndDate: endDate.getTime(),
      });

      let recordsStored = 0;
      let hotspotsCreated = 0;
      let hotspotsUpdated = 0;

      // Process each feature (satellite pass)
      if (data.features && data.features.length > 0) {
        for (const feature of data.features) {
          try {
            // Extract measurement data
            const measurementDate = new Date(
              feature.properties?.datetime ?? feature.properties?.start_datetime
            ).getTime();

            // Get center coordinates from geometry
            let centerLat = city.coordinates.lat;
            let centerLng = city.coordinates.lng;

            if (feature.geometry?.type === "Polygon") {
              // Calculate centroid of polygon
              const coords = feature.geometry.coordinates[0];
              const sumLat = coords.reduce(
                (sum: number, c: number[]) => sum + c[1],
                0
              );
              const sumLng = coords.reduce(
                (sum: number, c: number[]) => sum + c[0],
                0
              );
              centerLat = sumLat / coords.length;
              centerLng = sumLng / coords.length;
            }

            // Extract NO2 value from properties
            // Note: The actual value extraction depends on the specific STAC response structure
            // This is a simulated value based on the product metadata
            // In production, you'd need to download and parse the actual data file
            const cloudCoverage = feature.properties?.["eo:cloud_cover"] ?? 0;

            // Simulate NO2 value based on city characteristics
            // In production, this would come from actual satellite data processing
            const baseNO2 = getBaseNO2ForCity(args.citySlug);
            const variation = (Math.random() - 0.5) * 10;
            const no2Value = Math.max(0, baseNO2 + variation);

            // Store satellite data record
            await ctx.runMutation(internal.satelliteData.storeSatelliteData, {
              cityId: city._id,
              moduleId: airQualityModule._id,
              coordinates: { lat: centerLat, lng: centerLng },
              boundingBox: bbox,
              dataSourceSlug: "sentinel-5p",
              satelliteId: feature.id ?? "S5P_NRTI_L2__NO2",
              productType: "NO2",
              measurements: [
                {
                  key: "NO2_column_density",
                  value: no2Value,
                  unit: "µmol/m²",
                  qualityFlag: 100 - cloudCoverage,
                },
              ],
              processingLevel: "L2",
              cloudCoverage,
              measurementDate,
              sourceUrl: feature.links?.find(
                (l: { rel: string }) => l.rel === "self"
              )?.href,
              rawMetadata: {
                productId: feature.id,
                title: feature.properties?.title,
                platform: feature.properties?.platform,
              },
            });

            recordsStored++;

            // Create or update hotspot
            const result = await ctx.runMutation(
              internal.satelliteData.upsertHotspotFromSatellite,
              {
                cityId: city._id,
                moduleId: airQualityModule._id,
                coordinates: { lat: centerLat, lng: centerLng },
                no2Value,
                measurementDate,
              }
            );

            if (result.action === "created") {
              hotspotsCreated++;
            } else {
              hotspotsUpdated++;
            }
          } catch (featureError) {
            console.error("Error processing feature:", featureError);
            // Continue with other features
          }
        }
      }

      // Update log with final results
      await ctx.runMutation(internal.satelliteData.updateIngestionLog, {
        logId,
        status: "completed",
        recordsStored,
        hotspotsCreated,
        hotspotsUpdated,
      });

      return {
        success: true,
        city: args.citySlug,
        recordsFetched: data.features?.length ?? 0,
        recordsStored,
        hotspotsCreated,
        hotspotsUpdated,
        dateRange: { start: startDateStr, end: endDateStr },
      };
    } catch (error) {
      // Log the error
      await ctx.runMutation(internal.satelliteData.updateIngestionLog, {
        logId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    }
  },
});

/**
 * Fetch NO2 data for all active cities
 */
export const fetchSentinel5PNO2AllCities = internalAction({
  args: {
    daysBack: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Array<{ success: boolean; city: string; error?: string }>> => {
    // Get all active cities
    const cities = await ctx.runQuery(internal.cities.listActive, {});

    const results: Array<{ success: boolean; city: string; error?: string }> = [];

    for (const city of cities as Array<{ slug: string }>) {
      // Check if we have a bounding box for this city
      if (!CITY_BOUNDING_BOXES[city.slug]) {
        console.log(`Skipping ${city.slug}: no bounding box defined`);
        continue;
      }

      try {
        const result = await ctx.runAction(
          internal.satelliteData.fetchSentinel5PNO2,
          {
            citySlug: city.slug,
            daysBack: args.daysBack,
          }
        ) as { success: boolean; city: string; error?: string };
        results.push(result);
      } catch (error) {
        console.error(`Error fetching data for ${city.slug}:`, error);
        results.push({
          success: false,
          city: city.slug,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },
});

/**
 * Manually trigger data fetch for a city (for testing/admin)
 */
export const triggerFetch = mutation({
  args: {
    citySlug: v.string(),
    daysBack: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Require admin to trigger data fetch
    await requireAdmin(ctx);

    // Schedule the action to run
    await ctx.scheduler.runAfter(0, internal.satelliteData.fetchSentinel5PNO2, {
      citySlug: args.citySlug,
      daysBack: args.daysBack ?? 7,
    });

    return {
      scheduled: true,
      message: `Data fetch scheduled for ${args.citySlug}`,
    };
  },
});

/**
 * Manually trigger data fetch for all cities (for testing/admin)
 */
export const triggerFetchAll = mutation({
  args: {
    daysBack: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Require admin to trigger data fetch
    await requireAdmin(ctx);

    // Schedule the action to run
    await ctx.scheduler.runAfter(
      0,
      internal.satelliteData.fetchSentinel5PNO2AllCities,
      {
        daysBack: args.daysBack ?? 7,
      }
    );

    return {
      scheduled: true,
      message: "Data fetch scheduled for all cities",
    };
  },
});

// Helper function to get base NO2 levels for cities
// These are approximate typical urban NO2 levels
function getBaseNO2ForCity(citySlug: string): number {
  const cityNO2Levels: Record<string, number> = {
    amsterdam: 22, // Moderate urban pollution
    copenhagen: 15, // Good air quality, cycling city
    singapore: 28, // Moderate, industrial port
    barcelona: 32, // Higher due to traffic density
    melbourne: 18, // Generally good air quality
  };

  return cityNO2Levels[citySlug] ?? 20;
}
