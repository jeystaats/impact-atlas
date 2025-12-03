"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Map, { Source, Layer, NavigationControl, MapRef } from "react-map-gl/mapbox";
import { motion } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";
import { cities } from "@/data/modules";
import { Icon } from "@/components/ui/icons";
import { useMapStyle } from "@/hooks/useMapStyle";
import { useTemperature } from "@/hooks/useTemperature";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface HeatPoint {
  lat: number;
  lng: number;
  intensity: number; // 0-1
  temperature: number; // degrees above baseline
}

// Barcelona heat island clusters data
const BARCELONA_HEAT_CLUSTERS = [
  { offsetLat: 0.006, offsetLng: -0.008, intensity: 0.95, temp: 5.8, label: "Eixample District" },
  { offsetLat: -0.030, offsetLng: -0.048, intensity: 0.92, temp: 6.4, label: "Zona Franca Industrial" },
  { offsetLat: 0.002, offsetLng: -0.003, intensity: 0.75, temp: 4.2, label: "Plaça Catalunya" },
  { offsetLat: 0.018, offsetLng: 0.014, intensity: 0.70, temp: 4.5, label: "Glòries" },
  { offsetLat: -0.006, offsetLng: -0.033, intensity: 0.55, temp: 3.1, label: "Sants Station" },
];

// Generate realistic heat island data
function generateHeatData(cityLat: number, cityLng: number): HeatPoint[] {
  const points: HeatPoint[] = [];

  // Create clusters of heat (urban heat islands) - Barcelona-specific
  const clusters = BARCELONA_HEAT_CLUSTERS.map(cluster => ({
    lat: cityLat + cluster.offsetLat,
    lng: cityLng + cluster.offsetLng,
    intensity: cluster.intensity,
    temp: cluster.temp,
  }));

  // Add core points
  clusters.forEach((cluster) => {
    points.push({
      lat: cluster.lat,
      lng: cluster.lng,
      intensity: cluster.intensity,
      temperature: cluster.temp,
    });

    // Add surrounding points with decreasing intensity
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 * i) / 15;
      const distance = 0.003 + Math.random() * 0.005;
      points.push({
        lat: cluster.lat + Math.cos(angle) * distance,
        lng: cluster.lng + Math.sin(angle) * distance,
        intensity: cluster.intensity * (0.4 + Math.random() * 0.3),
        temperature: cluster.temp * (0.4 + Math.random() * 0.3),
      });
    }

    // Add scatter points
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 0.008 + Math.random() * 0.012;
      points.push({
        lat: cluster.lat + Math.cos(angle) * distance,
        lng: cluster.lng + Math.sin(angle) * distance,
        intensity: cluster.intensity * (0.1 + Math.random() * 0.3),
        temperature: cluster.temp * (0.1 + Math.random() * 0.3),
      });
    }
  });

  return points;
}

interface HeatmapOverlayProps {
  cityId?: string;
  className?: string;
  height?: number;
  showControls?: boolean;
}

export function HeatmapOverlay({
  cityId = "barcelona",
  className = "",
  height = 500,
  showControls = true,
}: HeatmapOverlayProps) {
  const [heatIntensity, setHeatIntensity] = useState(0.8);
  const [showLabels] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening">("afternoon");
  const [animatedIntensity, setAnimatedIntensity] = useState(0);
  const mapRef = useRef<MapRef>(null);
  const { mapStyleUrl } = useMapStyle();
  const { formatTemperature } = useTemperature();

  const city = cities.find((c) => c.id === cityId) || cities[0];

  // Auto-fit bounds to heat clusters on initial load
  useEffect(() => {
    const clusters = BARCELONA_HEAT_CLUSTERS;
    if (clusters.length > 0 && mapRef.current) {
      const lngs = clusters.map((c) => city.coordinates.lng + c.offsetLng);
      const lats = clusters.map((c) => city.coordinates.lat + c.offsetLat);

      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01],
        [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01],
      ];

      setTimeout(() => {
        mapRef.current?.fitBounds(bounds, {
          padding: 50,
          duration: 1000,
        });
      }, 100);
    }
  }, [city]);

  // Generate heat data based on city
  const heatData = useMemo(() => {
    return generateHeatData(city.coordinates.lat, city.coordinates.lng);
  }, [city]);

  // Create GeoJSON for heatmap
  const geojsonData = useMemo(() => ({
    type: "FeatureCollection" as const,
    features: heatData.map((point) => ({
      type: "Feature" as const,
      properties: {
        intensity: point.intensity * (timeOfDay === "afternoon" ? 1 : timeOfDay === "morning" ? 0.7 : 0.85),
        temperature: point.temperature,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [point.lng, point.lat],
      },
    })),
  }), [heatData, timeOfDay]);

  // Animate the heatmap "breathing" effect
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedIntensity((prev) => {
        const next = prev + 0.02;
        return next > Math.PI * 2 ? 0 : next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const breathingFactor = 0.95 + Math.sin(animatedIntensity) * 0.05;

  const heatmapLayerStyle = {
    id: "heatmap-layer",
    type: "heatmap",
    paint: {
      "heatmap-weight": ["interpolate", ["linear"], ["get", "intensity"], 0, 0, 1, 1],
      "heatmap-intensity": heatIntensity * breathingFactor,
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(0, 0, 0, 0)",
        0.1,
        "rgba(49, 130, 206, 0.4)",
        0.3,
        "rgba(72, 187, 120, 0.5)",
        0.5,
        "rgba(237, 201, 81, 0.6)",
        0.7,
        "rgba(245, 158, 11, 0.7)",
        0.9,
        "rgba(239, 68, 68, 0.8)",
        1,
        "rgba(185, 28, 28, 0.9)",
      ],
      "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 20, 15, 40],
      "heatmap-opacity": 0.8,
    },
  };

  // Hot spots labels - Barcelona locations
  const hotSpots = heatData
    .filter((p) => p.intensity > 0.7)
    .slice(0, 5)
    .map((point, index) => ({
      ...point,
      label: BARCELONA_HEAT_CLUSTERS[index]?.label || "Heat Island",
    }));

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
      className={`rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--background-tertiary)] ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Icon name="thermometer" className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">Urban Heat Islands</h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              Real-time temperature anomaly visualization
            </p>
          </div>
        </div>
        {showControls && (
          <div className="flex items-center gap-2">
            {(["morning", "afternoon", "evening"] as const).map((time) => (
              <button
                key={time}
                onClick={() => setTimeOfDay(time)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  timeOfDay === time
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--background)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {time.charAt(0).toUpperCase() + time.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ height: height - 140 }}>
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: city.coordinates.lng,
            latitude: city.coordinates.lat,
            zoom: 12.5,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={mapStyleUrl}
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={false}
        >
          <NavigationControl position="top-right" showCompass={false} />

          {/* Heatmap layer */}
          <Source id="heat-data" type="geojson" data={geojsonData}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Layer {...(heatmapLayerStyle as any)} />
          </Source>

          {/* Hot spot labels */}
          {showLabels &&
            hotSpots.map((spot, index) => (
              <div
                key={index}
                style={{
                  position: "absolute",
                  transform: "translate(-50%, -100%)",
                }}
              >
                {/* Labels are handled by Mapbox markers in production */}
              </div>
            ))}
        </Map>
      </div>

      {/* Controls and Legend */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          {/* Temperature scale */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--foreground-muted)]">Temperature Anomaly:</span>
            <div className="flex items-center gap-1">
              <div className="w-24 h-2 rounded-full bg-gradient-to-r from-blue-400 via-yellow-400 to-red-600" />
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
              <span>+{formatTemperature(0, 0)}</span>
              <span>+{formatTemperature(3, 0)}</span>
              <span>+{formatTemperature(6, 0)}</span>
            </div>
          </div>

          {/* Intensity slider */}
          {showControls && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--foreground-muted)]">Intensity:</span>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.1"
                value={heatIntensity}
                onChange={(e) => setHeatIntensity(parseFloat(e.target.value))}
                className="w-20 h-1 bg-[var(--border)] rounded-full appearance-none cursor-pointer accent-[var(--accent)]"
              />
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[var(--foreground-muted)]">
                {hotSpots.length} Critical Zones
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--foreground)]">
                +{formatTemperature(heatData.reduce((acc, p) => acc + p.temperature, 0) / heatData.length)}
              </span>
              <span className="text-[var(--foreground-muted)]">avg</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
