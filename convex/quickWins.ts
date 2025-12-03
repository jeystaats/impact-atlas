import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireCurrentUser, getCurrentUser, requireAdmin } from "./model/auth";

/**
 * List quick wins for a city
 */
export const listByCity = query({
  args: {
    cityId: v.optional(v.id("cities")),
    impact: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
    effort: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let quickWinsQuery;

    if (args.cityId && args.impact) {
      quickWinsQuery = ctx.db
        .query("quickWins")
        .withIndex("by_city_impact", (q) =>
          q.eq("cityId", args.cityId).eq("impact", args.impact!)
        );
    } else if (args.cityId) {
      quickWinsQuery = ctx.db
        .query("quickWins")
        .withIndex("by_city", (q) => q.eq("cityId", args.cityId));
    } else {
      quickWinsQuery = ctx.db
        .query("quickWins")
        .withIndex("by_active", (q) => q.eq("isActive", true));
    }

    let quickWins = await quickWinsQuery
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Apply effort filter
    if (args.effort) {
      quickWins = quickWins.filter((qw) => qw.effort === args.effort);
    }

    // Apply search filter
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      quickWins = quickWins.filter(
        (qw) =>
          qw.title.toLowerCase().includes(searchLower) ||
          qw.description.toLowerCase().includes(searchLower) ||
          qw.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort by priority/sortOrder
    quickWins.sort((a, b) => a.sortOrder - b.sortOrder);

    // Apply limit
    if (args.limit && quickWins.length > args.limit) {
      return quickWins.slice(0, args.limit);
    }

    return quickWins;
  },
});

/**
 * List quick wins for a city and module
 */
export const listByCityModule = query({
  args: {
    cityId: v.optional(v.id("cities")),
    moduleId: v.id("modules"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let quickWins;

    if (args.cityId) {
      quickWins = await ctx.db
        .query("quickWins")
        .withIndex("by_city_module", (q) =>
          q.eq("cityId", args.cityId).eq("moduleId", args.moduleId)
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    } else {
      quickWins = await ctx.db
        .query("quickWins")
        .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }

    quickWins.sort((a, b) => a.sortOrder - b.sortOrder);

    if (args.limit && quickWins.length > args.limit) {
      return quickWins.slice(0, args.limit);
    }

    return quickWins;
  },
});

/**
 * List quick wins by module (without city filter)
 */
export const listByModule = query({
  args: {
    moduleId: v.id("modules"),
    impact: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let quickWinsQuery;

    if (args.impact) {
      quickWinsQuery = ctx.db
        .query("quickWins")
        .withIndex("by_module_impact", (q) =>
          q.eq("moduleId", args.moduleId).eq("impact", args.impact!)
        );
    } else {
      quickWinsQuery = ctx.db
        .query("quickWins")
        .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId));
    }

    const quickWins = await quickWinsQuery
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    quickWins.sort((a, b) => a.sortOrder - b.sortOrder);

    if (args.limit && quickWins.length > args.limit) {
      return quickWins.slice(0, args.limit);
    }

    return quickWins;
  },
});

/**
 * Get a quick win by ID
 */
export const getById = query({
  args: { quickWinId: v.id("quickWins") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.quickWinId);
  },
});

/**
 * Get quick wins for a specific hotspot
 */
export const getForHotspot = query({
  args: { hotspotId: v.id("hotspots") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quickWins")
      .withIndex("by_hotspot", (q) => q.eq("hotspotId", args.hotspotId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

/**
 * Get user's completed quick wins
 */
export const getUserProgress = query({
  args: {
    cityId: v.optional(v.id("cities")),
    moduleId: v.optional(v.id("modules")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { completedWins: [], totalCompleted: 0 };

    const completedWins = await ctx.db
      .query("userCompletedWins")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get the actual quick win data
    const quickWinIds = completedWins.map((cw) => cw.quickWinId);
    const quickWins = await Promise.all(
      quickWinIds.map((id) => ctx.db.get(id))
    );

    // Filter by city/module if specified
    let filteredWins = quickWins.filter(Boolean);

    if (args.cityId) {
      filteredWins = filteredWins.filter((qw) => qw!.cityId === args.cityId);
    }

    if (args.moduleId) {
      filteredWins = filteredWins.filter(
        (qw) => qw!.moduleId === args.moduleId
      );
    }

    return {
      completedWins: completedWins.filter((cw) =>
        filteredWins.some((qw) => qw!._id === cw.quickWinId)
      ),
      totalCompleted: filteredWins.length,
    };
  },
});

/**
 * Check if user has completed a specific quick win
 */
export const isCompleted = query({
  args: { quickWinId: v.id("quickWins") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return false;

    const completed = await ctx.db
      .query("userCompletedWins")
      .withIndex("by_user_quick_win", (q) =>
        q.eq("userId", user._id).eq("quickWinId", args.quickWinId)
      )
      .unique();

    return !!completed;
  },
});

/**
 * Mark a quick win as completed
 */
export const complete = mutation({
  args: {
    quickWinId: v.id("quickWins"),
    actionPlanId: v.optional(v.id("actionPlans")),
    notes: v.optional(v.string()),
    actualCost: v.optional(v.number()),
    actualTimeWeeks: v.optional(v.number()),
    rating: v.optional(v.number()),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    // Check if already completed
    const existing = await ctx.db
      .query("userCompletedWins")
      .withIndex("by_user_quick_win", (q) =>
        q.eq("userId", user._id).eq("quickWinId", args.quickWinId)
      )
      .unique();

    if (existing) {
      throw new Error("Quick win already completed");
    }

    // Verify quick win exists
    const quickWin = await ctx.db.get(args.quickWinId);
    if (!quickWin) {
      throw new Error("Quick win not found");
    }

    const completedWinId = await ctx.db.insert("userCompletedWins", {
      userId: user._id,
      quickWinId: args.quickWinId,
      actionPlanId: args.actionPlanId,
      completedAt: Date.now(),
      notes: args.notes,
      actualCost: args.actualCost,
      actualTimeWeeks: args.actualTimeWeeks,
      rating: args.rating,
      feedback: args.feedback,
    });

    return completedWinId;
  },
});

/**
 * Remove completion (uncomplete)
 */
export const uncomplete = mutation({
  args: {
    quickWinId: v.id("quickWins"),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    const completed = await ctx.db
      .query("userCompletedWins")
      .withIndex("by_user_quick_win", (q) =>
        q.eq("userId", user._id).eq("quickWinId", args.quickWinId)
      )
      .unique();

    if (!completed) {
      throw new Error("Quick win not completed");
    }

    await ctx.db.delete(completed._id);

    return { success: true };
  },
});

/**
 * Create a quick win
 */
export const create = mutation({
  args: {
    cityId: v.optional(v.id("cities")),
    moduleId: v.id("modules"),
    hotspotId: v.optional(v.id("hotspots")),
    title: v.string(),
    description: v.string(),
    impact: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    effort: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    estimatedDays: v.optional(v.number()),
    tags: v.array(v.string()),
    category: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Require admin to create quick wins
    await requireAdmin(ctx);
    const now = Date.now();

    const quickWinId = await ctx.db.insert("quickWins", {
      cityId: args.cityId,
      moduleId: args.moduleId,
      hotspotId: args.hotspotId,
      title: args.title,
      description: args.description,
      impact: args.impact,
      effort: args.effort,
      estimatedDays: args.estimatedDays,
      tags: args.tags,
      category: args.category,
      sortOrder: args.sortOrder ?? 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return quickWinId;
  },
});

/**
 * Create a quick win from AI-generated content
 * Extracts title from content and uses defaults for impact/effort
 */
export const createFromAI = mutation({
  args: {
    content: v.string(),
    moduleSlug: v.optional(v.string()),
    cityId: v.optional(v.id("cities")),
  },
  handler: async (ctx, args) => {
    // Require authenticated user to create quick wins from AI
    await requireCurrentUser(ctx);
    const now = Date.now();

    // Extract title from content (first line or first sentence)
    let title = args.content.split("\n")[0].trim();
    // Remove markdown formatting
    title = title.replace(/^[#*\-\d.]+\s*/, "").trim();
    // Truncate if too long
    if (title.length > 100) {
      title = title.substring(0, 97) + "...";
    }
    // Fallback title
    if (!title || title.length < 5) {
      title = "AI-Generated Quick Win";
    }

    // Get module by slug or use a default
    let moduleId = null;
    if (args.moduleSlug) {
      const moduleDoc = await ctx.db
        .query("modules")
        .withIndex("by_slug", (q) => q.eq("slug", args.moduleSlug!))
        .first();
      moduleId = moduleDoc?._id;
    }

    // If no module found, try to get the first active module
    if (!moduleId) {
      const defaultModule = await ctx.db
        .query("modules")
        .withIndex("by_active_order", (q) => q.eq("isActive", true))
        .first();
      moduleId = defaultModule?._id;
    }

    if (!moduleId) {
      throw new Error("No module found to associate quick win with");
    }

    // Extract tags from content
    const tags: string[] = [];
    const tagPatterns = [
      /tree|planting|canopy/gi,
      /heat|temperature|cooling/gi,
      /plastic|debris|waste/gi,
      /emission|carbon|co2/gi,
      /biodiversity|species|habitat/gi,
      /restoration|rewild/gi,
    ];

    const tagLabels = [
      "trees",
      "heat",
      "plastic",
      "emissions",
      "biodiversity",
      "restoration",
    ];

    tagPatterns.forEach((pattern, i) => {
      if (pattern.test(args.content)) {
        tags.push(tagLabels[i]);
      }
    });

    // Add AI-generated tag
    tags.push("ai-generated");

    // Detect impact level from content
    let impact: "low" | "medium" | "high" = "medium";
    if (/high impact|significant|major|substantial/i.test(args.content)) {
      impact = "high";
    } else if (/low impact|minor|small/i.test(args.content)) {
      impact = "low";
    }

    // Detect effort level from content
    let effort: "low" | "medium" | "high" = "medium";
    if (/easy|simple|quick|low effort|minimal/i.test(args.content)) {
      effort = "low";
    } else if (/complex|difficult|high effort|intensive/i.test(args.content)) {
      effort = "high";
    }

    const quickWinId = await ctx.db.insert("quickWins", {
      cityId: args.cityId,
      moduleId,
      title,
      description: args.content,
      impact,
      effort,
      tags,
      category: "ai-suggestion",
      sortOrder: 999, // Place at end by default
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return quickWinId;
  },
});
