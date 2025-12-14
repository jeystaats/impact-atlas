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
// Urban Heat Integration using Open-Meteo API
// Free weather API: https://open-meteo.com/
// ============================================

// Urban heat severity thresholds (temperature anomaly in °C)
const HEAT_ANOMALY_THRESHOLDS = {
  low: 2, // 0-2°C above normal
  medium: 4, // 2-4°C above normal
  high: 6, // 4-6°C above normal
  critical: 6, // >6°C above normal (heat wave territory)
};

// Monthly average temperatures for reference (historical baseline)
// Based on climate normals for each city
const CITY_CLIMATE_NORMALS: Record<
  string,
  {
    lat: number;
    lng: number;
    monthlyAvg: number[]; // Jan-Dec average temps in °C
  }
> = {
  amsterdam: {
    lat: 52.3676,
    lng: 4.9041,
    monthlyAvg: [3.4, 3.7, 6.4, 9.5, 13.3, 16.0, 18.2, 18.0, 14.9, 11.0, 6.9, 4.1],
  },
  copenhagen: {
    lat: 55.6761,
    lng: 12.5683,
    monthlyAvg: [0.4, 0.3, 2.6, 7.1, 12.0, 15.6, 17.8, 17.3, 13.5, 9.1, 4.9, 1.8],
  },
  singapore: {
    lat: 1.3521,
    lng: 103.8198,
    monthlyAvg: [26.5, 27.1, 27.5, 28.0, 28.3, 28.3, 27.9, 27.9, 27.6, 27.6, 27.0, 26.4],
  },
  barcelona: {
    lat: 41.3874,
    lng: 2.1686,
    monthlyAvg: [9.3, 10.0, 12.1, 14.2, 17.6, 21.4, 24.3, 24.5, 21.6, 17.4, 12.8, 9.9],
  },
  melbourne: {
    lat: -37.8136,
    lng: 144.9631,
    // Southern hemisphere - summer is Dec-Feb
    monthlyAvg: [20.3, 20.4, 18.5, 15.4, 12.6, 10.5, 9.8, 10.7, 12.5, 14.7, 16.9, 18.8],
  },
};

// Known urban heat island hotspot areas in each city
// These are areas typically warmer due to urbanization
const CITY_HEAT_ZONES: Record<
  string,
  Array<{
    name: string;
    lat: number;
    lng: number;
    description: string;
    urbanIntensity: number; // 1-5, affects heat island effect
  }>
> = {
  barcelona: [
    {
      name: "Eixample District",
      lat: 41.3925,
      lng: 2.1639,
      description: "Dense urban grid with limited green space, high building density creates significant heat retention.",
      urbanIntensity: 5,
    },
    {
      name: "El Raval",
      lat: 41.3806,
      lng: 2.1700,
      description: "Historic dense neighborhood with narrow streets and minimal vegetation.",
      urbanIntensity: 4,
    },
    {
      name: "Poblenou Industrial",
      lat: 41.4035,
      lng: 2.2040,
      description: "Former industrial area with large paved surfaces and warehouses.",
      urbanIntensity: 4,
    },
    {
      name: "Plaça Catalunya Area",
      lat: 41.3870,
      lng: 2.1700,
      description: "Major commercial hub with heavy pedestrian traffic and heat-absorbing surfaces.",
      urbanIntensity: 5,
    },
    {
      name: "Zona Franca Industrial",
      lat: 41.3485,
      lng: 2.1230,
      description: "Large industrial and logistics zone with extensive impervious surfaces.",
      urbanIntensity: 4,
    },
  ],
  amsterdam: [
    {
      name: "Centrum",
      lat: 52.3731,
      lng: 4.8922,
      description: "Historic city center with dense building coverage and tourism activity.",
      urbanIntensity: 4,
    },
    {
      name: "Zuidas Business District",
      lat: 52.3382,
      lng: 4.8710,
      description: "Modern business district with high-rise buildings and paved plazas.",
      urbanIntensity: 5,
    },
    {
      name: "Bijlmer",
      lat: 52.3167,
      lng: 4.9500,
      description: "High-rise residential area with large concrete structures.",
      urbanIntensity: 3,
    },
    {
      name: "Westpoort Industrial",
      lat: 52.4167,
      lng: 4.7833,
      description: "Major port and industrial area with extensive hard surfaces.",
      urbanIntensity: 4,
    },
  ],
  copenhagen: [
    {
      name: "Indre By",
      lat: 55.6802,
      lng: 12.5710,
      description: "Historic city center with dense urban fabric.",
      urbanIntensity: 4,
    },
    {
      name: "Vesterbro",
      lat: 55.6697,
      lng: 12.5486,
      description: "Dense mixed-use neighborhood with limited green space.",
      urbanIntensity: 4,
    },
    {
      name: "Nordhavn",
      lat: 55.7167,
      lng: 12.6000,
      description: "New development area with modern buildings and waterfront.",
      urbanIntensity: 3,
    },
  ],
  singapore: [
    {
      name: "CBD Marina Bay",
      lat: 1.2789,
      lng: 103.8536,
      description: "Central business district with skyscrapers and reclaimed land.",
      urbanIntensity: 5,
    },
    {
      name: "Jurong Industrial",
      lat: 1.3329,
      lng: 103.7436,
      description: "Major industrial estate with factories and logistics facilities.",
      urbanIntensity: 5,
    },
    {
      name: "Orchard Road",
      lat: 1.3048,
      lng: 103.8318,
      description: "Shopping district with high pedestrian activity and building density.",
      urbanIntensity: 4,
    },
    {
      name: "Tuas Industrial",
      lat: 1.3167,
      lng: 103.6333,
      description: "Heavy industrial zone with refineries and manufacturing.",
      urbanIntensity: 5,
    },
  ],
  melbourne: [
    {
      name: "CBD Hoddle Grid",
      lat: -37.8136,
      lng: 144.9631,
      description: "Central business district with high-rise buildings and urban canyon effect.",
      urbanIntensity: 5,
    },
    {
      name: "Docklands",
      lat: -37.8167,
      lng: 144.9333,
      description: "Waterfront development with modern towers and large public spaces.",
      urbanIntensity: 4,
    },
    {
      name: "Western Industrial",
      lat: -37.7833,
      lng: 144.8833,
      description: "Industrial suburbs with warehouses and distribution centers.",
      urbanIntensity: 4,
    },
    {
      name: "Footscray",
      lat: -37.8000,
      lng: 144.9000,
      description: "Dense inner suburb with mixed commercial and residential use.",
      urbanIntensity: 3,
    },
  ],
};

// Open-Meteo API response types
interface OpenMeteoForecast {
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    surface_temperature: number[];
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

/**
 * Calculate heat anomaly severity
 */
function calculateHeatSeverity(
  anomaly: number
): "low" | "medium" | "high" | "critical" {
  if (anomaly < HEAT_ANOMALY_THRESHOLDS.low) return "low";
  if (anomaly < HEAT_ANOMALY_THRESHOLDS.medium) return "medium";
  if (anomaly < HEAT_ANOMALY_THRESHOLDS.high) return "high";
  return "critical";
}

/**
 * Get current month's climate normal for a city
 */
function getClimateNormal(citySlug: string): number {
  const normals = CITY_CLIMATE_NORMALS[citySlug];
  if (!normals) return 15; // Default fallback

  const currentMonth = new Date().getMonth(); // 0-11
  return normals.monthlyAvg[currentMonth];
}

/**
 * Helper to delay execution
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Store urban heat measurement data
 */
export const storeHeatData = internalMutation({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    zoneName: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    currentTemp: v.number(),
    surfaceTemp: v.number(),
    apparentTemp: v.number(),
    climateNormal: v.number(),
    anomaly: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const id = await ctx.db.insert("satelliteData", {
      cityId: args.cityId,
      moduleId: args.moduleId,
      coordinates: args.coordinates,
      dataSourceSlug: "open-meteo",
      satelliteId: `openmeteo-heat-${args.zoneName.toLowerCase().replace(/\s+/g, "-")}`,
      productType: "urban-heat",
      measurements: [
        { key: "temperature_2m", value: args.currentTemp, unit: "°C" },
        { key: "surface_temperature", value: args.surfaceTemp, unit: "°C" },
        { key: "apparent_temperature", value: args.apparentTemp, unit: "°C" },
        { key: "climate_normal", value: args.climateNormal, unit: "°C" },
        { key: "heat_anomaly", value: args.anomaly, unit: "°C" },
      ],
      processingLevel: "derived",
      measurementDate: now,
      ingestionDate: now,
      rawMetadata: {
        zoneName: args.zoneName,
        dataSource: "Open-Meteo",
      },
    });

    return id;
  },
});

/**
 * Create or update urban heat hotspot
 */
export const upsertHeatHotspot = internalMutation({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    zoneName: v.string(),
    description: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    currentTemp: v.number(),
    surfaceTemp: v.number(),
    apparentTemp: v.number(),
    anomaly: v.number(),
    urbanIntensity: v.number(),
  },
  handler: async (ctx, args) => {
    const severity = calculateHeatSeverity(args.anomaly);

    // Check for existing hotspot
    const existingHotspots = await ctx.db
      .query("hotspots")
      .withIndex("by_city_module", (q) =>
        q.eq("cityId", args.cityId).eq("moduleId", args.moduleId)
      )
      .collect();

    // Find by name or nearby coordinates
    const existingHotspot = existingHotspots.find((h) => {
      if (h.name === args.zoneName) return true;
      const latDiff = Math.abs(h.coordinates.lat - args.coordinates.lat);
      const lngDiff = Math.abs(h.coordinates.lng - args.coordinates.lng);
      return latDiff < 0.005 && lngDiff < 0.005;
    });

    const now = Date.now();

    // Calculate trend from previous value
    const previousAnomaly = existingHotspot?.metrics.find(
      (m) => m.key === "heat_anomaly"
    )?.value;

    const metrics = [
      {
        key: "heat_anomaly",
        value: args.anomaly,
        unit: "°C",
        trend:
          previousAnomaly !== undefined
            ? args.anomaly > previousAnomaly
              ? ("up" as const)
              : args.anomaly < previousAnomaly
                ? ("down" as const)
                : ("stable" as const)
            : undefined,
      },
      { key: "surface_temperature", value: args.surfaceTemp, unit: "°C" },
      { key: "air_temperature", value: args.currentTemp, unit: "°C" },
      { key: "apparent_temperature", value: args.apparentTemp, unit: "°C" },
      { key: "urban_intensity", value: args.urbanIntensity, unit: "/5" },
    ];

    const displayValue =
      args.anomaly >= 0
        ? `+${args.anomaly.toFixed(1)}°C`
        : `${args.anomaly.toFixed(1)}°C`;

    if (existingHotspot) {
      await ctx.db.patch(existingHotspot._id, {
        severity,
        metrics,
        displayValue,
        lastUpdated: now,
      });

      return { action: "updated" as const, hotspotId: existingHotspot._id };
    } else {
      const hotspotId = await ctx.db.insert("hotspots", {
        cityId: args.cityId,
        moduleId: args.moduleId,
        name: args.zoneName,
        description: args.description,
        coordinates: args.coordinates,
        severity,
        status: "active",
        metrics,
        displayValue,
        metadata: {
          dataSource: "Open-Meteo",
          urbanIntensity: args.urbanIntensity,
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
 * Fetch urban heat data for a specific city
 */
export const fetchUrbanHeatData = internalAction({
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

    // Get urban-heat module
    const urbanHeatModule = await ctx.runQuery(
      internal.modules.getBySlugInternal,
      { slug: "urban-heat" }
    );

    if (!urbanHeatModule) {
      throw new Error("Urban heat module not found. Please seed the database.");
    }

    // Get city config and heat zones
    const climateConfig = CITY_CLIMATE_NORMALS[args.citySlug];
    const heatZones = CITY_HEAT_ZONES[args.citySlug];

    if (!climateConfig || !heatZones) {
      throw new Error(`No urban heat config for city: ${args.citySlug}`);
    }

    // Create ingestion log
    const logId = await ctx.runMutation(
      internal.satelliteData.createIngestionLog,
      {
        dataSourceSlug: "open-meteo",
        cityId: city._id,
        moduleId: urbanHeatModule._id,
      }
    );

    await ctx.runMutation(internal.satelliteData.updateIngestionLog, {
      logId,
      status: "fetching",
    });

    try {
      let recordsStored = 0;
      let hotspotsCreated = 0;
      let hotspotsUpdated = 0;

      const climateNormal = getClimateNormal(args.citySlug);

      // Fetch temperature data for each heat zone
      for (let i = 0; i < heatZones.length; i++) {
        const zone = heatZones[i];

        // Rate limiting between requests
        if (i > 0) {
          await delay(500);
        }

        try {
          // Fetch current weather from Open-Meteo
          const url = new URL("https://api.open-meteo.com/v1/forecast");
          url.searchParams.set("latitude", String(zone.lat));
          url.searchParams.set("longitude", String(zone.lng));
          url.searchParams.set(
            "hourly",
            "temperature_2m,apparent_temperature,surface_temperature"
          );
          url.searchParams.set("forecast_days", "1");
          url.searchParams.set("timezone", "auto");

          const response = await fetch(url.toString());

          if (!response.ok) {
            console.error(
              `Failed to fetch weather for ${zone.name}: ${response.status}`
            );
            continue;
          }

          const data: OpenMeteoForecast = await response.json();

          // Get current hour's data
          const currentHour = new Date().getHours();
          const currentTemp = data.hourly.temperature_2m[currentHour];
          const surfaceTemp = data.hourly.surface_temperature[currentHour];
          const apparentTemp = data.hourly.apparent_temperature[currentHour];

          // Calculate heat anomaly
          // Urban heat island effect is amplified by urban intensity
          const baseAnomaly = currentTemp - climateNormal;
          const urbanAmplification = (zone.urbanIntensity - 1) * 0.5; // 0-2°C additional
          const anomaly = baseAnomaly + urbanAmplification;

          // Store raw data
          await ctx.runMutation(internal.urbanHeat.storeHeatData, {
            cityId: city._id,
            moduleId: urbanHeatModule._id,
            zoneName: zone.name,
            coordinates: { lat: zone.lat, lng: zone.lng },
            currentTemp,
            surfaceTemp,
            apparentTemp,
            climateNormal,
            anomaly,
          });

          recordsStored++;

          // Create/update hotspot
          const result = await ctx.runMutation(
            internal.urbanHeat.upsertHeatHotspot,
            {
              cityId: city._id,
              moduleId: urbanHeatModule._id,
              zoneName: zone.name,
              description: zone.description,
              coordinates: { lat: zone.lat, lng: zone.lng },
              currentTemp,
              surfaceTemp,
              apparentTemp,
              anomaly,
              urbanIntensity: zone.urbanIntensity,
            }
          );

          if (result.action === "created") {
            hotspotsCreated++;
          } else {
            hotspotsUpdated++;
          }
        } catch (zoneError) {
          console.error(`Error processing zone ${zone.name}:`, zoneError);
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
        zonesProcessed: heatZones.length,
        recordsStored,
        hotspotsCreated,
        hotspotsUpdated,
        climateNormal,
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
 * Fetch urban heat data for all configured cities
 */
export const fetchUrbanHeatAllCities = internalAction({
  args: {},
  handler: async (
    ctx
  ): Promise<Array<{ success: boolean; city: string; error?: string }>> => {
    const cities = await ctx.runQuery(internal.cities.listActive, {});

    const results: Array<{ success: boolean; city: string; error?: string }> =
      [];

    // Filter to cities with heat zone config
    const configuredCities = (cities as Array<{ slug: string }>).filter(
      (city) => CITY_HEAT_ZONES[city.slug]
    );

    for (let i = 0; i < configuredCities.length; i++) {
      const city = configuredCities[i];

      // Rate limiting: wait 1 second between cities
      if (i > 0) {
        console.log(
          `Rate limiting: waiting 1s before fetching ${city.slug}...`
        );
        await delay(1000);
      }

      try {
        const result = (await ctx.runAction(
          internal.urbanHeat.fetchUrbanHeatData,
          {
            citySlug: city.slug,
          }
        )) as { success: boolean; city: string; error?: string };
        results.push(result);
      } catch (error) {
        console.error(`Error fetching urban heat data for ${city.slug}:`, error);
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
 * Query latest urban heat data for a city
 */
export const getLatestByCity = query({
  args: {
    cityId: v.id("cities"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("satelliteData")
      .withIndex("by_city", (q) => q.eq("cityId", args.cityId))
      .filter((q) => q.eq(q.field("dataSourceSlug"), "open-meteo"))
      .order("desc")
      .take(20);
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

    await ctx.scheduler.runAfter(0, internal.urbanHeat.fetchUrbanHeatData, {
      citySlug: args.citySlug,
    });

    return {
      scheduled: true,
      message: `Urban heat fetch scheduled for ${args.citySlug}`,
    };
  },
});

export const triggerFetchAll = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    await ctx.scheduler.runAfter(0, internal.urbanHeat.fetchUrbanHeatAllCities, {});

    return {
      scheduled: true,
      message: "Urban heat fetch scheduled for all cities",
    };
  },
});
