"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// ============================================
// CITIES
// ============================================

/**
 * Get all active cities
 */
export function useCities() {
  return useQuery(api.cities.list, { activeOnly: true });
}

/**
 * Get a city by slug
 */
export function useCityBySlug(slug: string) {
  return useQuery(api.cities.getBySlug, { slug });
}

/**
 * Get a city by ID
 */
export function useCity(cityId: Id<"cities"> | undefined) {
  return useQuery(
    api.cities.getById,
    cityId ? { cityId } : "skip"
  );
}

// ============================================
// MODULES
// ============================================

/**
 * Get all active modules
 */
export function useModules() {
  return useQuery(api.modules.list, { activeOnly: true });
}

/**
 * Get a module by slug
 */
export function useModuleBySlug(slug: string) {
  return useQuery(api.modules.getBySlug, { slug });
}

/**
 * Get modules with city-specific stats
 */
export function useModulesForCity(cityId: Id<"cities"> | undefined) {
  return useQuery(
    api.modules.getForCity,
    cityId ? { cityId } : "skip"
  );
}

// ============================================
// HOTSPOTS
// ============================================

/**
 * Get hotspots for a city
 */
export function useHotspotsByCity(
  cityId: Id<"cities"> | undefined,
  options?: {
    severity?: "low" | "medium" | "high" | "critical";
    status?: "active" | "monitoring" | "resolved";
    limit?: number;
  }
) {
  return useQuery(
    api.hotspots.listByCity,
    cityId ? { cityId, ...options } : "skip"
  );
}

/**
 * Get hotspots for a city and module
 */
export function useHotspotsByCityModule(
  cityId: Id<"cities"> | undefined,
  moduleId: Id<"modules"> | undefined,
  limit?: number
) {
  return useQuery(
    api.hotspots.listByCityModule,
    cityId && moduleId ? { cityId, moduleId, limit } : "skip"
  );
}

/**
 * Get a hotspot with its insights
 */
export function useHotspotWithInsights(hotspotId: Id<"hotspots"> | undefined) {
  return useQuery(
    api.hotspots.getWithInsights,
    hotspotId ? { hotspotId } : "skip"
  );
}

// ============================================
// QUICK WINS
// ============================================

/**
 * Get quick wins with filters
 */
export function useQuickWins(options?: {
  cityId?: Id<"cities">;
  moduleId?: Id<"modules">;
  impact?: "low" | "medium" | "high";
  effort?: "low" | "medium" | "high";
  search?: string;
  limit?: number;
}) {
  const { cityId, moduleId, ...filters } = options ?? {};

  // Call both hooks unconditionally, but skip one based on condition
  const byModule = useQuery(api.quickWins.listByModule, moduleId ? { moduleId, ...filters } : "skip");
  const byCity = useQuery(api.quickWins.listByCity, !moduleId ? { cityId, ...filters } : "skip");

  return moduleId ? byModule : byCity;
}

/**
 * Get quick wins by module
 */
export function useQuickWinsByModule(
  moduleId: Id<"modules"> | undefined,
  options?: {
    impact?: "low" | "medium" | "high";
    limit?: number;
  }
) {
  return useQuery(
    api.quickWins.listByModule,
    moduleId ? { moduleId, ...options } : "skip"
  );
}

/**
 * Get user's quick win progress
 */
export function useQuickWinProgress(options?: {
  cityId?: Id<"cities">;
  moduleId?: Id<"modules">;
}) {
  return useQuery(api.quickWins.getUserProgress, options ?? {});
}

/**
 * Check if a quick win is completed
 */
export function useIsQuickWinCompleted(quickWinId: Id<"quickWins"> | undefined) {
  return useQuery(
    api.quickWins.isCompleted,
    quickWinId ? { quickWinId } : "skip"
  );
}

/**
 * Complete a quick win
 */
export function useCompleteQuickWin() {
  return useMutation(api.quickWins.complete);
}

/**
 * Uncomplete a quick win
 */
export function useUncompleteQuickWin() {
  return useMutation(api.quickWins.uncomplete);
}

// ============================================
// ACTION PLANS
// ============================================

/**
 * Get current user's action plans
 */
export function useMyActionPlans(options?: {
  status?: "draft" | "active" | "completed" | "archived";
  cityId?: Id<"cities">;
}) {
  return useQuery(api.actionPlans.listMine, options ?? {});
}

/**
 * Get an action plan by ID
 */
export function useActionPlan(planId: Id<"actionPlans"> | undefined) {
  return useQuery(
    api.actionPlans.getById,
    planId ? { planId } : "skip"
  );
}

/**
 * Create an action plan
 */
export function useCreateActionPlan() {
  return useMutation(api.actionPlans.create);
}

/**
 * Update an action plan
 */
export function useUpdateActionPlan() {
  return useMutation(api.actionPlans.update);
}

/**
 * Update action plan status
 */
export function useUpdateActionPlanStatus() {
  return useMutation(api.actionPlans.updateStatus);
}

/**
 * Add quick win to action plan
 */
export function useAddQuickWinToPlan() {
  return useMutation(api.actionPlans.addQuickWin);
}

/**
 * Remove quick win from action plan
 */
export function useRemoveQuickWinFromPlan() {
  return useMutation(api.actionPlans.removeQuickWin);
}

/**
 * Delete an action plan
 */
export function useDeleteActionPlan() {
  return useMutation(api.actionPlans.remove);
}

// ============================================
// STATS
// ============================================

/**
 * Get dashboard stats for a city
 */
export function useDashboardStats(cityId: Id<"cities"> | undefined) {
  return useQuery(
    api.stats.getDashboard,
    cityId ? { cityId } : "skip"
  );
}

/**
 * Get stats for a specific module in a city
 */
export function useModuleStats(
  cityId: Id<"cities"> | undefined,
  moduleId: Id<"modules"> | undefined
) {
  return useQuery(
    api.stats.getModuleStats,
    cityId && moduleId ? { cityId, moduleId } : "skip"
  );
}

/**
 * Get current user's stats
 */
export function useUserStats() {
  return useQuery(api.stats.getUserStats, {});
}

// ============================================
// USERS
// ============================================

/**
 * Get current user
 */
export function useCurrentUser() {
  return useQuery(api.users.me, {});
}

/**
 * Update user preferences
 */
export function useUpdatePreferences() {
  return useMutation(api.users.updatePreferences);
}

/**
 * Update a single notification setting
 */
export function useUpdateNotificationSetting() {
  return useMutation(api.users.updateNotificationSetting);
}

/**
 * Set default city
 */
export function useSetDefaultCity() {
  return useMutation(api.users.setDefaultCity);
}

/**
 * Sync user to Convex (call on sign-in)
 */
export function useSyncUser() {
  return useMutation(api.users.syncUser);
}

// ============================================
// AI INSIGHTS
// ============================================

/**
 * Get high priority insights
 */
export function useHighPriorityInsights(
  cityId?: Id<"cities">,
  limit?: number
) {
  return useQuery(api.aiInsights.listHighPriority, { cityId, limit });
}

/**
 * Get insights for a hotspot
 */
export function useHotspotInsights(hotspotId: Id<"hotspots"> | undefined) {
  return useQuery(
    api.aiInsights.listByHotspot,
    hotspotId ? { hotspotId } : "skip"
  );
}
