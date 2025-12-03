import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { requireAdmin } from "./model/auth";

/**
 * List AI insights for a hotspot
 */
export const listByHotspot = query({
  args: {
    hotspotId: v.id("hotspots"),
    type: v.optional(
      v.union(
        v.literal("recommendation"),
        v.literal("prediction"),
        v.literal("analysis"),
        v.literal("alert"),
        v.literal("opportunity")
      )
    ),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let insightsQuery;

    if (args.type) {
      insightsQuery = ctx.db
        .query("aiInsights")
        .withIndex("by_hotspot_type", (q) =>
          q.eq("hotspotId", args.hotspotId).eq("type", args.type!)
        );
    } else {
      insightsQuery = ctx.db
        .query("aiInsights")
        .withIndex("by_hotspot", (q) => q.eq("hotspotId", args.hotspotId));
    }

    if (args.activeOnly !== false) {
      insightsQuery = insightsQuery.filter((q) =>
        q.eq(q.field("isActive"), true)
      );
    }

    return await insightsQuery.collect();
  },
});

/**
 * Get an insight by ID
 */
export const getById = query({
  args: { insightId: v.id("aiInsights") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.insightId);
  },
});

/**
 * List high-priority insights across all hotspots
 */
export const listHighPriority = query({
  args: {
    cityId: v.optional(v.id("cities")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get urgent and high priority insights
    const urgentInsights = await ctx.db
      .query("aiInsights")
      .withIndex("by_priority", (q) => q.eq("priority", "urgent"))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const highInsights = await ctx.db
      .query("aiInsights")
      .withIndex("by_priority", (q) => q.eq("priority", "high"))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    let insights = [...urgentInsights, ...highInsights];

    // Filter by city if specified
    if (args.cityId) {
      const hotspots = await ctx.db
        .query("hotspots")
        .withIndex("by_city", (q) => q.eq("cityId", args.cityId!))
        .collect();
      const hotspotIds = new Set(hotspots.map((h) => h._id));
      insights = insights.filter((i) => hotspotIds.has(i.hotspotId));
    }

    // Sort by generated date (newest first)
    insights.sort((a, b) => b.generatedAt - a.generatedAt);

    // Apply limit
    const limit = args.limit ?? 10;
    return insights.slice(0, limit);
  },
});

/**
 * Create an AI insight
 */
export const create = mutation({
  args: {
    hotspotId: v.id("hotspots"),
    type: v.union(
      v.literal("recommendation"),
      v.literal("prediction"),
      v.literal("analysis"),
      v.literal("alert"),
      v.literal("opportunity")
    ),
    title: v.string(),
    content: v.string(),
    confidence: v.number(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    relatedQuickWinIds: v.optional(v.array(v.id("quickWins"))),
    metadata: v.optional(
      v.object({
        model: v.optional(v.string()),
        sources: v.optional(v.array(v.string())),
        generationParams: v.optional(v.any()),
      })
    ),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Require admin to create AI insights
    await requireAdmin(ctx);
    const now = Date.now();

    const insightId = await ctx.db.insert("aiInsights", {
      hotspotId: args.hotspotId,
      type: args.type,
      title: args.title,
      content: args.content,
      confidence: args.confidence,
      priority: args.priority,
      relatedQuickWinIds: args.relatedQuickWinIds,
      metadata: args.metadata,
      isActive: true,
      expiresAt: args.expiresAt,
      generatedAt: now,
      createdAt: now,
    });

    return insightId;
  },
});

/**
 * Deactivate an insight
 */
export const deactivate = mutation({
  args: {
    insightId: v.id("aiInsights"),
  },
  handler: async (ctx, args) => {
    // Require admin to deactivate insights
    await requireAdmin(ctx);
    await ctx.db.patch(args.insightId, {
      isActive: false,
    });

    return { success: true };
  },
});

/**
 * Save an AI-generated insight (internal - called from AI action)
 */
export const saveGenerated = internalMutation({
  args: {
    hotspotId: v.id("hotspots"),
    type: v.union(
      v.literal("recommendation"),
      v.literal("prediction"),
      v.literal("analysis"),
      v.literal("alert"),
      v.literal("opportunity")
    ),
    title: v.string(),
    content: v.string(),
    confidence: v.number(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    model: v.optional(v.string()),
    sources: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const insightId = await ctx.db.insert("aiInsights", {
      hotspotId: args.hotspotId,
      type: args.type,
      title: args.title,
      content: args.content,
      confidence: args.confidence,
      priority: args.priority,
      metadata: {
        model: args.model,
        sources: args.sources,
      },
      isActive: true,
      generatedAt: now,
      createdAt: now,
    });

    return insightId;
  },
});

/**
 * Clean up expired insights (called by cron)
 */
export const cleanupExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find all active insights with expiration
    const insights = await ctx.db
      .query("aiInsights")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    let deactivatedCount = 0;

    for (const insight of insights) {
      if (insight.expiresAt && insight.expiresAt < now) {
        await ctx.db.patch(insight._id, {
          isActive: false,
        });
        deactivatedCount++;
      }
    }

    return { deactivated: deactivatedCount };
  },
});
