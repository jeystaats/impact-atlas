"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CitySelector } from "@/components/dashboard/CitySelector";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { QuickWinsSummary } from "@/components/dashboard/QuickWinsSummary";
import { StatCard } from "@/components/dashboard/StatCard";
import { CityOverviewMap } from "@/components/dashboard/CityOverviewMap";
import { useSelectedCity } from "@/hooks/useSelectedCity";
import { useModulesForCity, useDashboardStats } from "@/hooks/useConvex";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

// Fallback data for when Convex is loading or unavailable
import { modules as fallbackModules, cities as fallbackCities } from "@/data/modules";
import { dashboardStats as fallbackStats, cityStats as fallbackCityStats } from "@/data/dashboard";

export default function DashboardPage() {
  const {
    selectedCitySlug,
    selectedCity,
    selectedCityId,
    cities,
    isLoading: citiesLoading,
    isHydrated,
    setCity
  } = useSelectedCity();

  // Fetch modules with city-specific stats from Convex
  const modulesData = useModulesForCity(selectedCityId);

  // Fetch dashboard stats from Convex
  const dashboardData = useDashboardStats(selectedCityId);

  // Determine if we're using Convex data or fallbacks
  const useConvexData = modulesData !== undefined && selectedCityId;

  // Get current city (from Convex or fallback)
  const currentCity = selectedCity
    ? { id: selectedCity.slug, name: selectedCity.name, country: selectedCity.country, population: selectedCity.population, coordinates: selectedCity.coordinates }
    : fallbackCities.find((c) => c.id === selectedCitySlug) || fallbackCities[0];

  // Get modules (from Convex or fallback)
  const modules = useConvexData && modulesData
    ? modulesData.map((m) => ({
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
    : fallbackModules;

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

  const handleCityChange = (citySlug: string) => {
    setCity(citySlug);
  };

  // Show skeleton while hydrating
  if (!isHydrated) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 lg:p-8">
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
        <CitySelector
          selectedCity={selectedCitySlug}
          onCityChange={handleCityChange}
          cities={cities.length > 0 ? cities : undefined}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} index={index} />
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
            {modules.map((module, index) => (
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
              {[
                { action: "New heat island detected", module: "Urban Heat", time: "2 min ago" },
                { action: "Plastic forecast updated", module: "Coastal Plastic", time: "15 min ago" },
                { action: "Port emissions spike", module: "Port Emissions", time: "1 hr ago" },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)]"
                >
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--foreground)]">{activity.action}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {activity.module} • {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
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
        <CityOverviewMap cityId={selectedCitySlug} height={450} />
      </motion.div>
    </div>
  );
}
