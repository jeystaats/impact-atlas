"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  Source,
  Layer,
  MapRef,
} from "react-map-gl/mapbox";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icons";
import { HotspotData, GeoJSONData } from "@/data/hotspots";
import { useMapStyle } from "@/hooks/useMapStyle";
import { MapControls, LayerConfig, MapLegend, HotspotCountBadge } from "./MapControls";
import { MapPopup, HoverTooltip } from "./MapPopup";
import "mapbox-gl/dist/mapbox-gl.css";

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
  // New props for enhanced features
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

const severityColors = {
  low: "#10B981",      // emerald
  medium: "#F59E0B",   // amber
  high: "#F97316",     // orange
  critical: "#EF4444", // red
};

// Spring animation config for smooth, professional feel
const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Generate GeoJSON for heatmap layer from hotspots
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
      geometry: {
        type: "Point" as const,
        coordinates: [hotspot.lng, hotspot.lat],
      },
    })),
  };
}

// Generate GeoJSON for clustering
function generateClusterGeoJSON(hotspots: HotspotData[]) {
  return {
    type: "FeatureCollection" as const,
    features: hotspots.map((hotspot) => ({
      type: "Feature" as const,
      properties: {
        id: hotspot.id,
        severity: hotspot.severity,
        label: hotspot.label,
        value: hotspot.value,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [hotspot.lng, hotspot.lat],
      },
    })),
  };
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MapVisualization({
  moduleId,
  hotspots,
  onHotspotClick,
  onViewDetails,
  selectedHotspot,
  center = { lat: 41.3851, lng: 2.1734 }, // Barcelona default
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
  const mapRef = useRef<MapRef>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hooks
  const { mapStyleUrl } = useMapStyle();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Memoized data
  const heatmapGeoJSON = useMemo(() => generateHeatmapGeoJSON(hotspots), [hotspots]);
  const clusterGeoJSON = useMemo(() => generateClusterGeoJSON(hotspots), [hotspots]);

  // Layer configurations for controls
  const layerConfigs: LayerConfig[] = useMemo(() => [
    {
      id: "hotspots",
      label: "Hotspots",
      icon: "circleDot",
      enabled: layers.hotspots,
      color: "#EF4444",
    },
    {
      id: "heatmap",
      label: "Heat Density",
      icon: "activity",
      enabled: layers.heatmap,
      color: "#F97316",
    },
    {
      id: "clusters",
      label: "Clusters",
      icon: "hexagon",
      enabled: layers.clusters,
      color: "#8B5CF6",
    },
    ...(geoJsonData ? [{
      id: "zones" as const,
      label: "Severity Zones",
      icon: "layers" as const,
      enabled: layers.zones,
      color: "#0D9488",
    }] : []),
  ], [layers, geoJsonData]);

  // Legend items
  const legendItems = useMemo(() =>
    Object.entries(severityColors).map(([level, color]) => ({
      color,
      label: level,
    })),
  []);

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  // Auto-fit bounds to hotspots on initial load
  useEffect(() => {
    if (hotspots.length > 0 && mapRef.current) {
      const lngs = hotspots.map((h) => h.lng);
      const lats = hotspots.map((h) => h.lat);
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01],
        [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01],
      ];

      // Slight delay to ensure map is ready
      setTimeout(() => {
        mapRef.current?.fitBounds(bounds, {
          padding: 60,
          duration: 1000,
        });
      }, 100);
    }
  }, [hotspots]);

  // Fly to selected hotspot
  useEffect(() => {
    if (selectedHotspot && mapRef.current) {
      const hotspot = hotspots.find((h) => h.id === selectedHotspot);
      if (hotspot) {
        mapRef.current.flyTo({
          center: [hotspot.lng, hotspot.lat],
          zoom: 14,
          duration: 1000,
          essential: true,
        });
        setPopupInfo(hotspot);
      }
    }
  }, [selectedHotspot, hotspots]);

  // Cleanup hover timeout
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleMarkerClick = useCallback(
    (hotspot: HotspotData) => {
      setPopupInfo(hotspot);
      setHoverTooltipInfo(null);
      onHotspotClick?.(hotspot);
    },
    [onHotspotClick]
  );

  const handleMarkerHover = useCallback((hotspot: HotspotData | null) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    if (hotspot) {
      setHoveredHotspot(hotspot.id);
      // Delayed tooltip to avoid flickering
      hoverTimeoutRef.current = setTimeout(() => {
        if (!popupInfo) {
          setHoverTooltipInfo(hotspot);
        }
      }, 300);
    } else {
      setHoveredHotspot(null);
      setHoverTooltipInfo(null);
    }
  }, [popupInfo]);

  const handleLayerToggle = useCallback((layerId: string) => {
    setLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId as LayerId],
    }));
  }, []);

  const handleZoomToFit = useCallback(() => {
    if (!mapRef.current || hotspots.length === 0) return;

    // Calculate bounds
    const lngs = hotspots.map((h) => h.lng);
    const lats = hotspots.map((h) => h.lat);
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lngs) - 0.02, Math.min(...lats) - 0.02],
      [Math.max(...lngs) + 0.02, Math.max(...lats) + 0.02],
    ];

    mapRef.current.fitBounds(bounds, {
      padding: 50,
      duration: 1000,
    });
  }, [hotspots]);

  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapRef.current?.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 14,
          duration: 1500,
        });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  const handleViewDetails = useCallback((hotspot: HotspotData) => {
    onViewDetails?.(hotspot);
    setPopupInfo(null);
  }, [onViewDetails]);

  // ==========================================================================
  // RENDER HELPERS - LAYER STYLES
  // ==========================================================================

  // Heatmap layer style
  const heatmapLayerStyle = useMemo(() => ({
    id: "heatmap-layer",
    type: "heatmap" as const,
    paint: {
      "heatmap-weight": ["interpolate", ["linear"], ["get", "intensity"], 0, 0, 1, 1],
      "heatmap-intensity": 0.8,
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
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
  }), []);

  // Cluster layer styles
  const clusterLayerStyle = useMemo(() => ({
    id: "clusters",
    type: "circle" as const,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#10B981", 3,
        "#F59E0B", 5,
        "#F97316", 10,
        "#EF4444"
      ],
      "circle-radius": [
        "step",
        ["get", "point_count"],
        20, 3,
        25, 5,
        30, 10,
        35
      ],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  }), []);

  const clusterCountLayerStyle = useMemo(() => ({
    id: "cluster-count",
    type: "symbol" as const,
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
    paint: {
      "text-color": "#ffffff",
    },
  }), []);

  // Zone fill layer style (for GeoJSON polygons)
  const zoneFillLayerStyle = useMemo(() => ({
    id: "zone-fill",
    type: "fill" as const,
    paint: {
      "fill-color": [
        "match",
        ["get", "severity"],
        "critical", severityColors.critical,
        "high", severityColors.high,
        "medium", severityColors.medium,
        "low", severityColors.low,
        "#9CA3AF"
      ],
      "fill-opacity": 0.2,
    },
  }), []);

  const zoneOutlineLayerStyle = useMemo(() => ({
    id: "zone-outline",
    type: "line" as const,
    paint: {
      "line-color": [
        "match",
        ["get", "severity"],
        "critical", severityColors.critical,
        "high", severityColors.high,
        "medium", severityColors.medium,
        "low", severityColors.low,
        "#9CA3AF"
      ],
      "line-width": 2,
      "line-opacity": 0.8,
    },
  }), []);

  // ==========================================================================
  // FALLBACK RENDER
  // ==========================================================================

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

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  return (
    <div className="relative h-full min-h-[400px] rounded-b-xl [&_.mapboxgl-canvas-container]:rounded-b-xl [&_.mapboxgl-canvas]:rounded-b-xl">
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: center.lng,
          latitude: center.lat,
          zoom: zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyleUrl}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {/* ================================================================
            HEATMAP LAYER
            ================================================================ */}
        {enableHeatmap && layers.heatmap && (
          <Source id="heatmap-source" type="geojson" data={heatmapGeoJSON}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Layer {...(heatmapLayerStyle as any)} />
          </Source>
        )}

        {/* ================================================================
            CLUSTER LAYER
            ================================================================ */}
        {enableClustering && layers.clusters && (
          <Source
            id="cluster-source"
            type="geojson"
            data={clusterGeoJSON}
            cluster={true}
            clusterMaxZoom={14}
            clusterRadius={50}
          >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Layer {...(clusterLayerStyle as any)} />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Layer {...(clusterCountLayerStyle as any)} />
          </Source>
        )}

        {/* ================================================================
            GEOJSON ZONE LAYER (Polygons)
            ================================================================ */}
        {geoJsonData && layers.zones && (
          <Source id="zones-source" type="geojson" data={geoJsonData as GeoJSON.FeatureCollection}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Layer {...(zoneFillLayerStyle as any)} />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Layer {...(zoneOutlineLayerStyle as any)} />
          </Source>
        )}

        {/* ================================================================
            HOTSPOT MARKERS
            ================================================================ */}
        {layers.hotspots && !layers.clusters && hotspots.map((hotspot) => {
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
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: isSelected || isHovered ? 1.3 : 1,
                  opacity: 1,
                }}
                transition={springTransition}
                className="relative cursor-pointer"
                onMouseEnter={() => handleMarkerHover(hotspot)}
                onMouseLeave={() => handleMarkerHover(null)}
              >
                {/* Pulse ring for critical/high severity */}
                {(hotspot.severity === "critical" || hotspot.severity === "high") && (
                  <motion.div
                    animate={{
                      scale: [1, 2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                    className="absolute rounded-full"
                    style={{
                      backgroundColor: color,
                      width: 24,
                      height: 24,
                      left: "50%",
                      top: "50%",
                      marginLeft: -12,
                      marginTop: -12,
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
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={springTransition}
                    >
                      <Icon name="target" className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Selection ring */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={springTransition}
                    className="absolute inset-0 w-8 h-8 -m-1 rounded-full border-2 pointer-events-none"
                    style={{ borderColor: color }}
                  />
                )}
              </motion.div>
            </Marker>
          );
        })}

        {/* ================================================================
            HOVER TOOLTIP
            ================================================================ */}
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

      </Map>

      {/* ================================================================
          HOTSPOT INFO CARD - Positioned at bottom of map, outside Map component
          ================================================================ */}
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
              {/* Close button */}
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

      {/* ====================================================================
          MAP CONTROLS OVERLAY
          ==================================================================== */}
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

      {/* ====================================================================
          LEGEND - Hide when popup is showing to avoid overlap
          ==================================================================== */}
      <AnimatePresence>
        {!popupInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <MapLegend
              title="Severity"
              items={legendItems}
              className="absolute bottom-4 left-4"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          HOTSPOT COUNT BADGE
          ==================================================================== */}
      <HotspotCountBadge
        count={hotspots.length}
        className="absolute top-4 left-4"
      />
    </div>
  );
}
