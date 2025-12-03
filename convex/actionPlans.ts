import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireCurrentUser, getCurrentUser } from "./model/auth";

/**
 * List current user's action plans
 */
export const listMine = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("completed"),
        v.literal("archived")
      )
    ),
    cityId: v.optional(v.id("cities")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    let plansQuery;

    if (args.status) {
      plansQuery = ctx.db
        .query("actionPlans")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", user._id).eq("status", args.status!)
        );
    } else {
      plansQuery = ctx.db
        .query("actionPlans")
        .withIndex("by_user", (q) => q.eq("userId", user._id));
    }

    let plans = await plansQuery.collect();

    // Filter by city if specified
    if (args.cityId) {
      plans = plans.filter((p) => p.cityId === args.cityId);
    }

    // Sort by updatedAt desc
    return plans.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

/**
 * Get an action plan by ID with full details
 */
export const getById = query({
  args: { planId: v.id("actionPlans") },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    if (!plan) return null;

    // Get quick wins details
    const quickWins = await Promise.all(
      plan.quickWinIds.map((id) => ctx.db.get(id))
    );

    // Get city details
    const city = await ctx.db.get(plan.cityId);

    // Get user (owner) details
    const owner = await ctx.db.get(plan.userId);

    // Get completed wins for progress calculation
    const user = await getCurrentUser(ctx);
    let completedWinIds: string[] = [];

    if (user) {
      const completedWins = await ctx.db
        .query("userCompletedWins")
        .withIndex("by_action_plan", (q) => q.eq("actionPlanId", args.planId))
        .collect();
      completedWinIds = completedWins.map((cw) => cw.quickWinId);
    }

    return {
      ...plan,
      quickWins: quickWins.filter(Boolean),
      city,
      owner,
      completedWinIds,
      calculatedProgress:
        plan.quickWinIds.length > 0
          ? Math.round(
              (completedWinIds.length / plan.quickWinIds.length) * 100
            )
          : 0,
    };
  },
});

/**
 * Create a new action plan
 */
export const create = mutation({
  args: {
    cityId: v.id("cities"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    quickWinIds: v.optional(v.array(v.id("quickWins"))),
    moduleIds: v.optional(v.array(v.string())),
    targetDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();

    // Derive moduleIds from quick wins if not provided
    let moduleIds = args.moduleIds ?? [];
    if (args.quickWinIds && args.quickWinIds.length > 0 && moduleIds.length === 0) {
      const quickWins = await Promise.all(
        args.quickWinIds.map((id) => ctx.db.get(id))
      );
      const modules = await Promise.all(
        quickWins
          .filter(Boolean)
          .map((qw) => ctx.db.get(qw!.moduleId))
      );
      moduleIds = [...new Set(modules.filter(Boolean).map((m) => m!.slug))];
    }

    const planId = await ctx.db.insert("actionPlans", {
      userId: user._id,
      cityId: args.cityId,
      title: args.title,
      description: args.description,
      status: "draft",
      progress: 0,
      priority: args.priority,
      quickWinIds: args.quickWinIds ?? [],
      moduleIds,
      targetDate: args.targetDate,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    return planId;
  },
});

/**
 * Update an action plan
 */
export const update = mutation({
  args: {
    planId: v.id("actionPlans"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
    targetDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    budget: v.optional(
      v.object({
        allocated: v.number(),
        spent: v.number(),
        currency: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const plan = await ctx.db.get(args.planId);

    if (!plan) {
      throw new Error("Action plan not found");
    }

    if (plan.userId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to update this plan");
    }

    const { planId, ...updates } = args;

    // Remove undefined values
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    await ctx.db.patch(planId, {
      ...cleanUpdates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Add a quick win to an action plan
 */
export const addQuickWin = mutation({
  args: {
    planId: v.id("actionPlans"),
    quickWinId: v.id("quickWins"),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const plan = await ctx.db.get(args.planId);

    if (!plan) {
      throw new Error("Action plan not found");
    }

    if (plan.userId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to update this plan");
    }

    // Check if already added
    if (plan.quickWinIds.includes(args.quickWinId)) {
      return { success: true, alreadyAdded: true };
    }

    // Get quick win to update moduleIds
    const quickWin = await ctx.db.get(args.quickWinId);
    if (!quickWin) {
      throw new Error("Quick win not found");
    }

    const moduleDoc = await ctx.db.get(quickWin.moduleId);
    const updatedModuleIds = moduleDoc && !plan.moduleIds.includes(moduleDoc.slug)
      ? [...plan.moduleIds, moduleDoc.slug]
      : plan.moduleIds;

    await ctx.db.patch(args.planId, {
      quickWinIds: [...plan.quickWinIds, args.quickWinId],
      moduleIds: updatedModuleIds,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Remove a quick win from an action plan
 */
export const removeQuickWin = mutation({
  args: {
    planId: v.id("actionPlans"),
    quickWinId: v.id("quickWins"),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const plan = await ctx.db.get(args.planId);

    if (!plan) {
      throw new Error("Action plan not found");
    }

    if (plan.userId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to update this plan");
    }

    await ctx.db.patch(args.planId, {
      quickWinIds: plan.quickWinIds.filter((id) => id !== args.quickWinId),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update action plan status
 */
export const updateStatus = mutation({
  args: {
    planId: v.id("actionPlans"),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const plan = await ctx.db.get(args.planId);

    if (!plan) {
      throw new Error("Action plan not found");
    }

    if (plan.userId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to update this plan");
    }

    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };

    // Set timestamps based on status
    if (args.status === "active" && !plan.startedAt) {
      updates.startedAt = Date.now();
    } else if (args.status === "completed") {
      updates.completedAt = Date.now();
      updates.progress = 100;
    }

    await ctx.db.patch(args.planId, updates);

    return { success: true };
  },
});

/**
 * Update action plan progress
 */
export const updateProgress = mutation({
  args: {
    planId: v.id("actionPlans"),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const plan = await ctx.db.get(args.planId);

    if (!plan) {
      throw new Error("Action plan not found");
    }

    if (plan.userId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to update this plan");
    }

    // Clamp progress between 0 and 100
    const progress = Math.max(0, Math.min(100, args.progress));

    await ctx.db.patch(args.planId, {
      progress,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete an action plan
 */
export const remove = mutation({
  args: {
    planId: v.id("actionPlans"),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const plan = await ctx.db.get(args.planId);

    if (!plan) {
      throw new Error("Action plan not found");
    }

    if (plan.userId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to delete this plan");
    }

    await ctx.db.delete(args.planId);

    return { success: true };
  },
});
