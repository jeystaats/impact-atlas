import { internalMutation, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { citiesSeedData } from "./seed/cities";
import { modulesSeedData } from "./seed/modules";
import { quickWinsSeedData } from "./seed/quickWins";
import { barcelonaHotspots, barcelonaQuickWins } from "./seed/barcelonaData";

/**
 * Seed cities into the database
 */
export const seedCities = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const cityIds: Record<string, string> = {};

    for (const city of citiesSeedData) {
      // Check if city already exists
      const existing = await ctx.db
        .query("cities")
        .withIndex("by_slug", (q) => q.eq("slug", city.slug))
        .unique();

      if (existing) {
        cityIds[city.slug] = existing._id;
        console.log(`City ${city.name} already exists, skipping...`);
        continue;
      }

      const cityId = await ctx.db.insert("cities", {
        ...city,
        stats: {
          totalHotspots: 0,
          totalQuickWins: 0,
          activeModules: 6,
          completedQuickWins: 0,
          activeActionPlans: 0,
        },
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      cityIds[city.slug] = cityId;
      console.log(`Seeded city: ${city.name}`);
    }

    return cityIds;
  },
});

/**
 * Seed modules into the database
 */
export const seedModules = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const moduleIds: Record<string, string> = {};

    for (const module of modulesSeedData) {
      // Check if module already exists
      const existing = await ctx.db
        .query("modules")
        .withIndex("by_slug", (q) => q.eq("slug", module.slug))
        .unique();

      if (existing) {
        moduleIds[module.slug] = existing._id;
        console.log(`Module ${module.name} already exists, skipping...`);
        continue;
      }

      const moduleId = await ctx.db.insert("modules", {
        ...module,
        isActive: module.status === "active",
        createdAt: now,
        updatedAt: now,
      });

      moduleIds[module.slug] = moduleId;
      console.log(`Seeded module: ${module.name}`);
    }

    return moduleIds;
  },
});

/**
 * Seed quick wins into the database
 * Must be run after seedModules
 */
export const seedQuickWins = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all modules to map slugs to IDs
    const modules = await ctx.db.query("modules").collect();
    const moduleSlugToId: Record<string, string> = {};
    for (const module of modules) {
      moduleSlugToId[module.slug] = module._id;
    }

    let seededCount = 0;
    let skippedCount = 0;

    for (const quickWin of quickWinsSeedData) {
      const moduleId = moduleSlugToId[quickWin.moduleSlug];
      if (!moduleId) {
        console.error(`Module not found for slug: ${quickWin.moduleSlug}`);
        continue;
      }

      // Check if quick win with same title already exists for this module
      const existing = await ctx.db
        .query("quickWins")
        .withIndex("by_module", (q) => q.eq("moduleId", moduleId as any))
        .filter((q) => q.eq(q.field("title"), quickWin.title))
        .first();

      if (existing) {
        skippedCount++;
        continue;
      }

      const { moduleSlug, ...quickWinData } = quickWin;

      await ctx.db.insert("quickWins", {
        ...quickWinData,
        moduleId: moduleId as any,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      seededCount++;
    }

    console.log(`Seeded ${seededCount} quick wins, skipped ${skippedCount}`);
    return { seeded: seededCount, skipped: skippedCount };
  },
});

/**
 * Seed sample hotspots for a city
 */
export const seedHotspots = internalMutation({
  args: {
    citySlug: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get city
    const city = await ctx.db
      .query("cities")
      .withIndex("by_slug", (q) => q.eq("slug", args.citySlug))
      .unique();

    if (!city) {
      throw new Error(`City not found: ${args.citySlug}`);
    }

    // Get modules
    const modules = await ctx.db.query("modules").collect();
    const moduleSlugToId: Record<string, string> = {};
    for (const module of modules) {
      moduleSlugToId[module.slug] = module._id;
    }

    // Sample hotspots for urban-heat module
    const urbanHeatHotspots = [
      {
        name: "Industrial District Heat Island",
        description: "Large industrial area with minimal vegetation showing temperatures 6°C above average",
        severity: "critical" as const,
        displayValue: "+6.2°C",
        offset: { lat: 0.01, lng: 0.02 },
      },
      {
        name: "Commercial Center Hotspot",
        description: "Dense commercial area with extensive pavement and low tree coverage",
        severity: "high" as const,
        displayValue: "+4.8°C",
        offset: { lat: -0.008, lng: 0.015 },
      },
      {
        name: "Parking Structure Zone",
        description: "Multi-level parking facilities creating localized heat accumulation",
        severity: "medium" as const,
        displayValue: "+3.2°C",
        offset: { lat: 0.005, lng: -0.01 },
      },
    ];

    const moduleId = moduleSlugToId["urban-heat"];
    if (!moduleId) {
      console.log("Urban heat module not found, skipping hotspots");
      return { seeded: 0 };
    }

    let seededCount = 0;
    for (const hotspot of urbanHeatHotspots) {
      // Check if similar hotspot exists
      const existing = await ctx.db
        .query("hotspots")
        .withIndex("by_city_module", (q) =>
          q.eq("cityId", city._id).eq("moduleId", moduleId as any)
        )
        .filter((q) => q.eq(q.field("name"), hotspot.name))
        .first();

      if (existing) {
        continue;
      }

      await ctx.db.insert("hotspots", {
        cityId: city._id,
        moduleId: moduleId as any,
        name: hotspot.name,
        description: hotspot.description,
        coordinates: {
          lat: city.coordinates.lat + hotspot.offset.lat,
          lng: city.coordinates.lng + hotspot.offset.lng,
        },
        severity: hotspot.severity,
        status: "active",
        metrics: [
          { key: "tempDiff", value: parseFloat(hotspot.displayValue), unit: "°C" },
        ],
        displayValue: hotspot.displayValue,
        detectedAt: now - 7 * 24 * 60 * 60 * 1000, // 7 days ago
        lastUpdated: now,
        createdAt: now,
      });

      seededCount++;
    }

    console.log(`Seeded ${seededCount} hotspots for ${city.name}`);
    return { seeded: seededCount };
  },
});

/**
 * Update city stats after seeding
 */
export const updateCityStats = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cities = await ctx.db.query("cities").collect();

    for (const city of cities) {
      // Count hotspots
      const hotspots = await ctx.db
        .query("hotspots")
        .withIndex("by_city", (q) => q.eq("cityId", city._id))
        .collect();

      // Count quick wins (city-agnostic ones apply to all cities)
      const quickWins = await ctx.db
        .query("quickWins")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .collect();

      // Count active modules
      const activeModules = await ctx.db
        .query("modules")
        .withIndex("by_active_order", (q) => q.eq("isActive", true))
        .collect();

      await ctx.db.patch(city._id, {
        stats: {
          totalHotspots: hotspots.length,
          totalQuickWins: quickWins.length,
          activeModules: activeModules.length,
          completedQuickWins: 0,
          activeActionPlans: 0,
        },
        updatedAt: Date.now(),
      });

      console.log(`Updated stats for ${city.name}`);
    }
  },
});

/**
 * Seed data sources
 */
export const seedDataSources = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get air-quality module
    const airQualityModule = await ctx.db
      .query("modules")
      .withIndex("by_slug", (q) => q.eq("slug", "air-quality"))
      .unique();

    const dataSources = [
      {
        slug: "sentinel-5p",
        name: "Copernicus Sentinel-5P TROPOMI",
        description:
          "European Space Agency satellite providing atmospheric composition data including NO2, SO2, O3, CO, and aerosols",
        provider: "European Space Agency / Copernicus",
        url: "https://dataspace.copernicus.eu/",
        updateFrequency: "daily",
        moduleIds: airQualityModule ? [airQualityModule._id] : [],
      },
      {
        slug: "sentinel-3",
        name: "Copernicus Sentinel-3 SLSTR",
        description:
          "Sea and Land Surface Temperature Radiometer providing land surface temperature data for urban heat island detection",
        provider: "European Space Agency / Copernicus",
        url: "https://dataspace.copernicus.eu/",
        updateFrequency: "daily",
        moduleIds: [],
      },
    ];

    let seededCount = 0;
    for (const source of dataSources) {
      const existing = await ctx.db
        .query("dataSources")
        .withIndex("by_slug", (q) => q.eq("slug", source.slug))
        .unique();

      if (existing) {
        console.log(`Data source ${source.name} already exists, skipping...`);
        continue;
      }

      await ctx.db.insert("dataSources", {
        ...source,
        isActive: true,
        createdAt: now,
      });

      seededCount++;
      console.log(`Seeded data source: ${source.name}`);
    }

    return { seeded: seededCount };
  },
});

/**
 * Run full seed process
 */
export const runFullSeed = action({
  args: {},
  handler: async (ctx) => {
    console.log("Starting full seed...");

    // Step 1: Seed cities
    console.log("Seeding cities...");
    await ctx.runMutation(internal.seed.seedCities, {});

    // Step 2: Seed modules
    console.log("Seeding modules...");
    await ctx.runMutation(internal.seed.seedModules, {});

    // Step 3: Seed quick wins
    console.log("Seeding quick wins...");
    await ctx.runMutation(internal.seed.seedQuickWins, {});

    // Step 4: Seed data sources
    console.log("Seeding data sources...");
    await ctx.runMutation(internal.seed.seedDataSources, {});

    // Step 5: Seed hotspots for each city
    console.log("Seeding hotspots...");
    const cities = ["amsterdam", "copenhagen", "singapore", "barcelona", "melbourne"];
    for (const citySlug of cities) {
      await ctx.runMutation(internal.seed.seedHotspots, { citySlug });
    }

    // Step 6: Update city stats
    console.log("Updating city stats...");
    await ctx.runMutation(internal.seed.updateCityStats, {});

    console.log("Full seed completed!");
    return { success: true };
  },
});

/**
 * Seed comprehensive Barcelona data for all modules
 */
export const seedBarcelonaComplete = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get Barcelona city
    const city = await ctx.db
      .query("cities")
      .withIndex("by_slug", (q) => q.eq("slug", "barcelona"))
      .unique();

    if (!city) {
      throw new Error("Barcelona city not found. Run seedCities first.");
    }

    // Get all modules
    const modules = await ctx.db.query("modules").collect();
    const moduleSlugToId: Record<string, string> = {};
    for (const module of modules) {
      moduleSlugToId[module.slug] = module._id;
    }

    let hotspotsSeeded = 0;
    let quickWinsSeeded = 0;

    // Seed hotspots for each module
    for (const [moduleSlug, hotspots] of Object.entries(barcelonaHotspots)) {
      const moduleId = moduleSlugToId[moduleSlug];
      if (!moduleId) {
        console.log(`Module ${moduleSlug} not found, skipping...`);
        continue;
      }

      for (const hotspot of hotspots) {
        // Check if similar hotspot exists
        const existing = await ctx.db
          .query("hotspots")
          .withIndex("by_city_module", (q) =>
            q.eq("cityId", city._id).eq("moduleId", moduleId as any)
          )
          .filter((q) => q.eq(q.field("name"), hotspot.name))
          .first();

        if (existing) {
          continue;
        }

        await ctx.db.insert("hotspots", {
          cityId: city._id,
          moduleId: moduleId as any,
          name: hotspot.name,
          description: hotspot.description,
          coordinates: {
            lat: city.coordinates.lat + hotspot.offset.lat,
            lng: city.coordinates.lng + hotspot.offset.lng,
          },
          neighborhood: hotspot.neighborhood,
          severity: hotspot.severity,
          status: "active",
          metrics: hotspot.metrics,
          displayValue: hotspot.displayValue,
          detectedAt: now - 7 * 24 * 60 * 60 * 1000,
          lastUpdated: now,
          createdAt: now,
        });

        hotspotsSeeded++;
      }
    }

    // Seed quick wins for Barcelona
    for (const [moduleSlug, quickWins] of Object.entries(barcelonaQuickWins)) {
      const moduleId = moduleSlugToId[moduleSlug];
      if (!moduleId) {
        console.log(`Module ${moduleSlug} not found for quick wins, skipping...`);
        continue;
      }

      for (let i = 0; i < quickWins.length; i++) {
        const quickWin = quickWins[i];

        // Check if exists
        const existing = await ctx.db
          .query("quickWins")
          .withIndex("by_city", (q) => q.eq("cityId", city._id))
          .filter((q) => q.eq(q.field("title"), quickWin.title))
          .first();

        if (existing) {
          continue;
        }

        await ctx.db.insert("quickWins", {
          cityId: city._id,
          moduleId: moduleId as any,
          title: quickWin.title,
          description: quickWin.description,
          impact: quickWin.impact,
          effort: quickWin.effort,
          estimatedDays: quickWin.estimatedDays,
          co2ReductionTons: quickWin.co2ReductionTons,
          tags: [...quickWin.tags, "barcelona"],
          steps: quickWin.steps,
          sortOrder: i,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });

        quickWinsSeeded++;
      }
    }

    console.log(`Seeded Barcelona: ${hotspotsSeeded} hotspots, ${quickWinsSeeded} quick wins`);
    return { hotspotsSeeded, quickWinsSeeded };
  },
});

/**
 * Run Barcelona-focused seed
 */
export const runBarcelonaSeed = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; hotspotsSeeded: number; quickWinsSeeded: number }> => {
    console.log("Starting Barcelona seed...");

    // Ensure base data exists
    await ctx.runMutation(internal.seed.seedCities, {});
    await ctx.runMutation(internal.seed.seedModules, {});

    // Seed Barcelona comprehensive data
    const result = await ctx.runMutation(internal.seed.seedBarcelonaComplete, {});

    // Update city stats
    await ctx.runMutation(internal.seed.updateCityStats, {});

    console.log("Barcelona seed completed!");
    return { success: true, ...result };
  },
});

/**
 * Clear all data (development only!)
 */
export const clearAllData = internalMutation({
  args: {
    confirm: v.literal("DELETE_ALL_DATA"),
  },
  handler: async (ctx, args) => {
    if (args.confirm !== "DELETE_ALL_DATA") {
      throw new Error("Confirmation required");
    }

    // Delete in order of dependencies
    const tables = [
      "userCompletedWins",
      "chatMessages",
      "aiInsights",
      "dashboardStats",
      "actionPlans",
      "quickWins",
      "hotspots",
      "satelliteData",
      "dataIngestionLog",
      "modules",
      "cities",
      "dataSources",
    ] as const;

    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
      console.log(`Cleared ${docs.length} records from ${table}`);
    }

    console.log("All data cleared!");
    return { success: true };
  },
});
