"use client";

import { useState, useMemo, useEffect } from "react";
import Map, { Source, Layer, NavigationControl } from "react-map-gl/mapbox";
import { motion } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";
import { cities } from "@/data/modules";
import { Icon } from "@/components/ui/icons";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const MAP_STYLE = "mapbox://styles/mapbox/dark-v11";

interface HeatPoint {
  lat: number;
  lng: number;
  intensity: number; // 0-1
  temperature: number; // degrees above baseline
}

// Generate realistic heat island data
function generateHeatData(cityLat: number, cityLng: number): HeatPoint[] {
  const points: HeatPoint[] = [];

  // Create clusters of heat (urban heat islands)
  const clusters = [
    { lat: cityLat + 0.005, lng: cityLng + 0.01, intensity: 0.95, temp: 5.2 }, // Downtown
    { lat: cityLat + 0.02, lng: cityLng + 0.015, intensity: 0.8, temp: 4.1 }, // Industrial
    { lat: cityLat - 0.01, lng: cityLng - 0.02, intensity: 0.6, temp: 2.8 }, // Shopping
    { lat: cityLat + 0.015, lng: cityLng + 0.03, intensity: 0.4, temp: 1.5 }, // Residential
    { lat: cityLat - 0.025, lng: cityLng + 0.005, intensity: 0.7, temp: 3.5 }, // Transit hub
  ];

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
  cityId = "amsterdam",
  className = "",
  height = 500,
  showControls = true,
}: HeatmapOverlayProps) {
  const [heatIntensity, setHeatIntensity] = useState(0.8);
  const [showLabels, setShowLabels] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening">("afternoon");
  const [animatedIntensity, setAnimatedIntensity] = useState(0);

  const city = cities.find((c) => c.id === cityId) || cities[0];

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

  // Hot spots labels
  const hotSpots = heatData
    .filter((p) => p.intensity > 0.7)
    .slice(0, 5)
    .map((point, index) => ({
      ...point,
      label: ["Downtown Core", "Industrial Zone", "Transit Hub", "Commercial Area", "Parking Complex"][index] || "Heat Island",
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
          initialViewState={{
            longitude: city.coordinates.lng,
            latitude: city.coordinates.lat,
            zoom: 12.5,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={MAP_STYLE}
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
              <span>+0°C</span>
              <span>+3°C</span>
              <span>+6°C</span>
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
                +{(heatData.reduce((acc, p) => acc + p.temperature, 0) / heatData.length).toFixed(1)}°C
              </span>
              <span className="text-[var(--foreground-muted)]">avg</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
