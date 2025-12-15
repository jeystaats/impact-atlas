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
// OpenAQ API v3 Integration
// Real-time ground station air quality data
// API Docs: https://docs.openaq.org/
// ============================================

// WHO Air Quality Guidelines (2021)
const AQ_THRESHOLDS = {
  pm25: { low: 15, medium: 35, high: 55, critical: 150 }, // µg/m³
  pm10: { low: 45, medium: 75, high: 150, critical: 250 }, // µg/m³
  no2: { low: 25, medium: 50, high: 100, critical: 200 }, // µg/m³
  o3: { low: 50, medium: 100, high: 150, critical: 200 }, // µg/m³
  so2: { low: 20, medium: 50, high: 100, critical: 200 }, // µg/m³
  co: { low: 4000, medium: 10000, high: 20000, critical: 30000 }, // µg/m³
};

// City coordinates for OpenAQ queries (with radius in km)
const CITY_CONFIG: Record<
  string,
  { lat: number; lng: number; radius: number; countryCode: string }
> = {
  amsterdam: { lat: 52.3676, lng: 4.9041, radius: 25, countryCode: "NL" },
  copenhagen: { lat: 55.6761, lng: 12.5683, radius: 25, countryCode: "DK" },
  singapore: { lat: 1.3521, lng: 103.8198, radius: 30, countryCode: "SG" },
  barcelona: { lat: 41.3874, lng: 2.1686, radius: 25, countryCode: "ES" },
  melbourne: { lat: -37.8136, lng: 144.9631, radius: 30, countryCode: "AU" },
};

// Supported air quality parameters
const SUPPORTED_PARAMETERS = ["pm25", "pm10", "no2", "o3", "so2", "co"];

// OpenAQ v3 API types
interface OpenAQSensor {
  id: number;
  name: string;
  parameter: {
    id: number;
    name: string;
    units: string;
    displayName: string;
  };
}

interface OpenAQLocation {
  id: number;
  name: string;
  locality: string | null;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  sensors: OpenAQSensor[];
  distance?: number;
}

interface OpenAQLatestResult {
  datetime: {
    utc: string;
    local: string;
  };
  value: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  sensorsId: number;
  locationsId: number;
}

/**
 * Calculate severity from measurement value
 */
function calculateSeverity(
  parameter: string,
  value: number
): "low" | "medium" | "high" | "critical" {
  const thresholds = AQ_THRESHOLDS[parameter as keyof typeof AQ_THRESHOLDS];
  if (!thresholds) return "medium";

  if (value < thresholds.low) return "low";
  if (value < thresholds.medium) return "medium";
  if (value < thresholds.high) return "high";
  return "critical";
}

/**
 * Calculate overall AQI from multiple parameters
 * Uses simplified AQI calculation (worst pollutant method)
 */
function calculateAQI(
  measurements: Array<{ parameter: string; value: number }>
): number {
  let maxAQI = 0;

  for (const m of measurements) {
    const thresholds = AQ_THRESHOLDS[m.parameter as keyof typeof AQ_THRESHOLDS];
    if (!thresholds) continue;

    // Simplified AQI: scale 0-200 based on thresholds
    let aqi: number;
    if (m.value < thresholds.low) {
      aqi = (m.value / thresholds.low) * 50;
    } else if (m.value < thresholds.medium) {
      aqi =
        50 +
        ((m.value - thresholds.low) / (thresholds.medium - thresholds.low)) *
          50;
    } else if (m.value < thresholds.high) {
      aqi =
        100 +
        ((m.value - thresholds.medium) / (thresholds.high - thresholds.medium)) *
          50;
    } else {
      aqi =
        150 +
        ((m.value - thresholds.high) / (thresholds.critical - thresholds.high)) *
          50;
    }

    maxAQI = Math.max(maxAQI, aqi);
  }

  return Math.round(Math.min(maxAQI, 300)); // Cap at 300
}

/**
 * Store OpenAQ measurement data
 */
export const storeOpenAQData = internalMutation({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    locationId: v.number(),
    locationName: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    measurements: v.array(
      v.object({
        parameter: v.string(),
        value: v.number(),
        unit: v.string(),
        lastUpdated: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Convert measurements to our format
    const formattedMeasurements = args.measurements.map((m) => ({
      key: m.parameter,
      value: m.value,
      unit: m.unit,
      qualityFlag: 100, // Ground stations have high quality
    }));

    // Store in satelliteData table (reusing for all environmental data)
    const id = await ctx.db.insert("satelliteData", {
      cityId: args.cityId,
      moduleId: args.moduleId,
      coordinates: args.coordinates,
      dataSourceSlug: "openaq",
      satelliteId: `openaq-${args.locationId}`,
      productType: "ground-station",
      measurements: formattedMeasurements,
      processingLevel: "validated",
      measurementDate: now,
      ingestionDate: now,
      rawMetadata: {
        locationId: args.locationId,
        locationName: args.locationName,
      },
    });

    return id;
  },
});

/**
 * Create or update hotspot from OpenAQ data
 */
export const upsertHotspotFromOpenAQ = internalMutation({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    locationId: v.number(),
    locationName: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    measurements: v.array(
      v.object({
        parameter: v.string(),
        value: v.number(),
        unit: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Find the worst measurement for severity
    let worstSeverity: "low" | "medium" | "high" | "critical" = "low";

    for (const m of args.measurements) {
      const severity = calculateSeverity(m.parameter, m.value);
      const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
      if (severityOrder[severity] > severityOrder[worstSeverity]) {
        worstSeverity = severity;
      }
    }

    // Calculate AQI
    const aqi = calculateAQI(args.measurements);

    // Check for existing hotspot from this OpenAQ station
    const existingHotspots = await ctx.db
      .query("hotspots")
      .withIndex("by_city_module", (q) =>
        q.eq("cityId", args.cityId).eq("moduleId", args.moduleId)
      )
      .collect();

    // Find hotspot by metadata locationId or nearby coordinates
    const existingHotspot = existingHotspots.find((h) => {
      // Check metadata first
      if (
        h.metadata &&
        typeof h.metadata === "object" &&
        "openaqLocationId" in h.metadata
      ) {
        return h.metadata.openaqLocationId === args.locationId;
      }
      // Fallback to coordinate proximity (~500m)
      const latDiff = Math.abs(h.coordinates.lat - args.coordinates.lat);
      const lngDiff = Math.abs(h.coordinates.lng - args.coordinates.lng);
      return latDiff < 0.005 && lngDiff < 0.005;
    });

    const now = Date.now();

    // Format metrics for storage
    const metrics = args.measurements.map((m) => {
      const existingMetric = existingHotspot?.metrics.find(
        (em) => em.key === m.parameter
      );
      const previousValue = existingMetric?.value;

      return {
        key: m.parameter,
        value: m.value,
        unit: m.unit,
        trend:
          previousValue !== undefined
            ? m.value > previousValue
              ? ("up" as const)
              : m.value < previousValue
                ? ("down" as const)
                : ("stable" as const)
            : undefined,
      };
    });

    // Add AQI as a metric
    metrics.unshift({
      key: "aqi",
      value: aqi,
      unit: "AQI",
      trend: undefined,
    });

    if (existingHotspot) {
      // Update existing hotspot
      await ctx.db.patch(existingHotspot._id, {
        severity: worstSeverity,
        metrics,
        displayValue: `AQI ${aqi}`,
        lastUpdated: now,
      });

      return { action: "updated" as const, hotspotId: existingHotspot._id };
    } else {
      // Create new hotspot
      const hotspotId = await ctx.db.insert("hotspots", {
        cityId: args.cityId,
        moduleId: args.moduleId,
        name: args.locationName,
        description: `Real-time air quality monitoring station from OpenAQ network. Measures PM2.5, PM10, NO2, O3, SO2, and CO levels.`,
        coordinates: args.coordinates,
        severity: worstSeverity,
        status: "active",
        metrics,
        displayValue: `AQI ${aqi}`,
        metadata: {
          openaqLocationId: args.locationId,
          dataSource: "OpenAQ",
        },
        detectedAt: now,
        lastUpdated: now,
        createdAt: now,
      });

      return { action: "created" as const, hotspotId };
    }
  },
});

/**
 * Fetch air quality data from OpenAQ API v3 for a specific city
 */
export const fetchOpenAQData = internalAction({
  args: {
    citySlug: v.string(),
  },
  handler: async (ctx, args) => {
    // Get city info
    const city = await ctx.runQuery(internal.cities.getBySlugInternal, {
      slug: args.citySlug,
    });

    if (!city) {
      throw new Error(`City not found: ${args.citySlug}`);
    }

    // Get city config
    const config = CITY_CONFIG[args.citySlug];
    if (!config) {
      throw new Error(`No OpenAQ config for city: ${args.citySlug}`);
    }

    // Get air-quality module
    const airQualityModule = await ctx.runQuery(
      internal.modules.getBySlugInternal,
      { slug: "air-quality" }
    );

    if (!airQualityModule) {
      throw new Error(
        "Air quality module not found. Please seed the database."
      );
    }

    // Create ingestion log
    const logId = await ctx.runMutation(
      internal.satelliteData.createIngestionLog,
      {
        dataSourceSlug: "openaq",
        cityId: city._id,
        moduleId: airQualityModule._id,
      }
    );

    await ctx.runMutation(internal.satelliteData.updateIngestionLog, {
      logId,
      status: "fetching",
    });

    // Get API key from environment
    const apiKey = process.env.OPENAQ_API_KEY;

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (apiKey) {
      headers["X-API-Key"] = apiKey;
    }

    try {
      // Step 1: Find locations near the city using v3 API
      const locationsUrl = new URL("https://api.openaq.org/v3/locations");
      locationsUrl.searchParams.set(
        "coordinates",
        `${config.lat},${config.lng}`
      );
      locationsUrl.searchParams.set("radius", String(config.radius * 1000)); // km to meters
      locationsUrl.searchParams.set("limit", "50");

      console.log(
        `Fetching OpenAQ v3 locations for ${args.citySlug}: ${locationsUrl.toString()}`
      );

      const locationsResponse = await fetch(locationsUrl.toString(), {
        headers,
      });

      if (!locationsResponse.ok) {
        const errorText = await locationsResponse.text();
        throw new Error(
          `OpenAQ API error: ${locationsResponse.status} ${locationsResponse.statusText} - ${errorText}`
        );
      }

      const locationsData = await locationsResponse.json();
      const locations: OpenAQLocation[] = locationsData.results || [];

      await ctx.runMutation(internal.satelliteData.updateIngestionLog, {
        logId,
        status: "processing",
        recordsFetched: locations.length,
      });

      let recordsStored = 0;
      let hotspotsCreated = 0;
      let hotspotsUpdated = 0;

      // Step 2: For each location, get latest measurements
      for (const location of locations) {
        try {
          // Build sensor ID to parameter mapping
          const sensorMap = new Map<number, OpenAQSensor>();
          for (const sensor of location.sensors || []) {
            if (SUPPORTED_PARAMETERS.includes(sensor.parameter.name)) {
              sensorMap.set(sensor.id, sensor);
            }
          }

          // Skip locations with no supported sensors
          if (sensorMap.size === 0) {
            continue;
          }

          // Fetch latest measurements for this location
          const latestUrl = `https://api.openaq.org/v3/locations/${location.id}/latest`;
          const latestResponse = await fetch(latestUrl, { headers });

          if (!latestResponse.ok) {
            console.error(
              `Failed to fetch latest for location ${location.id}: ${latestResponse.status}`
            );
            continue;
          }

          const latestData = await latestResponse.json();
          const latestResults: OpenAQLatestResult[] = latestData.results || [];

          // Map sensor readings to parameters
          const measurements: Array<{
            parameter: string;
            value: number;
            unit: string;
            lastUpdated: string;
          }> = [];

          for (const reading of latestResults) {
            const sensor = sensorMap.get(reading.sensorsId);
            if (sensor && reading.value !== null && reading.value >= 0) {
              // Only include recent measurements (within last 24 hours)
              const readingTime = new Date(reading.datetime.utc).getTime();
              const hoursSinceReading =
                (Date.now() - readingTime) / (1000 * 60 * 60);

              if (hoursSinceReading <= 24) {
                measurements.push({
                  parameter: sensor.parameter.name,
                  value: reading.value,
                  unit: sensor.parameter.units,
                  lastUpdated: reading.datetime.utc,
                });
              }
            }
          }

          // Skip if no valid measurements
          if (measurements.length === 0) {
            continue;
          }

          const coordinates = {
            lat: location.coordinates.latitude,
            lng: location.coordinates.longitude,
          };

          const locationName =
            location.name || location.locality || `Station ${location.id}`;

          // Store raw data
          await ctx.runMutation(internal.openaq.storeOpenAQData, {
            cityId: city._id,
            moduleId: airQualityModule._id,
            locationId: location.id,
            locationName,
            coordinates,
            measurements,
          });

          recordsStored++;

          // Create/update hotspot
          const result = await ctx.runMutation(
            internal.openaq.upsertHotspotFromOpenAQ,
            {
              cityId: city._id,
              moduleId: airQualityModule._id,
              locationId: location.id,
              locationName,
              coordinates,
              measurements: measurements.map((m) => ({
                parameter: m.parameter,
                value: m.value,
                unit: m.unit,
              })),
            }
          );

          if (result.action === "created") {
            hotspotsCreated++;
          } else {
            hotspotsUpdated++;
          }
        } catch (locationError) {
          console.error(
            `Error processing OpenAQ location ${location.id}:`,
            locationError
          );
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
        locationsFound: locations.length,
        recordsStored,
        hotspotsCreated,
        hotspotsUpdated,
      };
    } catch (error) {
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
 * Helper to delay execution
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch OpenAQ data for all active cities with rate limiting
 */
export const fetchOpenAQAllCities = internalAction({
  args: {},
  handler: async (
    ctx
  ): Promise<Array<{ success: boolean; city: string; error?: string }>> => {
    const cities = await ctx.runQuery(internal.cities.listActive, {});

    const results: Array<{ success: boolean; city: string; error?: string }> =
      [];

    // Filter to only cities with OpenAQ config
    const configuredCities = (cities as Array<{ slug: string }>).filter(
      (city) => CITY_CONFIG[city.slug]
    );

    for (let i = 0; i < configuredCities.length; i++) {
      const city = configuredCities[i];

      // Rate limiting: wait 2 seconds between cities to avoid 429 errors
      // OpenAQ free tier allows ~100 requests/minute
      if (i > 0) {
        console.log(`Rate limiting: waiting 2s before fetching ${city.slug}...`);
        await delay(2000);
      }

      try {
        const result = (await ctx.runAction(internal.openaq.fetchOpenAQData, {
          citySlug: city.slug,
        })) as { success: boolean; city: string; error?: string };
        results.push(result);
      } catch (error) {
        console.error(`Error fetching OpenAQ data for ${city.slug}:`, error);
        results.push({
          success: false,
          city: city.slug,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        // If rate limited, wait longer before next request
        if (
          error instanceof Error &&
          error.message.includes("429")
        ) {
          console.log("Rate limited - waiting 10s before retry...");
          await delay(10000);
        }
      }
    }

    // Log skipped cities
    const skippedCities = (cities as Array<{ slug: string }>).filter(
      (city) => !CITY_CONFIG[city.slug]
    );
    if (skippedCities.length > 0) {
      console.log(
        `Skipped ${skippedCities.length} cities without OpenAQ config: ${skippedCities.map((c) => c.slug).join(", ")}`
      );
    }

    return results;
  },
});

/**
 * Query to get latest OpenAQ data for a city
 */
export const getLatestByCity = query({
  args: {
    cityId: v.id("cities"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("satelliteData")
      .withIndex("by_city", (q) => q.eq("cityId", args.cityId))
      .filter((q) => q.eq(q.field("dataSourceSlug"), "openaq"))
      .order("desc")
      .take(50);
  },
});

/**
 * Manual trigger for testing (requires admin)
 */
export const triggerFetch = mutation({
  args: {
    citySlug: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.scheduler.runAfter(0, internal.openaq.fetchOpenAQData, {
      citySlug: args.citySlug,
    });

    return {
      scheduled: true,
      message: `OpenAQ fetch scheduled for ${args.citySlug}`,
    };
  },
});

export const triggerFetchAll = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    await ctx.scheduler.runAfter(0, internal.openaq.fetchOpenAQAllCities, {});

    return {
      scheduled: true,
      message: "OpenAQ fetch scheduled for all cities",
    };
  },
});
