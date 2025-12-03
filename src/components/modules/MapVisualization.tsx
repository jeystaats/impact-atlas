"use client";

/**
 * MapVisualization Component
 *
 * Interactive hotspot map with multiple layer types:
 * - Hotspot markers with severity indicators
 * - Heatmap density visualization
 * - Cluster aggregation
 * - GeoJSON zone overlays
 *
 * Refactored to use BaseMap for common map functionality.
 */

import { useEffect, useRef, useState, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BaseMap, Source, Layer, Marker, Popup } from "@/components/maps";
import type { BaseMapRef, Coordinates } from "@/components/maps";
import { Icon } from "@/components/ui/icons";
import { HotspotData, GeoJSONData } from "@/data/hotspots";
import { MapControls, LayerConfig, MapLegend, HotspotCountBadge } from "./MapControls";
import { MapPopup, HoverTooltip } from "./MapPopup";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface MapVisualizationProps {
  moduleId: string;
  hotspots: HotspotData[];
  onHotspotClick?: (hotspot: HotspotData) => void;
  onViewDetails?: (hotspot: HotspotData) => void;
  selectedHotspot?: string | null;
  center?: { lat: number; lng: number };
  zoom?: number;
  geoJsonData?: GeoJSONData;
  showLayerControls?: boolean;
  enableClustering?: boolean;
  enableHeatmap?: boolean;
}

type LayerId = "hotspots" | "heatmap" | "clusters" | "zones";

interface LayerState {
  hotspots: boolean;
  heatmap: boolean;
  clusters: boolean;
  zones: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SEVERITY_COLORS = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#F97316",
  critical: "#EF4444",
};

const SPRING_TRANSITION = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateHeatmapGeoJSON(hotspots: HotspotData[]) {
  return {
    type: "FeatureCollection" as const,
    features: hotspots.map((hotspot) => ({
      type: "Feature" as const,
      properties: {
        intensity: hotspot.severity === "critical" ? 1 :
                   hotspot.severity === "high" ? 0.75 :
                   hotspot.severity === "medium" ? 0.5 : 0.25,
        severity: hotspot.severity,
      },
      geometry: { type: "Point" as const, coordinates: [hotspot.lng, hotspot.lat] },
    })),
  };
}

function generateClusterGeoJSON(hotspots: HotspotData[]) {
  return {
    type: "FeatureCollection" as const,
    features: hotspots.map((hotspot) => ({
      type: "Feature" as const,
      properties: { id: hotspot.id, severity: hotspot.severity, label: hotspot.label, value: hotspot.value },
      geometry: { type: "Point" as const, coordinates: [hotspot.lng, hotspot.lat] },
    })),
  };
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface HotspotMarkerProps {
  hotspot: HotspotData;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (hotspot: HotspotData) => void;
  onHover: (hotspot: HotspotData | null) => void;
}

const HotspotMarker = memo(function HotspotMarker({ hotspot, isSelected, isHovered, onSelect, onHover }: HotspotMarkerProps) {
  const color = SEVERITY_COLORS[hotspot.severity];

  return (
    <Marker
      longitude={hotspot.lng}
      latitude={hotspot.lat}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onSelect(hotspot);
      }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: isSelected || isHovered ? 1.3 : 1, opacity: 1 }}
        transition={SPRING_TRANSITION}
        className="relative cursor-pointer"
        onMouseEnter={() => onHover(hotspot)}
        onMouseLeave={() => onHover(null)}
      >
        {/* Pulse ring for critical/high severity */}
        {(hotspot.severity === "critical" || hotspot.severity === "high") && (
          <motion.div
            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
            className="absolute rounded-full"
            style={{
              backgroundColor: color,
              width: 24, height: 24,
              left: "50%", top: "50%",
              marginLeft: -12, marginTop: -12,
            }}
          />
        )}

        {/* Main marker dot */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="relative w-6 h-6 rounded-full shadow-lg flex items-center justify-center border-2 border-white"
          style={{ backgroundColor: color }}
        >
          {isSelected && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING_TRANSITION}>
              <Icon name="target" className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </motion.div>

        {/* Selection ring */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRING_TRANSITION}
            className="absolute inset-0 w-8 h-8 -m-1 rounded-full border-2 pointer-events-none"
            style={{ borderColor: color }}
          />
        )}
      </motion.div>
    </Marker>
  );
});

// =============================================================================
// LAYER STYLE CONFIGURATIONS
// =============================================================================

const HEATMAP_LAYER_STYLE = {
  id: "heatmap-layer",
  type: "heatmap" as const,
  paint: {
    "heatmap-weight": ["interpolate", ["linear"], ["get", "intensity"], 0, 0, 1, 1],
    "heatmap-intensity": 0.8,
    "heatmap-color": [
      "interpolate", ["linear"], ["heatmap-density"],
      0, "rgba(0, 0, 0, 0)",
      0.1, "rgba(16, 185, 129, 0.3)",
      0.3, "rgba(245, 158, 11, 0.5)",
      0.5, "rgba(249, 115, 22, 0.6)",
      0.7, "rgba(239, 68, 68, 0.7)",
      1, "rgba(185, 28, 28, 0.85)",
    ],
    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 25, 15, 50],
    "heatmap-opacity": 0.75,
  },
};

const CLUSTER_LAYER_STYLE = {
  id: "clusters",
  type: "circle" as const,
  filter: ["has", "point_count"],
  paint: {
    "circle-color": ["step", ["get", "point_count"], "#10B981", 3, "#F59E0B", 5, "#F97316", 10, "#EF4444"],
    "circle-radius": ["step", ["get", "point_count"], 20, 3, 25, 5, 30, 10, 35],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#ffffff",
  },
};

const CLUSTER_COUNT_LAYER_STYLE = {
  id: "cluster-count",
  type: "symbol" as const,
  filter: ["has", "point_count"],
  layout: { "text-field": "{point_count_abbreviated}", "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"], "text-size": 12 },
  paint: { "text-color": "#ffffff" },
};

const ZONE_FILL_LAYER_STYLE = {
  id: "zone-fill",
  type: "fill" as const,
  paint: {
    "fill-color": ["match", ["get", "severity"], "critical", SEVERITY_COLORS.critical, "high", SEVERITY_COLORS.high, "medium", SEVERITY_COLORS.medium, "low", SEVERITY_COLORS.low, "#9CA3AF"],
    "fill-opacity": 0.2,
  },
};

const ZONE_OUTLINE_LAYER_STYLE = {
  id: "zone-outline",
  type: "line" as const,
  paint: {
    "line-color": ["match", ["get", "severity"], "critical", SEVERITY_COLORS.critical, "high", SEVERITY_COLORS.high, "medium", SEVERITY_COLORS.medium, "low", SEVERITY_COLORS.low, "#9CA3AF"],
    "line-width": 2,
    "line-opacity": 0.8,
  },
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MapVisualization({
  hotspots,
  onHotspotClick,
  onViewDetails,
  selectedHotspot,
  center = { lat: 41.3851, lng: 2.1734 },
  zoom = 12,
  geoJsonData,
  showLayerControls = true,
  enableClustering = true,
  enableHeatmap = true,
}: MapVisualizationProps) {
  // State
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [popupInfo, setPopupInfo] = useState<HotspotData | null>(null);
  const [hoverTooltipInfo, setHoverTooltipInfo] = useState<HotspotData | null>(null);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [layers, setLayers] = useState<LayerState>({
    hotspots: true,
    heatmap: false,
    clusters: false,
    zones: true,
  });

  // Refs
  const mapRef = useRef<BaseMapRef>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized data
  const heatmapGeoJSON = useMemo(() => generateHeatmapGeoJSON(hotspots), [hotspots]);
  const clusterGeoJSON = useMemo(() => generateClusterGeoJSON(hotspots), [hotspots]);

  // Layer configurations for controls
  const layerConfigs: LayerConfig[] = useMemo(() => [
    { id: "hotspots", label: "Hotspots", icon: "circleDot", enabled: layers.hotspots, color: "#EF4444" },
    { id: "heatmap", label: "Heat Density", icon: "activity", enabled: layers.heatmap, color: "#F97316" },
    { id: "clusters", label: "Clusters", icon: "hexagon", enabled: layers.clusters, color: "#8B5CF6" },
    ...(geoJsonData ? [{ id: "zones" as const, label: "Severity Zones", icon: "layers" as const, enabled: layers.zones, color: "#0D9488" }] : []),
  ], [layers, geoJsonData]);

  // Legend items
  const legendItems = useMemo(() =>
    Object.entries(SEVERITY_COLORS).map(([level, color]) => ({ color, label: level })),
  []);

  // Auto-fit bounds to hotspots on initial load
  useEffect(() => {
    if (hotspots.length > 0 && mapRef.current) {
      const points: Coordinates[] = hotspots.map((h) => ({ lat: h.lat, lng: h.lng }));
      mapRef.current.fitBounds(points, 60);
    }
  }, [hotspots]);

  // Fly to selected hotspot
  useEffect(() => {
    if (selectedHotspot && mapRef.current) {
      const hotspot = hotspots.find((h) => h.id === selectedHotspot);
      if (hotspot) {
        mapRef.current.flyTo({ lat: hotspot.lat, lng: hotspot.lng }, 14);
        setPopupInfo(hotspot);
      }
    }
  }, [selectedHotspot, hotspots]);

  // Cleanup hover timeout
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Handlers
  const handleMarkerClick = useCallback((hotspot: HotspotData) => {
    setPopupInfo(hotspot);
    setHoverTooltipInfo(null);
    onHotspotClick?.(hotspot);
  }, [onHotspotClick]);

  const handleMarkerHover = useCallback((hotspot: HotspotData | null) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    if (hotspot) {
      setHoveredHotspot(hotspot.id);
      hoverTimeoutRef.current = setTimeout(() => {
        if (!popupInfo) setHoverTooltipInfo(hotspot);
      }, 300);
    } else {
      setHoveredHotspot(null);
      setHoverTooltipInfo(null);
    }
  }, [popupInfo]);

  const handleLayerToggle = useCallback((layerId: string) => {
    setLayers((prev) => ({ ...prev, [layerId]: !prev[layerId as LayerId] }));
  }, []);

  const handleZoomToFit = useCallback(() => {
    if (!mapRef.current || hotspots.length === 0) return;
    const points: Coordinates[] = hotspots.map((h) => ({ lat: h.lat, lng: h.lng }));
    mapRef.current.fitBounds(points, 50);
  }, [hotspots]);

  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapRef.current?.flyTo({ lat: position.coords.latitude, lng: position.coords.longitude }, 14);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  const handleViewDetails = useCallback((hotspot: HotspotData) => {
    onViewDetails?.(hotspot);
    setPopupInfo(null);
  }, [onViewDetails]);

  return (
    <div className="relative h-full min-h-[400px] rounded-b-xl [&_.mapboxgl-canvas-container]:rounded-b-xl [&_.mapboxgl-canvas]:rounded-b-xl">
      <BaseMap
        ref={mapRef}
        center={center}
        zoom={zoom}
        height="100%"
        showNavigation={true}
        navigationPosition="bottom-right"
        className="h-full"
      >
        {/* Heatmap Layer */}
        {enableHeatmap && layers.heatmap && (
          <Source id="heatmap-source" type="geojson" data={heatmapGeoJSON}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Layer {...(HEATMAP_LAYER_STYLE as any)} />
          </Source>
        )}

        {/* Cluster Layer */}
        {enableClustering && layers.clusters && (
          <Source id="cluster-source" type="geojson" data={clusterGeoJSON} cluster={true} clusterMaxZoom={14} clusterRadius={50}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Layer {...(CLUSTER_LAYER_STYLE as any)} />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Layer {...(CLUSTER_COUNT_LAYER_STYLE as any)} />
          </Source>
        )}

        {/* GeoJSON Zone Layer */}
        {geoJsonData && layers.zones && (
          <Source id="zones-source" type="geojson" data={geoJsonData as GeoJSON.FeatureCollection}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Layer {...(ZONE_FILL_LAYER_STYLE as any)} />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Layer {...(ZONE_OUTLINE_LAYER_STYLE as any)} />
          </Source>
        )}

        {/* Hotspot Markers */}
        {layers.hotspots && !layers.clusters && hotspots.map((hotspot) => (
          <HotspotMarker
            key={hotspot.id}
            hotspot={hotspot}
            isSelected={selectedHotspot === hotspot.id}
            isHovered={hoveredHotspot === hotspot.id}
            onSelect={handleMarkerClick}
            onHover={handleMarkerHover}
          />
        ))}

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoverTooltipInfo && !popupInfo && (
            <Popup
              longitude={hoverTooltipInfo.lng}
              latitude={hoverTooltipInfo.lat}
              anchor="bottom"
              closeButton={false}
              closeOnClick={false}
              className="z-40"
              offset={20}
            >
              <HoverTooltip hotspot={hoverTooltipInfo} />
            </Popup>
          )}
        </AnimatePresence>
      </BaseMap>

      {/* Hotspot Info Card */}
      <AnimatePresence>
        {popupInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute bottom-4 left-4 right-4 z-50 max-w-md"
          >
            <div className="bg-white rounded-xl shadow-2xl border border-[var(--border)] overflow-hidden">
              <button
                onClick={() => setPopupInfo(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[var(--background-secondary)] flex items-center justify-center text-[var(--foreground-muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)] transition-colors z-10"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
              <div className="p-4">
                <MapPopup
                  hotspot={popupInfo}
                  onViewDetails={onViewDetails ? handleViewDetails : undefined}
                  onClose={() => setPopupInfo(null)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Controls Overlay */}
      {showLayerControls && (
        <MapControls
          layers={layerConfigs}
          onLayerToggle={handleLayerToggle}
          onZoomToFit={handleZoomToFit}
          onLocateUser={handleLocateUser}
          isLocating={isLocating}
          showLayerPanel={showLayerPanel}
          onToggleLayerPanel={() => setShowLayerPanel(!showLayerPanel)}
        />
      )}

      {/* Legend */}
      <AnimatePresence>
        {!popupInfo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <MapLegend title="Severity" items={legendItems} className="absolute bottom-4 left-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hotspot Count Badge */}
      <HotspotCountBadge count={hotspots.length} className="absolute top-4 left-4" />
    </div>
  );
}
