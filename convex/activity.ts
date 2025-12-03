import { query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Activity Types
 */
export type ActivityType =
  | "hotspot_detected"
  | "hotspot_resolved"
  | "quick_win_completed"
  | "action_plan_created"
  | "action_plan_completed"
  | "ai_insight_generated";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  action: string;
  module: string;
  moduleSlug: string;
  city?: string;
  timestamp: number;
  severity?: "low" | "medium" | "high" | "critical";
  metadata?: Record<string, unknown>;
}

/**
 * Internal helper function to fetch activity events
 */
async function fetchActivityEvents(
  ctx: QueryCtx,
  cityId?: Id<"cities">,
  limit: number = 10
): Promise<ActivityEvent[]> {
  const activities: ActivityEvent[] = [];

  // Get recent hotspots (detected in the last 24 hours)
  const recentHotspots = await ctx.db
    .query("hotspots")
    .withIndex("by_city", (q) => (cityId ? q.eq("cityId", cityId) : q))
    .order("desc")
    .take(20);

  for (const hotspot of recentHotspots) {
    const moduleDoc = await ctx.db.get(hotspot.moduleId);
    const city = await ctx.db.get(hotspot.cityId);

    if (moduleDoc) {
      // Hotspot detected
      activities.push({
        id: `hotspot-${hotspot._id}`,
        type: "hotspot_detected",
        action: `New ${hotspot.severity} ${moduleDoc.name.toLowerCase()} hotspot detected`,
        module: moduleDoc.name,
        moduleSlug: moduleDoc.slug,
        city: city?.name,
        timestamp: hotspot.detectedAt,
        severity: hotspot.severity,
        metadata: {
          hotspotId: hotspot._id,
          name: hotspot.name,
          displayValue: hotspot.displayValue,
        },
      });

      // If resolved, add that too
      if (hotspot.status === "resolved") {
        activities.push({
          id: `hotspot-resolved-${hotspot._id}`,
          type: "hotspot_resolved",
          action: `${moduleDoc.name} hotspot resolved`,
          module: moduleDoc.name,
          moduleSlug: moduleDoc.slug,
          city: city?.name,
          timestamp: hotspot.lastUpdated,
          metadata: {
            hotspotId: hotspot._id,
            name: hotspot.name,
          },
        });
      }
    }
  }

  // Get recent completed quick wins
  const recentCompletions = await ctx.db
    .query("userCompletedWins")
    .order("desc")
    .take(20);

  for (const completion of recentCompletions) {
    const quickWin = await ctx.db.get(completion.quickWinId);
    if (quickWin) {
      const moduleDoc = await ctx.db.get(quickWin.moduleId);
      const city = quickWin.cityId ? await ctx.db.get(quickWin.cityId) : null;

      if (moduleDoc) {
        activities.push({
          id: `completion-${completion._id}`,
          type: "quick_win_completed",
          action: `Quick win completed: ${quickWin.title}`,
          module: moduleDoc.name,
          moduleSlug: moduleDoc.slug,
          city: city?.name,
          timestamp: completion.completedAt,
          metadata: {
            quickWinId: quickWin._id,
            impact: quickWin.impact,
          },
        });
      }
    }
  }

  // Get recent AI insights
  const recentInsights = await ctx.db
    .query("aiInsights")
    .withIndex("by_active", (q) => q.eq("isActive", true))
    .order("desc")
    .take(10);

  for (const insight of recentInsights) {
    const hotspot = await ctx.db.get(insight.hotspotId);
    if (hotspot) {
      const moduleDoc = await ctx.db.get(hotspot.moduleId);
      const city = await ctx.db.get(hotspot.cityId);

      if (moduleDoc) {
        activities.push({
          id: `insight-${insight._id}`,
          type: "ai_insight_generated",
          action: `AI ${insight.type}: ${insight.title}`,
          module: moduleDoc.name,
          moduleSlug: moduleDoc.slug,
          city: city?.name,
          timestamp: insight.generatedAt,
          metadata: {
            insightId: insight._id,
            priority: insight.priority,
            confidence: insight.confidence,
          },
        });
      }
    }
  }

  // Get recent action plan updates
  const recentPlans = await ctx.db
    .query("actionPlans")
    .order("desc")
    .take(10);

  for (const plan of recentPlans) {
    const city = await ctx.db.get(plan.cityId);

    // Check if recently created (within same day as updated)
    const isNew = plan.createdAt === plan.updatedAt;
    const isCompleted = plan.status === "completed" && plan.completedAt;

    if (isCompleted) {
      activities.push({
        id: `plan-completed-${plan._id}`,
        type: "action_plan_completed",
        action: `Action plan completed: ${plan.title}`,
        module: plan.moduleIds[0] || "Multiple",
        moduleSlug: plan.moduleIds[0] || "all",
        city: city?.name,
        timestamp: plan.completedAt!,
        metadata: {
          planId: plan._id,
          quickWinsCount: plan.quickWinIds.length,
        },
      });
    } else if (isNew) {
      activities.push({
        id: `plan-created-${plan._id}`,
        type: "action_plan_created",
        action: `New action plan: ${plan.title}`,
        module: plan.moduleIds[0] || "Multiple",
        moduleSlug: plan.moduleIds[0] || "all",
        city: city?.name,
        timestamp: plan.createdAt,
        metadata: {
          planId: plan._id,
          priority: plan.priority,
        },
      });
    }
  }

  // Sort all activities by timestamp (most recent first)
  activities.sort((a, b) => b.timestamp - a.timestamp);

  // Return limited results
  return activities.slice(0, limit);
}

/**
 * Get recent activity for the dashboard
 * Aggregates events from hotspots, quick wins, action plans, and AI insights
 */
export const getRecent = query({
  args: {
    cityId: v.optional(v.id("cities")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { cityId, limit = 10 }): Promise<ActivityEvent[]> => {
    return fetchActivityEvents(ctx, cityId, limit);
  },
});

/**
 * Get activity for a specific module
 */
export const getByModule = query({
  args: {
    moduleSlug: v.string(),
    cityId: v.optional(v.id("cities")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { moduleSlug, cityId, limit = 10 }): Promise<ActivityEvent[]> => {
    // Get all activity and filter by module
    const allActivity = await fetchActivityEvents(ctx, cityId, 50);
    return allActivity
      .filter((a) => a.moduleSlug === moduleSlug)
      .slice(0, limit);
  },
});
