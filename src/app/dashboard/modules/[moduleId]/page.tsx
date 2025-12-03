"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import dynamic from "next/dynamic";
import { api } from "../../../../../convex/_generated/api";
import { useSelectedCity } from "@/hooks/useSelectedCity";
import { ModuleLayout } from "@/components/modules/ModuleLayout";
import { HotspotDetailDrawer } from "@/components/modules/HotspotDetailDrawer";
import { ActionCard } from "@/components/modules/ActionCard";
import { Icon } from "@/components/ui/icons";
import { ModulePageSkeleton } from "@/components/modules/ModulePageSkeleton";
import { modules, cities as fallbackCities } from "@/data/modules";
import { moduleHotspots, moduleInsights, HotspotData } from "@/data/hotspots";
import { notFound } from "next/navigation";
import { ModuleActionBar } from "@/components/modules/ModuleActionBar";
import { FilterPanel } from "@/components/modules/FilterPanel";
import { SearchBar } from "@/components/modules/SearchBar";
import { FilterChipsContainer, filterStateToChips, handleChipRemoval } from "@/components/modules/FilterChip";

// Dynamic imports for heavy map components - reduces initial bundle size
const MapVisualization = dynamic(
  () => import("@/components/modules/MapVisualization").then(mod => ({ default: mod.MapVisualization })),
  { ssr: false, loading: () => <MapLoadingSkeleton /> }
);

const HeatmapOverlay = dynamic(
  () => import("@/components/modules/HeatmapOverlay").then(mod => ({ default: mod.HeatmapOverlay })),
  { ssr: false }
);

const ShipTracker = dynamic(
  () => import("@/components/modules/ShipTracker").then(mod => ({ default: mod.ShipTracker })),
  { ssr: false }
);

const PlasticFlowMap = dynamic(
  () => import("@/components/modules/PlasticFlowMap").then(mod => ({ default: mod.PlasticFlowMap })),
  { ssr: false }
);

const OceanDebrisMap = dynamic(
  () => import("@/components/modules/OceanDebrisMap").then(mod => ({ default: mod.OceanDebrisMap })),
  { ssr: false }
);

const AirQualityMap = dynamic(
  () => import("@/components/modules/AirQualityMap").then(mod => ({ default: mod.AirQualityMap })),
  { ssr: false }
);

// Simple loading skeleton for map components
function MapLoadingSkeleton() {
  return (
    <div className="w-full h-full min-h-[400px] bg-[var(--background-secondary)] rounded-xl animate-pulse flex items-center justify-center">
      <div className="text-[var(--foreground-secondary)]">Loading map...</div>
    </div>
  );
}
import {
  FilterState,
  DEFAULT_FILTER_STATE,
  applyFilters,
  countActiveFilters,
} from "@/lib/filters";
import {
  exportToCSV,
  copyToClipboard,
  createShareableLink,
} from "@/lib/export";
import type { Hotspot, Module } from "@/types";
import { AlertConfigModal } from "@/components/modals/AlertConfigModal";
import { AICopilotDrawer } from "@/components/modules/AICopilotDrawer";

// Convert HotspotData to Hotspot format for export utilities
function convertToHotspot(data: HotspotData, moduleId: string): Hotspot {
  return {
    id: data.id,
    moduleId,
    location: {
      lat: data.lat,
      lng: data.lng,
      name: data.location,
    },
    severity: data.severity,
    title: data.label,
    description: data.description,
    aiInsights: data.recommendations.map((rec, i) => ({
      id: `insight-${data.id}-${i}`,
      type: "recommendation" as const,
      title: "AI Recommendation",
      description: rec,
      confidence: 0.85,
      dataSource: "Impact Atlas AI",
    })),
    actions: [],
  };
}

// Get value range config based on module type
function getValueRangeConfig(moduleId: string) {
  switch (moduleId) {
    case "urban-heat":
      return { label: "Temperature Anomaly", unit: "°C", min: 0, max: 10, step: 0.5 };
    case "coastal-plastic":
    case "ocean-plastic":
      return { label: "Plastic Volume", unit: "kg", min: 0, max: 5000, step: 100 };
    case "port-emissions":
      return { label: "CO₂ Emissions", unit: "t", min: 0, max: 1000, step: 50 };
    case "air-quality":
      return { label: "Air Quality Index", unit: "AQI", min: 0, max: 300, step: 10 };
    default:
      return undefined;
  }
}

export default function ModuleDetailPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [drawerHotspot, setDrawerHotspot] = useState<HotspotData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);

  // Get selected city - this makes the page reactive to city changes
  const { selectedCityId, selectedCity, selectedCitySlug, isHydrated } = useSelectedCity();

  // Get city coordinates for map center
  const cityCoordinates = useMemo(() => {
    if (selectedCity?.coordinates) {
      return selectedCity.coordinates;
    }
    // Fallback to static city data
    const fallbackCity = fallbackCities.find((c) => c.id === selectedCitySlug);
    return fallbackCity?.coordinates || { lat: 41.3851, lng: 2.1734 }; // Barcelona default
  }, [selectedCity, selectedCitySlug]);

  // Fetch hotspots from Convex for the selected city and module
  const convexHotspots = useQuery(
    api.hotspots.listByCityAndModuleSlug,
    selectedCityId ? { cityId: selectedCityId, moduleSlug: moduleId } : "skip"
  );

  // Filter state
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated] = useState(new Date());

  // Find module config (used in useMemo hooks below)
  const moduleConfig = modules.find((m) => m.id === moduleId);

  // Use Convex data if available, fallback to static data
  const insights = moduleInsights[moduleId] || [];

  // Convert Convex hotspots to HotspotData format for compatibility
  // All hooks must be called before any conditional returns
  const allHotspots: HotspotData[] = useMemo(() => {
    if (convexHotspots && convexHotspots.length > 0) {
      return convexHotspots.map((h) => ({
        id: h._id,
        label: h.name,
        location: h.address || h.neighborhood || `${h.coordinates.lat.toFixed(3)}, ${h.coordinates.lng.toFixed(3)}`,
        lat: h.coordinates.lat,
        lng: h.coordinates.lng,
        severity: h.severity,
        value: h.displayValue || "",
        description: h.description,
        trend: h.metrics[0]?.trend,
        lastUpdated: new Date(h.lastUpdated).toLocaleDateString(),
        recommendations: [], // AI insights would come from separate query
      }));
    }
    // Fallback to static data
    return moduleHotspots[moduleId] || [];
  }, [convexHotspots, moduleId]);

  // Apply filters to hotspots
  const filteredHotspots = useMemo(
    () => applyFilters(allHotspots, filters),
    [allHotspots, filters]
  );

  // Convert to export-compatible format
  const exportableHotspots = useMemo(
    () => filteredHotspots.map((h) => convertToHotspot(h, moduleId)),
    [filteredHotspots, moduleId]
  );

  // Active filter count
  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  const selectedHotspotData = filteredHotspots.find((h) => h.id === selectedHotspot);

  // Handlers for the drawer
  const handleViewDetails = useCallback((hotspot: HotspotData) => {
    setDrawerHotspot(hotspot);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleExportData = useCallback((hotspot: HotspotData) => {
    const exportData = [{
      ID: hotspot.id,
      Label: hotspot.label,
      Location: hotspot.location,
      Severity: hotspot.severity,
      Value: hotspot.value || "N/A",
      Description: hotspot.description,
      Trend: hotspot.trend || "N/A",
      "Last Updated": hotspot.lastUpdated || "N/A",
      Recommendations: hotspot.recommendations.join("; "),
    }];
    exportToCSV(exportData, `hotspot-${hotspot.id}`);
    toast.success("Exported hotspot data", { description: `${hotspot.label} exported to CSV` });
  }, []);

  const handleShare = useCallback(async (hotspot: HotspotData) => {
    const shareUrl = createShareableLink({
      moduleId,
      view: "map",
      filters: { hotspotId: hotspot.id },
    });
    const result = await copyToClipboard(shareUrl);
    if (result.success) {
      toast.success("Link copied!", { description: "Share this link to show this hotspot" });
    } else {
      toast.error("Failed to copy link");
    }
  }, [moduleId]);

  const handleAddToActionPlan = useCallback((hotspot: HotspotData) => {
    // TODO: Integrate with action plan feature
    toast.success("Added to Action Plan", {
      description: `${hotspot.label} and its recommendations have been added`,
      action: { label: "View Plan", onClick: () => window.location.href = "/dashboard/plans" },
    });
  }, []);

  const handleApplyRecommendation = useCallback((hotspot: HotspotData, recommendation: string) => {
    // TODO: Integrate with action plan feature
    toast.success("Recommendation applied", {
      description: recommendation.substring(0, 50) + "...",
      action: { label: "View Plan", onClick: () => window.location.href = "/dashboard/plans" },
    });
  }, []);

  // Filter handlers
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, search: query }));
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Data refreshed", { description: "Latest data loaded successfully" });
    }, 1500);
  }, []);

  // Early returns after all hooks have been called
  if (!moduleConfig) {
    notFound();
  }

  // Show skeleton while loading
  // 1. Not hydrated yet (localStorage loading)
  // 2. We have a selected city ID but Convex data is still loading
  const isConvexLoading = selectedCityId && convexHotspots === undefined;
  if (!isHydrated || isConvexLoading) {
    return <ModulePageSkeleton />;
  }

  return (
    <ModuleLayout module={moduleConfig}>
      {/* Module Action Bar */}
      <ModuleActionBar
        module={moduleConfig as Module}
        hotspots={exportableHotspots}
        cityId={selectedCityId || "barcelona"}
        cityName={selectedCity?.name || "Barcelona"}
        currentView="map"
        isFilterOpen={isFilterPanelOpen}
        onFilterToggle={() => setIsFilterPanelOpen(true)}
        activeFilterCount={activeFilterCount}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        className="mb-6"
      />

      {/* Search and Filter Chips Row */}
      <div className="mb-6 space-y-3">
        <SearchBar
          value={filters.search}
          onChange={handleSearchChange}
          placeholder={`Search ${moduleConfig.title.toLowerCase()} hotspots...`}
          resultsCount={filteredHotspots.length}
          totalCount={allHotspots.length}
        />

        {/* Active filter chips */}
        <FilterChipsContainer
          chips={filterStateToChips(filters)}
          onRemoveChip={(chipId) => setFilters(handleChipRemoval(chipId, filters))}
          onClearAll={() => setFilters(DEFAULT_FILTER_STATE)}
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Map visualization - takes 3 columns */}
        <div className="lg:col-span-3">
          {/* Module-specific advanced visualizations */}
          {moduleId === "urban-heat" && (
            <HeatmapOverlay key={selectedCitySlug} cityId={selectedCitySlug} height={560} className="mb-6" />
          )}

          {moduleId === "port-emissions" && (
            <ShipTracker key={selectedCitySlug} cityId={selectedCitySlug} height={560} className="mb-6" />
          )}

          {moduleId === "coastal-plastic" && (
            <PlasticFlowMap key={selectedCitySlug} cityId={selectedCitySlug} height={560} className="mb-6" />
          )}

          {moduleId === "ocean-plastic" && (
            <OceanDebrisMap key={selectedCitySlug} cityId={selectedCitySlug} height={560} className="mb-6" />
          )}

          {moduleId === "air-quality" && (
            <AirQualityMap key={selectedCitySlug} cityId={selectedCitySlug} height={560} className="mb-6" />
          )}

          {/* Standard hotspot map for all modules */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background-tertiary)]">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="font-semibold text-[var(--foreground)]">Hotspot Map</h2>
              <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live data
              </div>
            </div>
            <div className="h-[500px] relative">
              <MapVisualization
                key={selectedCitySlug} // Force re-render when city changes
                moduleId={moduleId}
                hotspots={filteredHotspots}
                selectedHotspot={selectedHotspot}
                onHotspotClick={(hotspot) => setSelectedHotspot(hotspot.id)}
                onViewDetails={handleViewDetails}
                center={cityCoordinates}
              />
            </div>
          </div>

          {/* Selected hotspot detail */}
          {selectedHotspotData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-6 rounded-xl border border-[var(--accent)] bg-[var(--accent-bg)]"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    {selectedHotspotData.label}
                  </h3>
                  <p className="text-sm text-[var(--foreground-secondary)] flex items-center gap-1">
                    <Icon name="mapPin" className="w-4 h-4" />
                    {selectedHotspotData.location}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="p-1.5 rounded-lg hover:bg-[var(--background-secondary)] transition-colors"
                >
                  <Icon name="x" className="w-4 h-4 text-[var(--foreground-muted)]" />
                </button>
              </div>

              <p className="text-sm text-[var(--foreground-secondary)] mb-4">
                {selectedHotspotData.description}
              </p>

              {selectedHotspotData.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                    <Icon name="zap" className="w-4 h-4 text-[var(--accent)]" />
                    AI Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {selectedHotspotData.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground-secondary)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Action cards sidebar - takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--foreground)]">AI Insights</h2>
            <span className="text-xs text-[var(--foreground-muted)]">
              {insights.length} insights
            </span>
          </div>

          {/* Hotspot cards */}
          <div className="space-y-3">
            {filteredHotspots.slice(0, 3).map((hotspot) => (
              <ActionCard
                key={hotspot.id}
                type="hotspot"
                title={hotspot.label}
                description={hotspot.description}
                severity={hotspot.severity}
                location={hotspot.location}
                isSelected={selectedHotspot === hotspot.id}
                onClick={() => setSelectedHotspot(hotspot.id)}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--border)] my-4" />

          {/* Insight cards */}
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <ActionCard
                key={index}
                type={insight.type}
                title={insight.title}
                description={insight.description}
                confidence={insight.confidence}
                impact={insight.impact}
                effort={insight.effort}
                actions={
                  insight.type === "recommendation"
                    ? [
                        {
                          label: "Create Action Plan",
                          onClick: () => {
                            toast.success("Creating action plan...", {
                              description: insight.title,
                              action: {
                                label: "Go to Plans",
                                onClick: () => window.location.href = "/dashboard/plans",
                              },
                            });
                          },
                        },
                        {
                          label: "Learn More",
                          onClick: () => {
                            toast.info(insight.title, {
                              description: insight.description,
                              duration: 8000,
                            });
                          },
                        },
                      ]
                    : undefined
                }
              />
            ))}
          </div>

          {/* Quick actions */}
          <div className="p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  exportToCSV(
                    filteredHotspots.map((h) => ({
                      ID: h.id,
                      Label: h.label,
                      Location: h.location,
                      Severity: h.severity,
                      Value: h.value || "N/A",
                      Description: h.description,
                      Trend: h.trend || "N/A",
                    })),
                    `${moduleId}-hotspots-report`
                  );
                  toast.success("Report exported", { description: `${filteredHotspots.length} hotspots exported to CSV` });
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] hover:border-[var(--accent-muted)] transition-colors text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
              >
                <Icon name="download" className="w-4 h-4" />
                Export Report
              </button>
              <button
                onClick={async () => {
                  const shareUrl = createShareableLink({
                    moduleId,
                    view: "map",
                    filters: { city: selectedCitySlug },
                  });
                  const result = await copyToClipboard(shareUrl);
                  if (result.success) {
                    toast.success("Link copied!", { description: "Share this link to show this view" });
                  } else {
                    toast.error("Failed to copy link");
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] hover:border-[var(--accent-muted)] transition-colors text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
              >
                <Icon name="share" className="w-4 h-4" />
                Share View
              </button>
              <button
                onClick={() => setIsAICopilotOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] hover:border-[var(--accent-muted)] transition-colors text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
              >
                <Icon name="chat" className="w-4 h-4" />
                Ask AI
              </button>
              <button
                onClick={() => setIsAlertModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] hover:border-[var(--accent-muted)] transition-colors text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
              >
                <Icon name="target" className="w-4 h-4" />
                Set Alert
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hotspot Detail Drawer */}
      <HotspotDetailDrawer
        hotspot={drawerHotspot}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onExportData={handleExportData}
        onShare={handleShare}
        onAddToActionPlan={handleAddToActionPlan}
        onApplyRecommendation={handleApplyRecommendation}
      />

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApply={() => {}}
        resultsCount={filteredHotspots.length}
        totalCount={allHotspots.length}
        valueRangeConfig={getValueRangeConfig(moduleId)}
      />

      {/* Alert Config Modal */}
      <AlertConfigModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        moduleId={moduleId}
        moduleName={moduleConfig.title}
      />

      {/* AI Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isAICopilotOpen}
        onClose={() => setIsAICopilotOpen(false)}
        moduleId={moduleId}
        moduleName={moduleConfig.title}
        context={{
          hotspotCount: filteredHotspots.length,
          cityName: selectedCity?.name || "Selected Area",
        }}
      />
    </ModuleLayout>
  );
}
