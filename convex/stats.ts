import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";
import { getCurrentUser } from "./model/auth";

/**
 * Get dashboard stats for a city
 */
export const getDashboard = query({
  args: { cityId: v.id("cities") },
  handler: async (ctx, args) => {
    const city = await ctx.db.get(args.cityId);
    if (!city) return null;

    // Get all modules
    const modules = await ctx.db
      .query("modules")
      .withIndex("by_active_order", (q) => q.eq("isActive", true))
      .collect();

    // Get hotspots by severity
    const hotspots = await ctx.db
      .query("hotspots")
      .withIndex("by_city", (q) => q.eq("cityId", args.cityId))
      .collect();

    const hotspotsBySeverity = {
      critical: hotspots.filter((h) => h.severity === "critical").length,
      high: hotspots.filter((h) => h.severity === "high").length,
      medium: hotspots.filter((h) => h.severity === "medium").length,
      low: hotspots.filter((h) => h.severity === "low").length,
    };

    // Get quick wins
    const quickWins = await ctx.db
      .query("quickWins")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const quickWinsByImpact = {
      high: quickWins.filter((qw) => qw.impact === "high").length,
      medium: quickWins.filter((qw) => qw.impact === "medium").length,
      low: quickWins.filter((qw) => qw.impact === "low").length,
    };

    // Get AI insights count
    const aiInsights = await ctx.db
      .query("aiInsights")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Get action plans for this city
    const actionPlans = await ctx.db
      .query("actionPlans")
      .withIndex("by_city", (q) => q.eq("cityId", args.cityId))
      .collect();

    const activeActionPlans = actionPlans.filter(
      (p) => p.status === "active"
    ).length;

    // Get latest dashboard stats if available
    const latestStats = await ctx.db
      .query("dashboardStats")
      .withIndex("by_city_period", (q) =>
        q.eq("cityId", args.cityId).eq("period", "daily")
      )
      .order("desc")
      .first();

    return {
      city,
      summary: {
        activeModules: modules.length,
        totalHotspots: hotspots.length,
        totalQuickWins: quickWins.length,
        aiInsights: aiInsights.length,
        activeActionPlans,
      },
      hotspotsBySeverity,
      quickWinsByImpact,
      modules: modules.map((m) => ({
        ...m,
        hotspotCount: hotspots.filter((h) => h.moduleId === m._id).length,
        quickWinCount: quickWins.filter((qw) => qw.moduleId === m._id).length,
      })),
      latestStats,
      sparklineData: latestStats?.sparklineData ?? [4, 6, 8, 5, 7, 9, 6],
    };
  },
});

/**
 * Get stats for a specific module in a city
 */
export const getModuleStats = query({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
  },
  handler: async (ctx, args) => {
    const module = await ctx.db.get(args.moduleId);
    if (!module) return null;

    // Get hotspots for this module in this city
    const hotspots = await ctx.db
      .query("hotspots")
      .withIndex("by_city_module", (q) =>
        q.eq("cityId", args.cityId).eq("moduleId", args.moduleId)
      )
      .collect();

    // Get quick wins for this module
    const quickWins = await ctx.db
      .query("quickWins")
      .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get AI insights for hotspots in this module
    const insightPromises = hotspots.map((h) =>
      ctx.db
        .query("aiInsights")
        .withIndex("by_hotspot", (q) => q.eq("hotspotId", h._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect()
    );
    const insightsArrays = await Promise.all(insightPromises);
    const insights = insightsArrays.flat();

    return {
      module,
      stats: {
        totalHotspots: hotspots.length,
        criticalHotspots: hotspots.filter((h) => h.severity === "critical")
          .length,
        highHotspots: hotspots.filter((h) => h.severity === "high").length,
        activeHotspots: hotspots.filter((h) => h.status === "active").length,
        resolvedHotspots: hotspots.filter((h) => h.status === "resolved").length,
        totalQuickWins: quickWins.length,
        highImpactQuickWins: quickWins.filter((qw) => qw.impact === "high")
          .length,
        totalInsights: insights.length,
      },
      recentHotspots: hotspots
        .sort((a, b) => b.detectedAt - a.detectedAt)
        .slice(0, 5),
      topQuickWins: quickWins
        .filter((qw) => qw.impact === "high")
        .slice(0, 3),
    };
  },
});

/**
 * Get current user's activity stats
 */
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    // Get completed quick wins
    const completedWins = await ctx.db
      .query("userCompletedWins")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get action plans
    const actionPlans = await ctx.db
      .query("actionPlans")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Calculate streak (consecutive days with activity)
    const sortedCompletions = completedWins.sort(
      (a, b) => b.completedAt - a.completedAt
    );

    let streak = 0;
    if (sortedCompletions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkDate = today.getTime();

      for (const completion of sortedCompletions) {
        const completionDate = new Date(completion.completedAt);
        completionDate.setHours(0, 0, 0, 0);

        if (completionDate.getTime() === checkDate) {
          streak++;
          checkDate -= 24 * 60 * 60 * 1000; // Previous day
        } else if (completionDate.getTime() < checkDate) {
          break;
        }
      }
    }

    // Group completions by week
    const thisWeek = completedWins.filter((cw) => {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return cw.completedAt > weekAgo;
    });

    const thisMonth = completedWins.filter((cw) => {
      const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return cw.completedAt > monthAgo;
    });

    return {
      totalCompletedWins: completedWins.length,
      completedThisWeek: thisWeek.length,
      completedThisMonth: thisMonth.length,
      streak,
      totalActionPlans: actionPlans.length,
      activeActionPlans: actionPlans.filter((p) => p.status === "active").length,
      completedActionPlans: actionPlans.filter((p) => p.status === "completed")
        .length,
      recentCompletions: sortedCompletions.slice(0, 5),
    };
  },
});

/**
 * Record daily stats snapshot (called by cron job)
 */
export const recordDailyStats = internalMutation({
  args: {
    cityId: v.id("cities"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if we already have stats for today
    const existing = await ctx.db
      .query("dashboardStats")
      .withIndex("by_city_date", (q) =>
        q.eq("cityId", args.cityId).eq("periodStart", today.getTime())
      )
      .unique();

    if (existing) {
      return { alreadyExists: true };
    }

    // Calculate current metrics
    const hotspots = await ctx.db
      .query("hotspots")
      .withIndex("by_city", (q) => q.eq("cityId", args.cityId))
      .collect();

    const actionPlans = await ctx.db
      .query("actionPlans")
      .withIndex("by_city", (q) => q.eq("cityId", args.cityId))
      .collect();

    // Get previous day's stats for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const previousStats = await ctx.db
      .query("dashboardStats")
      .withIndex("by_city_date", (q) =>
        q.eq("cityId", args.cityId).eq("periodStart", yesterday.getTime())
      )
      .unique();

    const metrics = {
      hotspotsDetected: hotspots.filter(
        (h) => h.detectedAt > today.getTime() - 24 * 60 * 60 * 1000
      ).length,
      hotspotsResolved: hotspots.filter(
        (h) => h.status === "resolved"
      ).length,
      quickWinsCompleted: 0, // Would need to aggregate from userCompletedWins
      actionPlansCreated: actionPlans.filter(
        (p) => p.createdAt > today.getTime() - 24 * 60 * 60 * 1000
      ).length,
      actionPlansCompleted: actionPlans.filter(
        (p) =>
          p.status === "completed" &&
          p.completedAt &&
          p.completedAt > today.getTime() - 24 * 60 * 60 * 1000
      ).length,
      activeUsers: 0, // Would need to track separately
    };

    // Calculate trends
    const trends: Record<string, "up" | "down" | "stable"> = {};
    if (previousStats) {
      const prev = previousStats.metrics;
      trends.hotspotsDetected =
        metrics.hotspotsDetected > prev.hotspotsDetected
          ? "up"
          : metrics.hotspotsDetected < prev.hotspotsDetected
            ? "down"
            : "stable";
      trends.hotspotsResolved =
        metrics.hotspotsResolved > prev.hotspotsResolved
          ? "up"
          : metrics.hotspotsResolved < prev.hotspotsResolved
            ? "down"
            : "stable";
    }

    // Generate sparkline data (last 7 days of hotspot detections)
    const sparklineData: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = today.getTime() - i * 24 * 60 * 60 * 1000;
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const count = hotspots.filter(
        (h) => h.detectedAt >= dayStart && h.detectedAt < dayEnd
      ).length;
      sparklineData.push(count);
    }

    await ctx.db.insert("dashboardStats", {
      cityId: args.cityId,
      period: "daily",
      periodStart: today.getTime(),
      metrics,
      trends,
      sparklineData,
      generatedAt: now,
    });

    return { success: true };
  },
});
