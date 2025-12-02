"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icons";
import { HotspotData } from "@/data/hotspots";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapVisualizationProps {
  moduleId: string;
  hotspots: HotspotData[];
  onHotspotClick?: (hotspot: HotspotData) => void;
  selectedHotspot?: string | null;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const severityColors = {
  low: "#10B981",      // emerald
  medium: "#F59E0B",   // amber
  high: "#F97316",     // orange
  critical: "#EF4444", // red
};

const severityBgColors = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

// Light map style optimized for data visualization
const MAP_STYLE = "mapbox://styles/mapbox/light-v11";

export function MapVisualization({
  moduleId,
  hotspots,
  onHotspotClick,
  selectedHotspot,
  center = { lat: 52.3676, lng: 4.9041 }, // Amsterdam default
  zoom = 12,
}: MapVisualizationProps) {
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [popupInfo, setPopupInfo] = useState<HotspotData | null>(null);
  const mapRef = useRef<any>(null);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Fly to selected hotspot
  useEffect(() => {
    if (selectedHotspot && mapRef.current) {
      const hotspot = hotspots.find((h) => h.id === selectedHotspot);
      if (hotspot) {
        mapRef.current.flyTo({
          center: [hotspot.lng, hotspot.lat],
          zoom: 14,
          duration: 1000,
        });
      }
    }
  }, [selectedHotspot, hotspots]);

  const handleMarkerClick = useCallback(
    (hotspot: HotspotData) => {
      setPopupInfo(hotspot);
      onHotspotClick?.(hotspot);
    },
    [onHotspotClick]
  );

  // Fallback if no Mapbox token
  if (!mapboxToken) {
    return (
      <div className="relative h-full min-h-[400px] rounded-xl bg-gradient-to-br from-[var(--accent-bg)] to-[var(--background-secondary)] overflow-hidden flex items-center justify-center">
        <div className="text-center p-6">
          <Icon name="mapPin" className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-4" />
          <p className="text-[var(--foreground-secondary)] mb-2">Mapbox token not configured</p>
          <p className="text-sm text-[var(--foreground-muted)]">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to your .env file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[400px] rounded-xl overflow-hidden">
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: center.lng,
          latitude: center.lat,
          zoom: zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {/* Hotspot markers */}
        {hotspots.map((hotspot) => {
          const isSelected = selectedHotspot === hotspot.id;
          const isHovered = hoveredHotspot === hotspot.id;
          const color = severityColors[hotspot.severity];

          return (
            <Marker
              key={hotspot.id}
              longitude={hotspot.lng}
              latitude={hotspot.lat}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(hotspot);
              }}
            >
              <div
                className="relative cursor-pointer transition-transform duration-200"
                style={{ transform: isSelected || isHovered ? "scale(1.3)" : "scale(1)" }}
                onMouseEnter={() => setHoveredHotspot(hotspot.id)}
                onMouseLeave={() => setHoveredHotspot(null)}
              >
                {/* Pulse ring for critical/high severity */}
                {(hotspot.severity === "critical" || hotspot.severity === "high") && (
                  <motion.div
                    animate={{
                      scale: [1, 1.8, 1],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: color,
                      width: 24,
                      height: 24,
                      marginLeft: -12,
                      marginTop: -12,
                    }}
                  />
                )}

                {/* Main marker dot */}
                <div
                  className="relative w-6 h-6 rounded-full shadow-lg flex items-center justify-center border-2 border-white"
                  style={{ backgroundColor: color }}
                >
                  {isSelected && (
                    <Icon name="target" className="w-3 h-3 text-white" />
                  )}
                </div>

                {/* Selection ring */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 w-8 h-8 -m-1 rounded-full border-2"
                    style={{ borderColor: color }}
                  />
                )}
              </div>
            </Marker>
          );
        })}

        {/* Popup for hovered/selected hotspot */}
        <AnimatePresence>
          {popupInfo && (
            <Popup
              longitude={popupInfo.lng}
              latitude={popupInfo.lat}
              anchor="bottom"
              onClose={() => setPopupInfo(null)}
              closeButton={false}
              className="z-50"
              offset={15}
            >
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="p-3 min-w-[180px]"
              >
                <div className="flex items-start gap-2 mb-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1 ${severityBgColors[popupInfo.severity]}`}
                  />
                  <div>
                    <p className="font-semibold text-[var(--foreground)] text-sm">
                      {popupInfo.label}
                    </p>
                    {popupInfo.location && (
                      <p className="text-xs text-[var(--foreground-muted)]">
                        {popupInfo.location}
                      </p>
                    )}
                  </div>
                </div>
                {popupInfo.value && (
                  <div className="mt-2 pt-2 border-t border-[var(--border)]">
                    <span className="text-sm font-medium text-[var(--accent)]">
                      {popupInfo.value}
                    </span>
                  </div>
                )}
              </motion.div>
            </Popup>
          )}
        </AnimatePresence>
      </Map>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 p-3 rounded-lg bg-white/90 backdrop-blur-sm border border-[var(--border)] shadow-sm">
        <p className="text-xs font-medium text-[var(--foreground)] mb-2">Severity</p>
        <div className="flex gap-3">
          {Object.entries(severityColors).map(([level, color]) => (
            <div key={level} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-[var(--foreground-secondary)] capitalize">
                {level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hotspot count badge */}
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-[var(--border)] shadow-sm">
        <span className="text-xs font-medium text-[var(--foreground)]">
          {hotspots.length} hotspots
        </span>
      </div>
    </div>
  );
}
