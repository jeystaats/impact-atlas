import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getCurrentUser, requireCurrentUser } from "./model/auth";

/**
 * Get the current authenticated user
 */
export const me = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

/**
 * Get a user by ID (for admin or profile viewing)
 */
export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * Update user preferences
 */
export const updatePreferences = mutation({
  args: {
    preferences: v.object({
      defaultCityId: v.optional(v.id("cities")),
      favoriteModules: v.optional(v.array(v.string())),
      notificationsEnabled: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    const updatedPreferences = {
      ...user.preferences,
      ...args.preferences,
    };

    await ctx.db.patch(user._id, {
      preferences: updatedPreferences,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Set the user's default city
 */
export const setDefaultCity = mutation({
  args: {
    cityId: v.id("cities"),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    // Verify city exists
    const city = await ctx.db.get(args.cityId);
    if (!city) {
      throw new Error("City not found");
    }

    await ctx.db.patch(user._id, {
      preferences: {
        ...user.preferences,
        defaultCityId: args.cityId,
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Complete onboarding
 */
export const completeOnboarding = mutation({
  args: {
    defaultCityId: v.optional(v.id("cities")),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    const updates: Record<string, unknown> = {
      onboardingCompleted: true,
      updatedAt: Date.now(),
    };

    if (args.defaultCityId) {
      updates.preferences = {
        ...user.preferences,
        defaultCityId: args.defaultCityId,
      };
    }

    await ctx.db.patch(user._id, updates);

    return { success: true };
  },
});

/**
 * Create or update a user from Clerk webhook (internal)
 */
export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      role: "user",
      preferences: {
        defaultCityId: undefined,
        favoriteModules: [],
        notificationsEnabled: true,
      },
      onboardingCompleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Delete a user (internal - from Clerk webhook)
 */
export const deleteByClerkId = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    }

    return { success: true };
  },
});
