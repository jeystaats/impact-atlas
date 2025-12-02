import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Get onboarding progress for a city
 */
export const getByCity = query({
  args: { cityId: v.id("cities") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cityOnboarding")
      .withIndex("by_city", (q) => q.eq("cityId", args.cityId))
      .order("desc")
      .first();
  },
});

/**
 * Get active/generating onboarding sessions
 */
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("cityOnboarding")
      .withIndex("by_status", (q) => q.eq("status", "generating"))
      .collect();
  },
});

/**
 * Check if a city has completed onboarding
 */
export const isComplete = query({
  args: { cityId: v.id("cities") },
  handler: async (ctx, args) => {
    const onboarding = await ctx.db
      .query("cityOnboarding")
      .withIndex("by_city", (q) => q.eq("cityId", args.cityId))
      .order("desc")
      .first();

    return onboarding?.status === "completed";
  },
});

/**
 * Delete onboarding record (for retry)
 */
export const remove = mutation({
  args: { onboardingId: v.id("cityOnboarding") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.onboardingId);
  },
});
