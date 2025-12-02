import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * List hotspots for a city
 */
export const listByCity = query({
  args: {
    cityId: v.id("cities"),
    severity: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("critical")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("monitoring"),
        v.literal("resolved")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let hotspotsQuery;

    if (args.severity) {
      hotspotsQuery = ctx.db
        .query("hotspots")
        .withIndex("by_city_severity", (q) =>
          q.eq("cityId", args.cityId).eq("severity", args.severity!)
        );
    } else {
      hotspotsQuery = ctx.db
        .query("hotspots")
        .withIndex("by_city", (q) => q.eq("cityId", args.cityId));
    }

    if (args.status) {
      hotspotsQuery = hotspotsQuery.filter((q) =>
        q.eq(q.field("status"), args.status)
      );
    }

    const hotspots = await hotspotsQuery.collect();

    // Apply limit if specified
    if (args.limit && hotspots.length > args.limit) {
      return hotspots.slice(0, args.limit);
    }

    return hotspots;
  },
});

/**
 * List hotspots for a city and module
 */
export const listByCityModule = query({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hotspots = await ctx.db
      .query("hotspots")
      .withIndex("by_city_module", (q) =>
        q.eq("cityId", args.cityId).eq("moduleId", args.moduleId)
      )
      .collect();

    if (args.limit && hotspots.length > args.limit) {
      return hotspots.slice(0, args.limit);
    }

    return hotspots;
  },
});

/**
 * Get a hotspot by ID
 */
export const getById = query({
  args: { hotspotId: v.id("hotspots") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.hotspotId);
  },
});

/**
 * Get a hotspot with its AI insights
 */
export const getWithInsights = query({
  args: { hotspotId: v.id("hotspots") },
  handler: async (ctx, args) => {
    const hotspot = await ctx.db.get(args.hotspotId);
    if (!hotspot) return null;

    const insights = await ctx.db
      .query("aiInsights")
      .withIndex("by_hotspot", (q) => q.eq("hotspotId", args.hotspotId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get related quick wins
    const quickWins = await ctx.db
      .query("quickWins")
      .withIndex("by_hotspot", (q) => q.eq("hotspotId", args.hotspotId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return {
      ...hotspot,
      insights,
      relatedQuickWins: quickWins,
    };
  },
});

/**
 * Create a hotspot
 */
export const create = mutation({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    name: v.string(),
    description: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    address: v.optional(v.string()),
    neighborhood: v.optional(v.string()),
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("monitoring"),
        v.literal("resolved")
      )
    ),
    metrics: v.optional(
      v.array(
        v.object({
          key: v.string(),
          value: v.number(),
          unit: v.optional(v.string()),
          trend: v.optional(
            v.union(v.literal("up"), v.literal("down"), v.literal("stable"))
          ),
        })
      )
    ),
    displayValue: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const hotspotId = await ctx.db.insert("hotspots", {
      cityId: args.cityId,
      moduleId: args.moduleId,
      name: args.name,
      description: args.description,
      coordinates: args.coordinates,
      address: args.address,
      neighborhood: args.neighborhood,
      severity: args.severity,
      status: args.status ?? "active",
      metrics: args.metrics ?? [],
      displayValue: args.displayValue,
      imageUrl: args.imageUrl,
      detectedAt: now,
      lastUpdated: now,
      createdAt: now,
    });

    return hotspotId;
  },
});

/**
 * Update hotspot status
 */
export const updateStatus = mutation({
  args: {
    hotspotId: v.id("hotspots"),
    status: v.union(
      v.literal("active"),
      v.literal("monitoring"),
      v.literal("resolved")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.hotspotId, {
      status: args.status,
      lastUpdated: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update hotspot severity
 */
export const updateSeverity = mutation({
  args: {
    hotspotId: v.id("hotspots"),
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.hotspotId, {
      severity: args.severity,
      lastUpdated: Date.now(),
    });

    return { success: true };
  },
});
