import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

/**
 * List all cities
 */
export const list = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.activeOnly) {
      return await ctx.db
        .query("cities")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .collect();
    }
    return await ctx.db.query("cities").collect();
  },
});

/**
 * Get a city by slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cities")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

/**
 * Get a city by ID
 */
export const getById = query({
  args: { cityId: v.id("cities") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.cityId);
  },
});

/**
 * Get city with full stats
 */
export const getWithStats = query({
  args: { cityId: v.id("cities") },
  handler: async (ctx, args) => {
    const city = await ctx.db.get(args.cityId);
    if (!city) return null;

    // Get latest dashboard stats
    const stats = await ctx.db
      .query("dashboardStats")
      .withIndex("by_city_period", (q) =>
        q.eq("cityId", args.cityId).eq("period", "daily")
      )
      .order("desc")
      .first();

    return {
      ...city,
      latestStats: stats,
    };
  },
});

/**
 * Update city stats (internal - called by aggregation jobs)
 */
export const updateStats = internalMutation({
  args: {
    cityId: v.id("cities"),
    stats: v.object({
      totalHotspots: v.number(),
      totalQuickWins: v.number(),
      activeModules: v.number(),
      completedQuickWins: v.number(),
      activeActionPlans: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.cityId, {
      stats: args.stats,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Create a new city (admin only)
 */
export const create = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    country: v.string(),
    region: v.optional(v.string()),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    population: v.number(),
    area: v.optional(v.number()),
    climateZone: v.optional(v.string()),
    timezone: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if slug already exists
    const existing = await ctx.db
      .query("cities")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw new Error(`City with slug "${args.slug}" already exists`);
    }

    const cityId = await ctx.db.insert("cities", {
      ...args,
      stats: {
        totalHotspots: 0,
        totalQuickWins: 0,
        activeModules: 0,
        completedQuickWins: 0,
        activeActionPlans: 0,
      },
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return cityId;
  },
});
