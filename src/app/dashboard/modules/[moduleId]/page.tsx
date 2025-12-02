"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ModuleLayout } from "@/components/modules/ModuleLayout";
import { MapVisualization } from "@/components/modules/MapVisualization";
import { HeatmapOverlay } from "@/components/modules/HeatmapOverlay";
import { ShipTracker } from "@/components/modules/ShipTracker";
import { PlasticFlowMap } from "@/components/modules/PlasticFlowMap";
import { HotspotDetailDrawer } from "@/components/modules/HotspotDetailDrawer";
import { ActionCard } from "@/components/modules/ActionCard";
import { Icon } from "@/components/ui/icons";
import { modules } from "@/data/modules";
import { moduleHotspots, moduleInsights, HotspotData } from "@/data/hotspots";
import { notFound } from "next/navigation";

export default function ModuleDetailPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [drawerHotspot, setDrawerHotspot] = useState<HotspotData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const module = modules.find((m) => m.id === moduleId);
  if (!module) {
    notFound();
  }

  const hotspots = moduleHotspots[moduleId] || [];
  const insights = moduleInsights[moduleId] || [];

  const selectedHotspotData = hotspots.find((h) => h.id === selectedHotspot);

  // Handlers for the drawer
  const handleViewDetails = useCallback((hotspot: HotspotData) => {
    setDrawerHotspot(hotspot);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleExportData = useCallback((hotspot: HotspotData) => {
    console.log("Exporting data for:", hotspot.label);
    // Implement export logic
  }, []);

  const handleShare = useCallback((hotspot: HotspotData) => {
    console.log("Sharing:", hotspot.label);
    // Implement share logic
  }, []);

  const handleAddToActionPlan = useCallback((hotspot: HotspotData) => {
    console.log("Adding to action plan:", hotspot.label);
    // Implement action plan logic
  }, []);

  const handleApplyRecommendation = useCallback((hotspot: HotspotData, recommendation: string) => {
    console.log("Applying recommendation:", recommendation, "for:", hotspot.label);
    // Implement recommendation apply logic
  }, []);

  return (
    <ModuleLayout module={module}>
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Map visualization - takes 3 columns */}
        <div className="lg:col-span-3">
          {/* Module-specific advanced visualizations */}
          {moduleId === "urban-heat" && (
            <HeatmapOverlay height={560} className="mb-6" />
          )}

          {moduleId === "port-emissions" && (
            <ShipTracker height={560} className="mb-6" />
          )}

          {moduleId === "coastal-plastic" && (
            <PlasticFlowMap height={560} className="mb-6" />
          )}

          {/* Standard hotspot map for all modules */}
          <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--background-tertiary)]">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="font-semibold text-[var(--foreground)]">Hotspot Map</h2>
              <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live data
              </div>
            </div>
            <div className="h-[500px]">
              <MapVisualization
                moduleId={moduleId}
                hotspots={hotspots}
                selectedHotspot={selectedHotspot}
                onHotspotClick={(hotspot) => setSelectedHotspot(hotspot.id)}
                onViewDetails={handleViewDetails}
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
            {hotspots.slice(0, 3).map((hotspot) => (
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
                        { label: "Create Action Plan", onClick: () => {} },
                        { label: "Learn More", onClick: () => {} },
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
              {[
                { icon: "download" as const, label: "Export Report" },
                { icon: "share" as const, label: "Share View" },
                { icon: "chat" as const, label: "Ask AI" },
                { icon: "target" as const, label: "Set Alert" },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] hover:border-[var(--accent-muted)] transition-colors text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
                >
                  <Icon name={action.icon} className="w-4 h-4" />
                  {action.label}
                </button>
              ))}
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
    </ModuleLayout>
  );
}
