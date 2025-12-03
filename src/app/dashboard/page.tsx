"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CitySearchInput } from "@/components/dashboard/CitySearchInput";
import { EnhancedCityLoadingModal } from "@/components/loading";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { QuickWinsSummary } from "@/components/dashboard/QuickWinsSummary";
import { StatCard } from "@/components/dashboard/StatCard";
import { CityOverviewMap } from "@/components/dashboard/CityOverviewMap";
import { useSelectedCity } from "@/hooks/useSelectedCity";
import { useModulesForCity, useDashboardStats } from "@/hooks/useConvex";
import { useCityOnboarding } from "@/hooks/useCityOnboarding";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { timeAgo } from "@/lib/utils";

// Fallback data for when Convex is loading or unavailable
import { getModulesForCity, cities as fallbackCities } from "@/data/modules";
import { dashboardStats as fallbackStats, cityStats as fallbackCityStats } from "@/data/dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const {
    selectedCitySlug,
    selectedCity,
    selectedCityId,
    cities,
    isLoading: citiesLoading,
    isHydrated,
    setCity
  } = useSelectedCity();

  // City onboarding hook for new cities
  const {
    isOnboarding,
    cityId: onboardingCityId,
    cityName: onboardingCityName,
    country: onboardingCountry,
    progress: onboardingProgress,
    startOnboarding,
    closeOnboarding,
    isComplete: onboardingComplete,
  } = useCityOnboarding();

  // Fetch modules with city-specific stats from Convex
  const modulesData = useModulesForCity(selectedCityId);

  // Fetch dashboard stats from Convex
  const dashboardData = useDashboardStats(selectedCityId);

  // Fetch recent activity from Convex
  const recentActivity = useQuery(
    api.activity.getRecent,
    selectedCityId ? { cityId: selectedCityId, limit: 5 } : "skip"
  );

  // Determine if we're using Convex data or fallbacks
  const useConvexData = modulesData !== undefined && selectedCityId;

  // Get current city (from Convex or fallback)
  const currentCity = selectedCity
    ? { id: selectedCity.slug, name: selectedCity.name, country: selectedCity.country, population: selectedCity.population, coordinates: selectedCity.coordinates }
    : fallbackCities.find((c) => c.id === selectedCitySlug) || fallbackCities[0];

  // Get modules (from Convex or fallback with city-specific stats)
  const modules = useConvexData && modulesData
    ? modulesData.map((m: { slug: string; name: string; description: string; icon: string; color: string; status: "active" | "beta" | "coming-soon"; cityStats?: { totalHotspots?: number; criticalHotspots?: number; totalQuickWins?: number } }) => ({
        id: m.slug,
        title: m.name,
        description: m.description,
        icon: m.icon.toLowerCase(),
        color: m.color,
        metrics: [
          {
            label: "Hotspots",
            value: m.cityStats?.totalHotspots ?? 0,
            trend: m.cityStats?.criticalHotspots && m.cityStats.criticalHotspots > 0 ? "up" as const : "neutral" as const,
          },
          {
            label: "Quick Wins",
            value: m.cityStats?.totalQuickWins ?? 0,
          },
        ],
        quickWinsCount: m.cityStats?.totalQuickWins ?? 0,
        status: m.status,
      }))
    : getModulesForCity(selectedCitySlug);

  // Get stats (from Convex or fallback)
  const stats = useConvexData && dashboardData
    ? [
        {
          label: "Active Modules",
          value: dashboardData.summary.activeModules,
          icon: "dashboard" as const,
          color: "#0D9488",
          trend: "neutral" as const,
          sparklineData: dashboardData.sparklineData,
        },
        {
          label: "Quick Wins",
          value: dashboardData.summary.totalQuickWins,
          icon: "zap" as const,
          color: "#10B981",
          trend: "up" as const,
          trendValue: `+${dashboardData.quickWinsByImpact.high}`,
          sparklineData: dashboardData.sparklineData,
        },
        {
          label: "Hotspots",
          value: dashboardData.summary.totalHotspots,
          icon: "target" as const,
          color: "#F59E0B",
          trend: dashboardData.hotspotsBySeverity.critical > 0 ? "up" as const : "down" as const,
          trendValue: dashboardData.hotspotsBySeverity.critical > 0
            ? `${dashboardData.hotspotsBySeverity.critical} critical`
            : "stable",
          sparklineData: dashboardData.sparklineData,
        },
        {
          label: "AI Insights",
          value: dashboardData.summary.aiInsights,
          icon: "sparkles" as const,
          color: "#8B5CF6",
          trend: "up" as const,
          sparklineData: dashboardData.sparklineData,
        },
      ]
    : (fallbackCityStats[selectedCitySlug] || fallbackStats);

  // Handle selecting an existing city
  const handleCitySelect = (city: { slug: string }) => {
    setCity(city.slug);
  };

  // Handle selecting a new city (starts onboarding)
  const handleNewCitySelect = async (city: {
    slug: string;
    name: string;
    country: string;
    coordinates?: { lat: number; lng: number };
    population: number;
  }) => {
    if (!city.coordinates) {
      console.error("City coordinates required for onboarding");
      return;
    }

    try {
      const newCityId = await startOnboarding({
        slug: city.slug,
        name: city.name,
        country: city.country,
        coordinates: city.coordinates,
        population: city.population,
      });

      // After onboarding completes, switch to the new city
      if (newCityId) {
        setCity(city.slug);
      }
    } catch (error) {
      console.error("Failed to start city onboarding:", error);
    }
  };

  // Handle entering dashboard after onboarding
  const handleEnterDashboard = () => {
    closeOnboarding();
    // Refresh the page to load new city data
    router.refresh();
  };

  // Determine if Convex data is still loading
  // We show skeleton if:
  // 1. Not hydrated yet (localStorage loading)
  // 2. We have a selected city ID but Convex data is still undefined (first load)
  const isConvexLoading = selectedCityId && (modulesData === undefined || dashboardData === undefined);

  // Show skeleton while hydrating or waiting for Convex data
  if (!isHydrated || isConvexLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Enhanced City Loading Modal */}
      <EnhancedCityLoadingModal
        isOpen={isOnboarding}
        cityName={onboardingCityName}
        country={onboardingCountry}
        progress={onboardingProgress}
        onClose={closeOnboarding}
        onEnterDashboard={handleEnterDashboard}
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]"
          >
            Welcome back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--foreground-secondary)] mt-1"
          >
            Here's what's happening in {currentCity.name}
          </motion.p>
        </div>
        <CitySearchInput
          selectedCity={selectedCitySlug}
          onCitySelect={handleCitySelect}
          onNewCitySelect={handleNewCitySelect}
          existingCities={cities}
        />
      </div>

      {/* Stats row - horizontal scroll on mobile, grid on desktop */}
      <div className="flex lg:grid lg:grid-cols-4 gap-4 mb-8 overflow-x-auto pb-2 lg:pb-0 snap-x snap-mandatory scrollbar-hide">
        {stats.map((stat, index) => (
          <div key={stat.label} className="min-w-[160px] lg:min-w-0 snap-start">
            <StatCard stat={stat} index={index} />
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Modules grid - takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Modules</h2>
            <Link href="/dashboard/quick-wins" className="text-sm text-[var(--accent)] hover:underline">
              View all
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {modules.map((module: typeof modules[number], index: number) => (
              <ModuleCard key={module.id} module={module} index={index} />
            ))}
          </div>
        </div>

        {/* Sidebar - Quick Wins Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Quick Wins</h2>
            <QuickWinsSummary cityId={selectedCityId} />
          </div>

          {/* Recent activity */}
          <div>
            <h3 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-wider mb-3">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)]"
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1.5"
                      style={{
                        backgroundColor:
                          activity.severity === "critical"
                            ? "#EF4444"
                            : activity.severity === "high"
                              ? "#F59E0B"
                              : activity.type === "quick_win_completed"
                                ? "#10B981"
                                : "var(--accent)",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--foreground)]">{activity.action}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        {activity.module} • {timeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : recentActivity?.length === 0 ? (
                <p className="text-sm text-[var(--foreground-muted)] py-4 text-center">
                  No recent activity
                </p>
              ) : (
                // Loading state
                [...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] animate-pulse"
                  >
                    <div className="w-2 h-2 rounded-full bg-[var(--foreground-muted)] mt-1.5 opacity-30" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-[var(--foreground-muted)] rounded opacity-20 w-3/4" />
                      <div className="h-3 bg-[var(--foreground-muted)] rounded opacity-20 w-1/2" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* City Overview Map - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            City Overview - All Hotspots
          </h2>
          <span className="text-sm text-[var(--foreground-muted)]">
            Showing data for {currentCity.name}
          </span>
        </div>
        <CityOverviewMap key={selectedCitySlug} cityId={selectedCitySlug} height={450} />
      </motion.div>
    </div>
  );
}
