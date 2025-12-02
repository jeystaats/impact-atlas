"use client";

import { useState, useMemo } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import { motion, AnimatePresence } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";
import { moduleHotspots, HotspotData } from "@/data/hotspots";
import { modules } from "@/data/modules";
import { cities } from "@/data/modules";
import { Icon } from "@/components/ui/icons";
import { useMapStyle } from "@/hooks/useMapStyle";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface CityOverviewMapProps {
  cityId?: string;
  className?: string;
  height?: number;
}

interface CombinedHotspot extends HotspotData {
  moduleId: string;
  moduleColor: string;
  moduleName: string;
}

export function CityOverviewMap({
  cityId = "barcelona",
  className = "",
  height = 400,
}: CityOverviewMapProps) {
  const [selectedHotspot, setSelectedHotspot] = useState<CombinedHotspot | null>(null);
  const [activeModules, setActiveModules] = useState<Set<string>>(
    new Set(modules.map((m) => m.id))
  );
  const { mapStyleUrl } = useMapStyle();

  const city = cities.find((c) => c.id === cityId) || cities[0];

  // Combine all hotspots with module info
  const allHotspots = useMemo(() => {
    const combined: CombinedHotspot[] = [];

    Object.entries(moduleHotspots).forEach(([moduleId, hotspots]) => {
      const module = modules.find((m) => m.id === moduleId);
      if (module) {
        hotspots.forEach((hotspot) => {
          combined.push({
            ...hotspot,
            moduleId,
            moduleColor: module.color,
            moduleName: module.title.split(" ").slice(0, 2).join(" "),
          });
        });
      }
    });

    return combined;
  }, []);

  // Filter hotspots by active modules
  const visibleHotspots = allHotspots.filter((h) => activeModules.has(h.moduleId));

  const toggleModule = (moduleId: string) => {
    setActiveModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const severitySize = {
    low: 12,
    medium: 16,
    high: 20,
    critical: 24,
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={`rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <p className="text-[var(--foreground-muted)]">Mapbox token not configured</p>
      </div>
    );
  }

  return (
    <motion.div
      className={`rounded-xl overflow-hidden border border-[var(--border)] ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Module filter bar */}
      <div className="flex items-center gap-2 p-3 bg-[var(--background-tertiary)] border-b border-[var(--border)] overflow-x-auto">
        <span className="text-xs font-medium text-[var(--foreground-muted)] whitespace-nowrap">
          Filter:
        </span>
        {modules.map((module) => (
          <motion.button
            key={module.id}
            onClick={() => toggleModule(module.id)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeModules.has(module.id)
                ? "bg-opacity-20 border"
                : "opacity-40 hover:opacity-70"
            }`}
            style={{
              backgroundColor: activeModules.has(module.id)
                ? `${module.color}20`
                : "transparent",
              borderColor: activeModules.has(module.id)
                ? `${module.color}40`
                : "transparent",
              color: module.color,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: module.color }}
            />
            {module.title.split(" ")[0]}
          </motion.button>
        ))}
      </div>

      {/* Map */}
      <div style={{ height: height - 48 }}>
        <Map
          initialViewState={{
            longitude: city.coordinates.lng,
            latitude: city.coordinates.lat,
            zoom: 12,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={mapStyleUrl}
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={false}
        >
          <NavigationControl position="top-right" showCompass={false} />

          {/* Hotspot markers */}
          <AnimatePresence>
            {visibleHotspots.map((hotspot, index) => (
              <Marker
                key={hotspot.id}
                longitude={hotspot.lng}
                latitude={hotspot.lat}
                anchor="center"
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: index * 0.03, type: "spring" }}
                  className="relative cursor-pointer group"
                  onClick={() => setSelectedHotspot(hotspot)}
                >
                  {/* Outer pulse ring */}
                  {hotspot.severity === "critical" && (
                    <motion.div
                      className="absolute rounded-full"
                      style={{
                        width: severitySize[hotspot.severity] + 16,
                        height: severitySize[hotspot.severity] + 16,
                        left: -(8),
                        top: -(8),
                        backgroundColor: hotspot.moduleColor,
                      }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.4, 0, 0.4],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  {/* Main marker */}
                  <motion.div
                    className="rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                    style={{
                      width: severitySize[hotspot.severity],
                      height: severitySize[hotspot.severity],
                      backgroundColor: hotspot.moduleColor,
                    }}
                    whileHover={{ scale: 1.2 }}
                  >
                    {hotspot.severity === "critical" && (
                      <span className="text-white text-[8px] font-bold">!</span>
                    )}
                  </motion.div>

                  {/* Hover label */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {hotspot.label}
                    </div>
                  </div>
                </motion.div>
              </Marker>
            ))}
          </AnimatePresence>

          {/* Popup for selected hotspot */}
          {selectedHotspot && (
            <Popup
              longitude={selectedHotspot.lng}
              latitude={selectedHotspot.lat}
              anchor="bottom"
              onClose={() => setSelectedHotspot(null)}
              closeButton={true}
              closeOnClick={false}
              className="city-overview-popup"
            >
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedHotspot.moduleColor }}
                  />
                  <span className="text-xs font-medium text-gray-500">
                    {selectedHotspot.moduleName}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {selectedHotspot.label}
                </h4>
                {selectedHotspot.value && (
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {selectedHotspot.value}
                  </p>
                )}
                <p className="text-xs text-gray-600 line-clamp-2">
                  {selectedHotspot.description}
                </p>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedHotspot.severity === "critical"
                        ? "bg-red-100 text-red-700"
                        : selectedHotspot.severity === "high"
                        ? "bg-orange-100 text-orange-700"
                        : selectedHotspot.severity === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {selectedHotspot.severity.charAt(0).toUpperCase() +
                      selectedHotspot.severity.slice(1)}{" "}
                    Severity
                  </span>
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between p-3 bg-[var(--background-tertiary)] border-t border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon name="mapPin" className="w-4 h-4 text-[var(--foreground-muted)]" />
            <span className="text-sm text-[var(--foreground)]">
              {visibleHotspots.length} hotspots
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-[var(--foreground-muted)]">
              {visibleHotspots.filter((h) => h.severity === "critical").length} critical
            </span>
          </div>
        </div>
        <div className="text-xs text-[var(--foreground-muted)]">
          {city.name}, {city.country}
        </div>
      </div>
    </motion.div>
  );
}
