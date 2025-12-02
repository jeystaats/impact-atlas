import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * List all modules
 */
export const list = query({
  args: {
    category: v.optional(
      v.union(
        v.literal("pollution"),
        v.literal("climate"),
        v.literal("ecosystem")
      )
    ),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let modules;

    if (args.category) {
      modules = await ctx.db
        .query("modules")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else if (args.activeOnly) {
      modules = await ctx.db
        .query("modules")
        .withIndex("by_active_order", (q) => q.eq("isActive", true))
        .collect();
    } else {
      modules = await ctx.db.query("modules").collect();
    }

    // Sort by sortOrder
    return modules.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Get a module by slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("modules")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

/**
 * Get a module by ID
 */
export const getById = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.moduleId);
  },
});

/**
 * Get modules with city-specific data (hotspot counts, etc.)
 */
export const getForCity = query({
  args: { cityId: v.id("cities") },
  handler: async (ctx, args) => {
    const modules = await ctx.db
      .query("modules")
      .withIndex("by_active_order", (q) => q.eq("isActive", true))
      .collect();

    // Get hotspot counts per module for this city
    const modulesWithStats = await Promise.all(
      modules.map(async (module) => {
        const hotspots = await ctx.db
          .query("hotspots")
          .withIndex("by_city_module", (q) =>
            q.eq("cityId", args.cityId).eq("moduleId", module._id)
          )
          .collect();

        const quickWins = await ctx.db
          .query("quickWins")
          .withIndex("by_module", (q) => q.eq("moduleId", module._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        const criticalHotspots = hotspots.filter(
          (h) => h.severity === "critical" || h.severity === "high"
        ).length;

        return {
          ...module,
          cityStats: {
            totalHotspots: hotspots.length,
            criticalHotspots,
            activeHotspots: hotspots.filter((h) => h.status === "active").length,
            totalQuickWins: quickWins.length,
          },
        };
      })
    );

    return modulesWithStats.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Create a new module (admin only)
 */
export const create = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("pollution"),
      v.literal("climate"),
      v.literal("ecosystem")
    ),
    icon: v.string(),
    color: v.string(),
    gradient: v.optional(v.string()),
    metrics: v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        unit: v.optional(v.string()),
        description: v.optional(v.string()),
      })
    ),
    dataSourceInfo: v.optional(v.string()),
    dataSourceUrl: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("beta"),
      v.literal("coming-soon")
    ),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if slug already exists
    const existing = await ctx.db
      .query("modules")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw new Error(`Module with slug "${args.slug}" already exists`);
    }

    const moduleId = await ctx.db.insert("modules", {
      ...args,
      isActive: args.status === "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return moduleId;
  },
});
