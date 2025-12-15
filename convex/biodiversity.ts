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
// GBIF (Global Biodiversity Information Facility) Integration
// Free API for species occurrence data
// API Docs: https://www.gbif.org/developer/occurrence
// ============================================

// City configuration for biodiversity monitoring
const CITY_BIODIVERSITY_CONFIG: Record<
  string,
  {
    lat: number;
    lng: number;
    radius: number; // km
    greenSpaces: Array<{
      name: string;
      lat: number;
      lng: number;
      type: "park" | "reserve" | "corridor" | "wetland" | "coast";
      description: string;
    }>;
  }
> = {
  barcelona: {
    lat: 41.3874,
    lng: 2.1686,
    radius: 15,
    greenSpaces: [
      {
        name: "Parc de Collserola",
        lat: 41.4239,
        lng: 2.1086,
        type: "reserve",
        description: "Large natural park on the mountains behind Barcelona, vital wildlife corridor.",
      },
      {
        name: "Parc de la Ciutadella",
        lat: 41.3878,
        lng: 2.1873,
        type: "park",
        description: "Historic urban park with lake, home to diverse bird species.",
      },
      {
        name: "Montjuïc",
        lat: 41.3639,
        lng: 2.1586,
        type: "park",
        description: "Hill park with Mediterranean vegetation and botanical gardens.",
      },
      {
        name: "Delta del Llobregat",
        lat: 41.2964,
        lng: 2.0894,
        type: "wetland",
        description: "Important wetland for migratory birds near the airport.",
      },
    ],
  },
  amsterdam: {
    lat: 52.3676,
    lng: 4.9041,
    radius: 15,
    greenSpaces: [
      {
        name: "Vondelpark",
        lat: 52.3579,
        lng: 4.8686,
        type: "park",
        description: "Central urban park, important green corridor in the city.",
      },
      {
        name: "Amsterdamse Bos",
        lat: 52.3167,
        lng: 4.8333,
        type: "reserve",
        description: "Large forest park with lakes and diverse ecosystems.",
      },
      {
        name: "Waterland",
        lat: 52.4333,
        lng: 4.9833,
        type: "wetland",
        description: "Traditional polder landscape with rich bird life.",
      },
    ],
  },
  copenhagen: {
    lat: 55.6761,
    lng: 12.5683,
    radius: 15,
    greenSpaces: [
      {
        name: "Dyrehaven",
        lat: 55.7833,
        lng: 12.5667,
        type: "reserve",
        description: "Royal deer park with ancient oak trees and free-roaming deer.",
      },
      {
        name: "Amager Fælled",
        lat: 55.6500,
        lng: 12.6000,
        type: "reserve",
        description: "Urban nature area with grasslands and wetlands.",
      },
      {
        name: "Kalvebod Fælled",
        lat: 55.6167,
        lng: 12.5333,
        type: "wetland",
        description: "Large nature reserve with beaches and salt marshes.",
      },
    ],
  },
  singapore: {
    lat: 1.3521,
    lng: 103.8198,
    radius: 20,
    greenSpaces: [
      {
        name: "Bukit Timah Nature Reserve",
        lat: 1.3500,
        lng: 103.7783,
        type: "reserve",
        description: "Primary rainforest with exceptional biodiversity.",
      },
      {
        name: "Sungei Buloh Wetland Reserve",
        lat: 1.4472,
        lng: 103.7297,
        type: "wetland",
        description: "Important site for migratory birds on East Asian flyway.",
      },
      {
        name: "Singapore Botanic Gardens",
        lat: 1.3138,
        lng: 103.8159,
        type: "park",
        description: "UNESCO World Heritage site with rich plant diversity.",
      },
      {
        name: "Central Catchment Nature Reserve",
        lat: 1.3667,
        lng: 103.8167,
        type: "reserve",
        description: "Largest nature reserve with tropical rainforest.",
      },
    ],
  },
  melbourne: {
    lat: -37.8136,
    lng: 144.9631,
    radius: 20,
    greenSpaces: [
      {
        name: "Royal Botanic Gardens",
        lat: -37.8304,
        lng: 144.9796,
        type: "park",
        description: "Historic gardens with diverse native and exotic species.",
      },
      {
        name: "Yarra Bend Park",
        lat: -37.7833,
        lng: 145.0167,
        type: "corridor",
        description: "River corridor with native bushland and flying fox colony.",
      },
      {
        name: "Dandenong Ranges",
        lat: -37.8667,
        lng: 145.3500,
        type: "reserve",
        description: "Mountain ash forest with lyrebirds and native fauna.",
      },
      {
        name: "Port Phillip Bay",
        lat: -37.9000,
        lng: 144.9500,
        type: "coast",
        description: "Marine biodiversity hotspot with penguins and seals.",
      },
    ],
  },
};

// GBIF API response types
interface GBIFOccurrence {
  key: number;
  species: string;
  scientificName: string;
  vernacularName?: string;
  kingdom: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  decimalLatitude: number;
  decimalLongitude: number;
  eventDate?: string;
  year?: number;
  month?: number;
  individualCount?: number;
  iucnRedListCategory?: string;
  basisOfRecord: string;
}

interface GBIFSearchResponse {
  offset: number;
  limit: number;
  count: number;
  results: GBIFOccurrence[];
}

/**
 * Calculate biodiversity score based on species data
 */
function calculateBiodiversityScore(
  speciesCount: number,
  totalObservations: number,
  hasEndangered: boolean,
  hasMigratory: boolean
): number {
  // Base score from species richness (0-40 points)
  const richnessScore = Math.min(40, speciesCount * 2);

  // Abundance score (0-20 points)
  const abundanceScore = Math.min(20, Math.log10(totalObservations + 1) * 5);

  // Conservation importance (0-20 points)
  const conservationScore = (hasEndangered ? 15 : 0) + (hasMigratory ? 5 : 0);

  // Normalize to 1-10 scale
  const totalScore = richnessScore + abundanceScore + conservationScore;
  return Math.min(10, Math.max(1, Math.round(totalScore / 10)));
}

/**
 * Determine severity based on biodiversity score
 */
function calculateBiodiversitySeverity(
  score: number
): "low" | "medium" | "high" | "critical" {
  // Higher score = better biodiversity = lower severity
  if (score >= 7) return "low"; // Good biodiversity
  if (score >= 5) return "medium"; // Moderate
  if (score >= 3) return "high"; // Poor
  return "critical"; // Very poor biodiversity
}

/**
 * Helper to delay execution
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Store biodiversity data
 */
export const storeBiodiversityData = internalMutation({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    greenSpaceName: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    speciesCount: v.number(),
    totalObservations: v.number(),
    taxonomicGroups: v.object({
      birds: v.number(),
      mammals: v.number(),
      plants: v.number(),
      insects: v.number(),
      other: v.number(),
    }),
    notableSpecies: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const id = await ctx.db.insert("satelliteData", {
      cityId: args.cityId,
      moduleId: args.moduleId,
      coordinates: args.coordinates,
      dataSourceSlug: "gbif",
      satelliteId: `gbif-${args.greenSpaceName.toLowerCase().replace(/\s+/g, "-")}`,
      productType: "biodiversity",
      measurements: [
        { key: "species_count", value: args.speciesCount, unit: "species" },
        { key: "total_observations", value: args.totalObservations, unit: "records" },
        { key: "birds", value: args.taxonomicGroups.birds, unit: "species" },
        { key: "mammals", value: args.taxonomicGroups.mammals, unit: "species" },
        { key: "plants", value: args.taxonomicGroups.plants, unit: "species" },
        { key: "insects", value: args.taxonomicGroups.insects, unit: "species" },
      ],
      processingLevel: "aggregated",
      measurementDate: now,
      ingestionDate: now,
      rawMetadata: {
        greenSpaceName: args.greenSpaceName,
        notableSpecies: args.notableSpecies,
        dataSource: "GBIF",
      },
    });

    return id;
  },
});

/**
 * Create or update biodiversity hotspot
 */
export const upsertBiodiversityHotspot = internalMutation({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    greenSpaceName: v.string(),
    greenSpaceType: v.string(),
    description: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    speciesCount: v.number(),
    totalObservations: v.number(),
    biodiversityScore: v.number(),
    taxonomicGroups: v.object({
      birds: v.number(),
      mammals: v.number(),
      plants: v.number(),
      insects: v.number(),
      other: v.number(),
    }),
    notableSpecies: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const severity = calculateBiodiversitySeverity(args.biodiversityScore);

    // Check for existing hotspot
    const existingHotspots = await ctx.db
      .query("hotspots")
      .withIndex("by_city_module", (q) =>
        q.eq("cityId", args.cityId).eq("moduleId", args.moduleId)
      )
      .collect();

    const existingHotspot = existingHotspots.find(
      (h) => h.name === args.greenSpaceName
    );

    const now = Date.now();

    const metrics = [
      {
        key: "biodiversity_score",
        value: args.biodiversityScore,
        unit: "/10",
        trend: existingHotspot?.metrics.find((m) => m.key === "biodiversity_score")
          ? args.biodiversityScore >
            (existingHotspot.metrics.find((m) => m.key === "biodiversity_score")
              ?.value ?? 0)
            ? ("up" as const)
            : args.biodiversityScore <
                (existingHotspot.metrics.find((m) => m.key === "biodiversity_score")
                  ?.value ?? 0)
              ? ("down" as const)
              : ("stable" as const)
          : undefined,
      },
      { key: "species_count", value: args.speciesCount, unit: "species" },
      { key: "observations", value: args.totalObservations, unit: "records" },
      { key: "bird_species", value: args.taxonomicGroups.birds, unit: "species" },
      { key: "mammal_species", value: args.taxonomicGroups.mammals, unit: "species" },
    ];

    const displayValue = `${args.biodiversityScore}/10`;

    if (existingHotspot) {
      await ctx.db.patch(existingHotspot._id, {
        severity,
        metrics,
        displayValue,
        lastUpdated: now,
        description: `${args.description} Notable species: ${args.notableSpecies.slice(0, 3).join(", ")}.`,
      });

      return { action: "updated" as const, hotspotId: existingHotspot._id };
    } else {
      const hotspotId = await ctx.db.insert("hotspots", {
        cityId: args.cityId,
        moduleId: args.moduleId,
        name: args.greenSpaceName,
        description: `${args.description} Notable species: ${args.notableSpecies.slice(0, 3).join(", ")}.`,
        coordinates: args.coordinates,
        severity,
        status: "active",
        metrics,
        displayValue,
        metadata: {
          greenSpaceType: args.greenSpaceType,
          notableSpecies: args.notableSpecies,
          dataSource: "GBIF",
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
 * Fetch biodiversity data from GBIF for a specific city
 */
export const fetchBiodiversityData = internalAction({
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
    const config = CITY_BIODIVERSITY_CONFIG[args.citySlug];
    if (!config) {
      throw new Error(`No biodiversity config for city: ${args.citySlug}`);
    }

    // Get biodiversity module
    const biodiversityModule = await ctx.runQuery(
      internal.modules.getBySlugInternal,
      { slug: "biodiversity" }
    );

    if (!biodiversityModule) {
      throw new Error("Biodiversity module not found. Please seed the database.");
    }

    // Create ingestion log
    const logId = await ctx.runMutation(
      internal.satelliteData.createIngestionLog,
      {
        dataSourceSlug: "gbif",
        cityId: city._id,
        moduleId: biodiversityModule._id,
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

      // Fetch data for each green space
      for (let i = 0; i < config.greenSpaces.length; i++) {
        const greenSpace = config.greenSpaces[i];

        // Rate limiting
        if (i > 0) {
          await delay(1000);
        }

        try {
          // Query GBIF for occurrences near this green space
          const url = new URL("https://api.gbif.org/v1/occurrence/search");
          url.searchParams.set("decimalLatitude", String(greenSpace.lat));
          url.searchParams.set("decimalLongitude", String(greenSpace.lng));
          url.searchParams.set("radius", "5km");
          url.searchParams.set("limit", "300");
          url.searchParams.set("hasCoordinate", "true");
          url.searchParams.set("hasGeospatialIssue", "false");
          // Get recent records from last 2 years
          url.searchParams.set("year", `${new Date().getFullYear() - 2},${new Date().getFullYear()}`);

          const response = await fetch(url.toString());

          if (!response.ok) {
            console.error(
              `Failed to fetch GBIF data for ${greenSpace.name}: ${response.status}`
            );
            continue;
          }

          const data: GBIFSearchResponse = await response.json();

          // Process occurrences
          const speciesSet = new Set<string>();
          const taxonomicCounts = {
            birds: new Set<string>(),
            mammals: new Set<string>(),
            plants: new Set<string>(),
            insects: new Set<string>(),
            other: new Set<string>(),
          };
          const notableSpecies: string[] = [];
          let hasEndangered = false;
          let hasMigratory = false;

          for (const occurrence of data.results) {
            const speciesName = occurrence.species || occurrence.scientificName;
            if (!speciesName) continue;

            speciesSet.add(speciesName);

            // Categorize by taxonomic class
            const taxClass = occurrence.class?.toLowerCase() || "";
            if (taxClass === "aves") {
              taxonomicCounts.birds.add(speciesName);
              hasMigratory = true; // Assume birds can be migratory
            } else if (taxClass === "mammalia") {
              taxonomicCounts.mammals.add(speciesName);
            } else if (occurrence.kingdom === "Plantae") {
              taxonomicCounts.plants.add(speciesName);
            } else if (taxClass === "insecta") {
              taxonomicCounts.insects.add(speciesName);
            } else {
              taxonomicCounts.other.add(speciesName);
            }

            // Check for endangered species
            if (
              occurrence.iucnRedListCategory &&
              ["CR", "EN", "VU"].includes(occurrence.iucnRedListCategory)
            ) {
              hasEndangered = true;
              const name = occurrence.vernacularName || occurrence.species;
              if (name && !notableSpecies.includes(name)) {
                notableSpecies.push(name);
              }
            }

            // Collect notable species (with vernacular names)
            if (
              occurrence.vernacularName &&
              notableSpecies.length < 10 &&
              !notableSpecies.includes(occurrence.vernacularName)
            ) {
              notableSpecies.push(occurrence.vernacularName);
            }
          }

          const speciesCount = speciesSet.size;
          const totalObservations = data.count;

          const taxonomicGroups = {
            birds: taxonomicCounts.birds.size,
            mammals: taxonomicCounts.mammals.size,
            plants: taxonomicCounts.plants.size,
            insects: taxonomicCounts.insects.size,
            other: taxonomicCounts.other.size,
          };

          const biodiversityScore = calculateBiodiversityScore(
            speciesCount,
            totalObservations,
            hasEndangered,
            hasMigratory
          );

          // Store raw data
          await ctx.runMutation(internal.biodiversity.storeBiodiversityData, {
            cityId: city._id,
            moduleId: biodiversityModule._id,
            greenSpaceName: greenSpace.name,
            coordinates: { lat: greenSpace.lat, lng: greenSpace.lng },
            speciesCount,
            totalObservations,
            taxonomicGroups,
            notableSpecies,
          });

          recordsStored++;

          // Create/update hotspot
          const result = await ctx.runMutation(
            internal.biodiversity.upsertBiodiversityHotspot,
            {
              cityId: city._id,
              moduleId: biodiversityModule._id,
              greenSpaceName: greenSpace.name,
              greenSpaceType: greenSpace.type,
              description: greenSpace.description,
              coordinates: { lat: greenSpace.lat, lng: greenSpace.lng },
              speciesCount,
              totalObservations,
              biodiversityScore,
              taxonomicGroups,
              notableSpecies,
            }
          );

          if (result.action === "created") {
            hotspotsCreated++;
          } else {
            hotspotsUpdated++;
          }
        } catch (greenSpaceError) {
          console.error(
            `Error processing green space ${greenSpace.name}:`,
            greenSpaceError
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
        greenSpacesProcessed: config.greenSpaces.length,
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
 * Fetch biodiversity data for all configured cities
 */
export const fetchBiodiversityAllCities = internalAction({
  args: {},
  handler: async (
    ctx
  ): Promise<Array<{ success: boolean; city: string; error?: string }>> => {
    const cities = await ctx.runQuery(internal.cities.listActive, {});

    const results: Array<{ success: boolean; city: string; error?: string }> =
      [];

    const configuredCities = (cities as Array<{ slug: string }>).filter(
      (city) => CITY_BIODIVERSITY_CONFIG[city.slug]
    );

    for (let i = 0; i < configuredCities.length; i++) {
      const city = configuredCities[i];

      // Rate limiting: wait 2 seconds between cities
      if (i > 0) {
        console.log(
          `Rate limiting: waiting 2s before fetching ${city.slug}...`
        );
        await delay(2000);
      }

      try {
        const result = (await ctx.runAction(
          internal.biodiversity.fetchBiodiversityData,
          {
            citySlug: city.slug,
          }
        )) as { success: boolean; city: string; error?: string };
        results.push(result);
      } catch (error) {
        console.error(
          `Error fetching biodiversity data for ${city.slug}:`,
          error
        );
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
 * Query latest biodiversity data for a city
 */
export const getLatestByCity = query({
  args: {
    cityId: v.id("cities"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("satelliteData")
      .withIndex("by_city", (q) => q.eq("cityId", args.cityId))
      .filter((q) => q.eq(q.field("dataSourceSlug"), "gbif"))
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

    await ctx.scheduler.runAfter(0, internal.biodiversity.fetchBiodiversityData, {
      citySlug: args.citySlug,
    });

    return {
      scheduled: true,
      message: `Biodiversity fetch scheduled for ${args.citySlug}`,
    };
  },
});

export const triggerFetchAll = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    await ctx.scheduler.runAfter(
      0,
      internal.biodiversity.fetchBiodiversityAllCities,
      {}
    );

    return {
      scheduled: true,
      message: "Biodiversity fetch scheduled for all cities",
    };
  },
});
