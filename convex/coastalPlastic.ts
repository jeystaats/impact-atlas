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
// Coastal Plastic Integration using Open-Meteo Marine API
// Models plastic accumulation based on ocean currents and waves
// API Docs: https://open-meteo.com/en/docs/marine-weather-api
// ============================================

// Coastal zones configuration
const COASTAL_ZONES: Record<
  string,
  {
    zones: Array<{
      name: string;
      lat: number;
      lng: number;
      type: "beach" | "port" | "estuary" | "marina" | "coast";
      description: string;
      baseAccumulationRate: number; // kg/week baseline based on historical data
    }>;
  }
> = {
  barcelona: {
    zones: [
      {
        name: "Barceloneta Beach",
        lat: 41.3783,
        lng: 2.1925,
        type: "beach",
        description: "Popular urban beach with high foot traffic and tourism pressure.",
        baseAccumulationRate: 45,
      },
      {
        name: "Port of Barcelona",
        lat: 41.3553,
        lng: 2.1686,
        type: "port",
        description: "Major cruise and cargo port, significant marine traffic.",
        baseAccumulationRate: 120,
      },
      {
        name: "Bogatell Beach",
        lat: 41.3936,
        lng: 2.2056,
        type: "beach",
        description: "Olympic beach with moderate tourism and water sports.",
        baseAccumulationRate: 35,
      },
      {
        name: "Besòs River Mouth",
        lat: 41.4175,
        lng: 2.2314,
        type: "estuary",
        description: "River mouth collecting upstream urban runoff and debris.",
        baseAccumulationRate: 85,
      },
    ],
  },
  amsterdam: {
    zones: [
      {
        name: "IJmuiden Coast",
        lat: 52.4567,
        lng: 4.6142,
        type: "coast",
        description: "North Sea coast near canal entrance, exposed to ocean debris.",
        baseAccumulationRate: 55,
      },
      {
        name: "Port of Amsterdam",
        lat: 52.4167,
        lng: 4.7833,
        type: "port",
        description: "Major inland port with connection to North Sea.",
        baseAccumulationRate: 90,
      },
      {
        name: "Zandvoort Beach",
        lat: 52.3753,
        lng: 4.5339,
        type: "beach",
        description: "Popular beach resort, receives North Sea debris.",
        baseAccumulationRate: 40,
      },
    ],
  },
  copenhagen: {
    zones: [
      {
        name: "Amager Strandpark",
        lat: 55.6533,
        lng: 12.6500,
        type: "beach",
        description: "Urban beach park on artificial island.",
        baseAccumulationRate: 25,
      },
      {
        name: "Copenhagen Harbor",
        lat: 55.6867,
        lng: 12.5997,
        type: "port",
        description: "Historic harbor with cruise terminal and marinas.",
        baseAccumulationRate: 65,
      },
      {
        name: "Øresund Coast",
        lat: 55.7000,
        lng: 12.6333,
        type: "coast",
        description: "Strait coast connecting Baltic Sea to North Sea.",
        baseAccumulationRate: 35,
      },
    ],
  },
  singapore: {
    zones: [
      {
        name: "East Coast Park",
        lat: 1.3008,
        lng: 103.9122,
        type: "beach",
        description: "Popular recreational beach along shipping lanes.",
        baseAccumulationRate: 70,
      },
      {
        name: "Port of Singapore",
        lat: 1.2644,
        lng: 103.8203,
        type: "port",
        description: "World's busiest transshipment port, major marine traffic.",
        baseAccumulationRate: 200,
      },
      {
        name: "Sentosa Beach",
        lat: 1.2494,
        lng: 103.8303,
        type: "beach",
        description: "Resort island beaches, managed but exposed to currents.",
        baseAccumulationRate: 45,
      },
      {
        name: "Straits of Singapore",
        lat: 1.2167,
        lng: 103.8500,
        type: "coast",
        description: "Major shipping strait, high debris potential.",
        baseAccumulationRate: 150,
      },
    ],
  },
  melbourne: {
    zones: [
      {
        name: "St Kilda Beach",
        lat: -37.8678,
        lng: 144.9739,
        type: "beach",
        description: "Popular urban beach on Port Phillip Bay.",
        baseAccumulationRate: 35,
      },
      {
        name: "Port of Melbourne",
        lat: -37.8333,
        lng: 144.9167,
        type: "port",
        description: "Australia's busiest container port.",
        baseAccumulationRate: 95,
      },
      {
        name: "Yarra River Mouth",
        lat: -37.8500,
        lng: 144.9333,
        type: "estuary",
        description: "River mouth collecting urban runoff from greater Melbourne.",
        baseAccumulationRate: 75,
      },
      {
        name: "Brighton Beach",
        lat: -37.9167,
        lng: 145.0000,
        type: "beach",
        description: "Suburban beach with iconic bathing boxes.",
        baseAccumulationRate: 25,
      },
    ],
  },
};

// Plastic accumulation risk factors based on ocean conditions
function calculatePlasticRisk(
  waveHeight: number,
  waveDirection: number,
  currentVelocity: number,
  currentDirection: number,
  zoneType: string,
  baseRate: number
): { accumulationRate: number; severity: "low" | "medium" | "high" | "critical" } {
  // Base risk from zone type
  let riskMultiplier = 1.0;

  // Wave height factor - higher waves bring more debris
  if (waveHeight > 2) riskMultiplier *= 1.5;
  else if (waveHeight > 1) riskMultiplier *= 1.2;
  else if (waveHeight < 0.5) riskMultiplier *= 0.8;

  // Current velocity factor - faster currents transport more debris
  if (currentVelocity > 1) riskMultiplier *= 1.4;
  else if (currentVelocity > 0.5) riskMultiplier *= 1.2;
  else if (currentVelocity < 0.2) riskMultiplier *= 0.9;

  // Zone type multiplier
  switch (zoneType) {
    case "port":
      riskMultiplier *= 1.3;
      break;
    case "estuary":
      riskMultiplier *= 1.4;
      break;
    case "beach":
      riskMultiplier *= 1.0;
      break;
    case "marina":
      riskMultiplier *= 1.1;
      break;
    case "coast":
      riskMultiplier *= 0.9;
      break;
  }

  const accumulationRate = Math.round(baseRate * riskMultiplier);

  // Determine severity
  let severity: "low" | "medium" | "high" | "critical";
  if (accumulationRate < 30) severity = "low";
  else if (accumulationRate < 60) severity = "medium";
  else if (accumulationRate < 100) severity = "high";
  else severity = "critical";

  return { accumulationRate, severity };
}

/**
 * Helper to delay execution
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Open-Meteo Marine API response type
interface MarineWeatherResponse {
  hourly: {
    time: string[];
    wave_height: number[];
    wave_direction: number[];
    wave_period: number[];
    ocean_current_velocity: number[];
    ocean_current_direction: number[];
  };
}

/**
 * Store coastal plastic data
 */
export const storeCoastalData = internalMutation({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    zoneName: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    waveHeight: v.number(),
    waveDirection: v.number(),
    wavePeriod: v.number(),
    currentVelocity: v.number(),
    currentDirection: v.number(),
    accumulationRate: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const id = await ctx.db.insert("satelliteData", {
      cityId: args.cityId,
      moduleId: args.moduleId,
      coordinates: args.coordinates,
      dataSourceSlug: "open-meteo-marine",
      satelliteId: `marine-${args.zoneName.toLowerCase().replace(/\s+/g, "-")}`,
      productType: "coastal-plastic",
      measurements: [
        { key: "wave_height", value: args.waveHeight, unit: "m" },
        { key: "wave_direction", value: args.waveDirection, unit: "°" },
        { key: "wave_period", value: args.wavePeriod, unit: "s" },
        { key: "current_velocity", value: args.currentVelocity, unit: "km/h" },
        { key: "current_direction", value: args.currentDirection, unit: "°" },
        { key: "accumulation_rate", value: args.accumulationRate, unit: "kg/week" },
      ],
      processingLevel: "modeled",
      measurementDate: now,
      ingestionDate: now,
      rawMetadata: {
        zoneName: args.zoneName,
        dataSource: "Open-Meteo Marine",
      },
    });

    return id;
  },
});

/**
 * Create or update coastal plastic hotspot
 */
export const upsertCoastalHotspot = internalMutation({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    zoneName: v.string(),
    zoneType: v.string(),
    description: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    waveHeight: v.number(),
    currentVelocity: v.number(),
    accumulationRate: v.number(),
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
  },
  handler: async (ctx, args) => {
    // Check for existing hotspot
    const existingHotspots = await ctx.db
      .query("hotspots")
      .withIndex("by_city_module", (q) =>
        q.eq("cityId", args.cityId).eq("moduleId", args.moduleId)
      )
      .collect();

    const existingHotspot = existingHotspots.find(
      (h) => h.name === args.zoneName
    );

    const now = Date.now();

    // Calculate trend
    const previousRate = existingHotspot?.metrics.find(
      (m) => m.key === "accumulation_rate"
    )?.value;

    const metrics = [
      {
        key: "accumulation_rate",
        value: args.accumulationRate,
        unit: "kg/week",
        trend:
          previousRate !== undefined
            ? args.accumulationRate > previousRate
              ? ("up" as const)
              : args.accumulationRate < previousRate
                ? ("down" as const)
                : ("stable" as const)
            : undefined,
      },
      { key: "wave_height", value: args.waveHeight, unit: "m" },
      { key: "current_velocity", value: args.currentVelocity, unit: "km/h" },
    ];

    const displayValue = `${args.accumulationRate} kg/week`;

    if (existingHotspot) {
      await ctx.db.patch(existingHotspot._id, {
        severity: args.severity,
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
        severity: args.severity,
        status: "active",
        metrics,
        displayValue,
        metadata: {
          zoneType: args.zoneType,
          dataSource: "Open-Meteo Marine",
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
 * Fetch coastal plastic data for a specific city
 */
export const fetchCoastalData = internalAction({
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
    const config = COASTAL_ZONES[args.citySlug];
    if (!config) {
      throw new Error(`No coastal config for city: ${args.citySlug}`);
    }

    // Get coastal-plastic module
    const coastalModule = await ctx.runQuery(
      internal.modules.getBySlugInternal,
      { slug: "coastal-plastic" }
    );

    if (!coastalModule) {
      throw new Error(
        "Coastal plastic module not found. Please seed the database."
      );
    }

    // Create ingestion log
    const logId = await ctx.runMutation(
      internal.satelliteData.createIngestionLog,
      {
        dataSourceSlug: "open-meteo-marine",
        cityId: city._id,
        moduleId: coastalModule._id,
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

      // Fetch data for each coastal zone
      for (let i = 0; i < config.zones.length; i++) {
        const zone = config.zones[i];

        // Rate limiting
        if (i > 0) {
          await delay(500);
        }

        try {
          // Fetch marine weather from Open-Meteo
          const url = new URL("https://marine-api.open-meteo.com/v1/marine");
          url.searchParams.set("latitude", String(zone.lat));
          url.searchParams.set("longitude", String(zone.lng));
          url.searchParams.set(
            "hourly",
            "wave_height,wave_direction,wave_period,ocean_current_velocity,ocean_current_direction"
          );
          url.searchParams.set("forecast_days", "1");

          const response = await fetch(url.toString());

          if (!response.ok) {
            console.error(
              `Failed to fetch marine data for ${zone.name}: ${response.status}`
            );
            continue;
          }

          const data: MarineWeatherResponse = await response.json();

          // Get current hour's data
          const currentHour = new Date().getUTCHours();
          const waveHeight = data.hourly.wave_height[currentHour] ?? 0;
          const waveDirection = data.hourly.wave_direction[currentHour] ?? 0;
          const wavePeriod = data.hourly.wave_period[currentHour] ?? 0;
          const currentVelocity =
            data.hourly.ocean_current_velocity[currentHour] ?? 0;
          const currentDirection =
            data.hourly.ocean_current_direction[currentHour] ?? 0;

          // Calculate plastic accumulation risk
          const { accumulationRate, severity } = calculatePlasticRisk(
            waveHeight,
            waveDirection,
            currentVelocity,
            currentDirection,
            zone.type,
            zone.baseAccumulationRate
          );

          // Store raw data
          await ctx.runMutation(internal.coastalPlastic.storeCoastalData, {
            cityId: city._id,
            moduleId: coastalModule._id,
            zoneName: zone.name,
            coordinates: { lat: zone.lat, lng: zone.lng },
            waveHeight,
            waveDirection,
            wavePeriod,
            currentVelocity,
            currentDirection,
            accumulationRate,
          });

          recordsStored++;

          // Create/update hotspot
          const result = await ctx.runMutation(
            internal.coastalPlastic.upsertCoastalHotspot,
            {
              cityId: city._id,
              moduleId: coastalModule._id,
              zoneName: zone.name,
              zoneType: zone.type,
              description: zone.description,
              coordinates: { lat: zone.lat, lng: zone.lng },
              waveHeight,
              currentVelocity,
              accumulationRate,
              severity,
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
        zonesProcessed: config.zones.length,
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
 * Fetch coastal data for all configured cities
 */
export const fetchCoastalAllCities = internalAction({
  args: {},
  handler: async (
    ctx
  ): Promise<Array<{ success: boolean; city: string; error?: string }>> => {
    const cities = await ctx.runQuery(internal.cities.listActive, {});

    const results: Array<{ success: boolean; city: string; error?: string }> =
      [];

    const configuredCities = (cities as Array<{ slug: string }>).filter(
      (city) => COASTAL_ZONES[city.slug]
    );

    for (let i = 0; i < configuredCities.length; i++) {
      const city = configuredCities[i];

      // Rate limiting
      if (i > 0) {
        console.log(
          `Rate limiting: waiting 1s before fetching ${city.slug}...`
        );
        await delay(1000);
      }

      try {
        const result = (await ctx.runAction(
          internal.coastalPlastic.fetchCoastalData,
          {
            citySlug: city.slug,
          }
        )) as { success: boolean; city: string; error?: string };
        results.push(result);
      } catch (error) {
        console.error(`Error fetching coastal data for ${city.slug}:`, error);
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
 * Query latest coastal data for a city
 */
export const getLatestByCity = query({
  args: {
    cityId: v.id("cities"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("satelliteData")
      .withIndex("by_city", (q) => q.eq("cityId", args.cityId))
      .filter((q) => q.eq(q.field("dataSourceSlug"), "open-meteo-marine"))
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

    await ctx.scheduler.runAfter(0, internal.coastalPlastic.fetchCoastalData, {
      citySlug: args.citySlug,
    });

    return {
      scheduled: true,
      message: `Coastal plastic fetch scheduled for ${args.citySlug}`,
    };
  },
});

export const triggerFetchAll = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    await ctx.scheduler.runAfter(
      0,
      internal.coastalPlastic.fetchCoastalAllCities,
      {}
    );

    return {
      scheduled: true,
      message: "Coastal plastic fetch scheduled for all cities",
    };
  },
});
