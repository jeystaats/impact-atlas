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
 * Update user preferences (partial update)
 */
export const updatePreferences = mutation({
  args: {
    defaultCitySlug: v.optional(v.string()),
    temperatureUnit: v.optional(v.union(v.literal("celsius"), v.literal("fahrenheit"))),
    mapStyle: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("satellite"))),
    notifications: v.optional(v.object({
      hotspotAlerts: v.boolean(),
      weeklyReports: v.boolean(),
      quickWinUpdates: v.boolean(),
      aiInsights: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    // Build updated preferences object
    const updatedPreferences = { ...user.preferences };

    if (args.defaultCitySlug !== undefined) {
      updatedPreferences.defaultCitySlug = args.defaultCitySlug;
    }
    if (args.temperatureUnit !== undefined) {
      updatedPreferences.temperatureUnit = args.temperatureUnit;
    }
    if (args.mapStyle !== undefined) {
      updatedPreferences.mapStyle = args.mapStyle;
    }
    if (args.notifications !== undefined) {
      updatedPreferences.notifications = args.notifications;
    }

    await ctx.db.patch(user._id, {
      preferences: updatedPreferences,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update a single notification setting
 */
export const updateNotificationSetting = mutation({
  args: {
    key: v.union(
      v.literal("hotspotAlerts"),
      v.literal("weeklyReports"),
      v.literal("quickWinUpdates"),
      v.literal("aiInsights")
    ),
    value: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    const currentNotifications = user.preferences.notifications ?? {
      hotspotAlerts: true,
      weeklyReports: true,
      quickWinUpdates: false,
      aiInsights: true,
    };

    const updatedNotifications = {
      ...currentNotifications,
      [args.key]: args.value,
    };

    await ctx.db.patch(user._id, {
      preferences: {
        ...user.preferences,
        notifications: updatedNotifications,
      },
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
 * Sync user from Clerk on sign-in (called from client)
 * This replaces the webhook approach - user data is synced when they authenticate
 */
export const syncUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = identity.subject;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        updatedAt: Date.now(),
      });
      return { userId: existingUser._id, isNew: false };
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      role: "user",
      preferences: {
        defaultCityId: undefined,
        defaultCitySlug: "amsterdam",
        favoriteModules: [],
        temperatureUnit: "celsius",
        mapStyle: "dark",
        notifications: {
          hotspotAlerts: true,
          weeklyReports: true,
          quickWinUpdates: false,
          aiInsights: true,
        },
      },
      onboardingCompleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { userId, isNew: true };
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
        defaultCitySlug: "amsterdam",
        favoriteModules: [],
        temperatureUnit: "celsius",
        mapStyle: "dark",
        notifications: {
          hotspotAlerts: true,
          weeklyReports: true,
          quickWinUpdates: false,
          aiInsights: true,
        },
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
