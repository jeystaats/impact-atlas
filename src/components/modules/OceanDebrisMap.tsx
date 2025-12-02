"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Map, { Source, Layer, Marker, NavigationControl, MapRef } from "react-map-gl/mapbox";
import { motion, AnimatePresence } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";
import { cities } from "@/data/modules";
import { Icon } from "@/components/ui/icons";
import { useMapStyle } from "@/hooks/useMapStyle";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface DebrisCluster {
  id: string;
  position: { lat: number; lng: number };
  intensity: number; // 0-1, concentration level
  size: number; // km radius
  items: number; // items/km²
  type: "gyre" | "river" | "fishing" | "coastal";
  label: string;
}

interface OceanCurrent {
  id: string;
  points: { lat: number; lng: number }[];
  name: string;
  speed: number; // knots
}

interface TrackingBuoy {
  id: string;
  position: { lat: number; lng: number };
  status: "active" | "warning" | "offline";
  lastPing: string;
  driftDirection: number; // degrees
}

interface DebrisParticle {
  id: string;
  position: { lat: number; lng: number };
  velocity: { lat: number; lng: number };
  age: number;
  maxAge: number;
  size: number;
  type: "micro" | "macro" | "ghost";
}

// Generate debris clusters for Barcelona Mediterranean waters
function generateDebrisClusters(cityLat: number, cityLng: number): DebrisCluster[] {
  return [
    {
      id: "dc-1",
      position: { lat: cityLat + 0.08, lng: cityLng + 0.12 },
      intensity: 0.95,
      size: 8,
      items: 2450,
      type: "gyre",
      label: "Mediterranean Gyre",
    },
    {
      id: "dc-2",
      position: { lat: cityLat + 0.03, lng: cityLng + 0.25 },
      intensity: 0.92,
      size: 6,
      items: 3100,
      type: "gyre",
      label: "Cap de Creus Convergence",
    },
    {
      id: "dc-3",
      position: { lat: cityLat - 0.10, lng: cityLng - 0.05 },
      intensity: 0.75,
      size: 4,
      items: 1850,
      type: "river",
      label: "Llobregat Outflow",
    },
    {
      id: "dc-4",
      position: { lat: cityLat - 0.02, lng: cityLng + 0.40 },
      intensity: 0.70,
      size: 5,
      items: 1650,
      type: "fishing",
      label: "Fishing Ground Alpha",
    },
    {
      id: "dc-5",
      position: { lat: cityLat + 0.15, lng: cityLng + 0.05 },
      intensity: 0.55,
      size: 3,
      items: 1120,
      type: "coastal",
      label: "Costa Brava Drift",
    },
    {
      id: "dc-6",
      position: { lat: cityLat - 0.07, lng: cityLng + 0.18 },
      intensity: 0.45,
      size: 4,
      items: 890,
      type: "coastal",
      label: "Balearic Drift Zone",
    },
  ];
}

// Generate ocean current paths
function generateOceanCurrents(cityLat: number, cityLng: number): OceanCurrent[] {
  return [
    {
      id: "oc-1",
      name: "Liguro-Provençal Current",
      speed: 1.2,
      points: [
        { lat: cityLat + 0.25, lng: cityLng - 0.10 },
        { lat: cityLat + 0.20, lng: cityLng + 0.05 },
        { lat: cityLat + 0.12, lng: cityLng + 0.15 },
        { lat: cityLat + 0.05, lng: cityLng + 0.22 },
        { lat: cityLat - 0.02, lng: cityLng + 0.28 },
      ],
    },
    {
      id: "oc-2",
      name: "Catalan Coastal Current",
      speed: 0.8,
      points: [
        { lat: cityLat + 0.15, lng: cityLng },
        { lat: cityLat + 0.08, lng: cityLng + 0.02 },
        { lat: cityLat, lng: cityLng + 0.05 },
        { lat: cityLat - 0.08, lng: cityLng + 0.03 },
        { lat: cityLat - 0.15, lng: cityLng },
      ],
    },
    {
      id: "oc-3",
      name: "Balearic Gyre",
      speed: 0.5,
      points: [
        { lat: cityLat - 0.05, lng: cityLng + 0.20 },
        { lat: cityLat - 0.02, lng: cityLng + 0.30 },
        { lat: cityLat - 0.08, lng: cityLng + 0.35 },
        { lat: cityLat - 0.15, lng: cityLng + 0.30 },
        { lat: cityLat - 0.12, lng: cityLng + 0.20 },
      ],
    },
  ];
}

// Generate tracking buoys
function generateTrackingBuoys(cityLat: number, cityLng: number): TrackingBuoy[] {
  return [
    {
      id: "buoy-1",
      position: { lat: cityLat + 0.06, lng: cityLng + 0.10 },
      status: "active",
      lastPing: "2 min ago",
      driftDirection: 135,
    },
    {
      id: "buoy-2",
      position: { lat: cityLat + 0.12, lng: cityLng + 0.20 },
      status: "active",
      lastPing: "5 min ago",
      driftDirection: 180,
    },
    {
      id: "buoy-3",
      position: { lat: cityLat - 0.05, lng: cityLng + 0.15 },
      status: "warning",
      lastPing: "2 hours ago",
      driftDirection: 220,
    },
    {
      id: "buoy-4",
      position: { lat: cityLat - 0.08, lng: cityLng + 0.30 },
      status: "active",
      lastPing: "8 min ago",
      driftDirection: 90,
    },
    {
      id: "buoy-5",
      position: { lat: cityLat + 0.18, lng: cityLng + 0.08 },
      status: "offline",
      lastPing: "3 days ago",
      driftDirection: 0,
    },
  ];
}

interface OceanDebrisMapProps {
  cityId?: string;
  className?: string;
  height?: number;
}

export function OceanDebrisMap({
  cityId = "barcelona",
  className = "",
  height = 500,
}: OceanDebrisMapProps) {
  const [particles, setParticles] = useState<DebrisParticle[]>([]);
  const [showCurrents, setShowCurrents] = useState(true);
  const [showBuoys, setShowBuoys] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState<DebrisCluster | null>(null);
  const [viewMode, setViewMode] = useState<"concentration" | "tracking">("concentration");
  const animationRef = useRef<number | undefined>(undefined);
  const mapRef = useRef<MapRef>(null);
  const { mapStyleUrl } = useMapStyle();

  const city = cities.find((c) => c.id === cityId) || cities[0];

  const debrisClusters = useMemo(
    () => generateDebrisClusters(city.coordinates.lat, city.coordinates.lng),
    [city]
  );

  const oceanCurrents = useMemo(
    () => generateOceanCurrents(city.coordinates.lat, city.coordinates.lng),
    [city]
  );

  const trackingBuoys = useMemo(
    () => generateTrackingBuoys(city.coordinates.lat, city.coordinates.lng),
    [city]
  );

  // Auto-fit bounds to debris clusters on initial load
  useEffect(() => {
    if (debrisClusters.length > 0 && mapRef.current) {
      const lngs = debrisClusters.map((c) => c.position.lng);
      const lats = debrisClusters.map((c) => c.position.lat);
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lngs) - 0.05, Math.min(...lats) - 0.05],
        [Math.max(...lngs) + 0.05, Math.max(...lats) + 0.05],
      ];

      setTimeout(() => {
        mapRef.current?.fitBounds(bounds, {
          padding: 50,
          duration: 1000,
        });
      }, 100);
    }
  }, [debrisClusters]);

  // Get current vector at a position
  const getCurrentAt = useCallback(
    (lat: number, lng: number) => {
      let totalVelLat = 0;
      let totalVelLng = 0;

      oceanCurrents.forEach((current) => {
        // Find nearest point on current
        current.points.forEach((point, i) => {
          if (i < current.points.length - 1) {
            const dist = Math.sqrt(
              Math.pow(point.lat - lat, 2) + Math.pow(point.lng - lng, 2)
            );
            const weight = Math.max(0, 1 - dist / 0.15) * current.speed;

            if (weight > 0) {
              const nextPoint = current.points[i + 1];
              const direction = Math.atan2(
                nextPoint.lat - point.lat,
                nextPoint.lng - point.lng
              );
              totalVelLat += Math.sin(direction) * weight * 0.0001;
              totalVelLng += Math.cos(direction) * weight * 0.0001;
            }
          }
        });
      });

      return { lat: totalVelLat, lng: totalVelLng };
    },
    [oceanCurrents]
  );

  // Spawn new particles
  const spawnParticle = useCallback(() => {
    const sources = debrisClusters.slice(0, 3).map((c) => c.position);
    const source = sources[Math.floor(Math.random() * sources.length)];

    const types: DebrisParticle["type"][] = ["micro", "macro", "ghost"];

    return {
      id: `p-${Date.now()}-${Math.random()}`,
      position: {
        lat: source.lat + (Math.random() - 0.5) * 0.05,
        lng: source.lng + (Math.random() - 0.5) * 0.05,
      },
      velocity: { lat: 0, lng: 0 },
      age: 0,
      maxAge: 300 + Math.random() * 200,
      size: 2 + Math.random() * 4,
      type: types[Math.floor(Math.random() * types.length)],
    };
  }, [debrisClusters]);

  // Animation loop
  useEffect(() => {
    let frameCount = 0;

    const animate = () => {
      frameCount++;

      setParticles((prev) => {
        const newParticles = [...prev];
        if (frameCount % 8 === 0 && newParticles.length < 80) {
          newParticles.push(spawnParticle());
        }

        return newParticles
          .map((particle) => {
            const current = getCurrentAt(particle.position.lat, particle.position.lng);

            return {
              ...particle,
              position: {
                lat: particle.position.lat + current.lat,
                lng: particle.position.lng + current.lng,
              },
              velocity: current,
              age: particle.age + 1,
            };
          })
          .filter((p) => p.age < p.maxAge);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [getCurrentAt, spawnParticle]);

  // GeoJSON for ocean current lines
  const currentsGeojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: oceanCurrents.map((current) => ({
        type: "Feature" as const,
        properties: {
          name: current.name,
          speed: current.speed,
        },
        geometry: {
          type: "LineString" as const,
          coordinates: current.points.map((p) => [p.lng, p.lat]),
        },
      })),
    }),
    [oceanCurrents]
  );

  // GeoJSON for debris concentration circles
  const concentrationGeojson = useMemo(() => {
    const features = debrisClusters.map((cluster) => {
      // Create circle approximation
      const points = 32;
      const coords: [number, number][] = [];
      const radiusDeg = cluster.size * 0.009; // rough km to degree conversion

      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * 2 * Math.PI;
        coords.push([
          cluster.position.lng + radiusDeg * Math.cos(angle),
          cluster.position.lat + radiusDeg * Math.sin(angle) * 0.7,
        ]);
      }

      return {
        type: "Feature" as const,
        properties: {
          id: cluster.id,
          intensity: cluster.intensity,
          items: cluster.items,
          type: cluster.type,
        },
        geometry: {
          type: "Polygon" as const,
          coordinates: [coords],
        },
      };
    });

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }, [debrisClusters]);

  const getParticleColor = (type: DebrisParticle["type"]) => {
    switch (type) {
      case "micro":
        return "#60A5FA"; // blue for microplastics
      case "macro":
        return "#F59E0B"; // amber for macroplastics
      case "ghost":
        return "#EF4444"; // red for ghost nets
      default:
        return "#60A5FA";
    }
  };

  const getClusterColor = (type: DebrisCluster["type"]) => {
    switch (type) {
      case "gyre":
        return "#EF4444"; // red
      case "river":
        return "#F59E0B"; // amber
      case "fishing":
        return "#8B5CF6"; // purple
      case "coastal":
        return "#3B82F6"; // blue
      default:
        return "#3B82F6";
    }
  };

  const getBuoyColor = (status: TrackingBuoy["status"]) => {
    switch (status) {
      case "active":
        return "#10B981";
      case "warning":
        return "#F59E0B";
      case "offline":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  // Calculate totals
  const totalItems = debrisClusters.reduce((sum, c) => sum + c.items, 0);
  const criticalZones = debrisClusters.filter((c) => c.intensity > 0.8).length;
  const activeBuoys = trackingBuoys.filter((b) => b.status === "active").length;

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
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Icon name="globe" className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">Ocean Debris Tracker</h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              Mediterranean plastic concentration monitoring
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 bg-[var(--background)] rounded-lg p-1">
          <button
            onClick={() => setViewMode("concentration")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              viewMode === "concentration"
                ? "bg-cyan-500 text-white"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Concentration
          </button>
          <button
            onClick={() => setViewMode("tracking")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              viewMode === "tracking"
                ? "bg-cyan-500 text-white"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Tracking
          </button>
        </div>
      </div>

      {/* Map */}
      <div style={{ height: height - 180 }}>
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: city.coordinates.lng + 0.15,
            latitude: city.coordinates.lat + 0.03,
            zoom: 9.5,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={mapStyleUrl}
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={false}
        >
          <NavigationControl position="top-right" showCompass={true} />

          {/* Debris concentration zones */}
          {viewMode === "concentration" && (
            <Source id="concentration-zones" type="geojson" data={concentrationGeojson}>
              <Layer
                id="concentration-fill"
                type="fill"
                paint={{
                  "fill-color": [
                    "match",
                    ["get", "type"],
                    "gyre", "#EF4444",
                    "river", "#F59E0B",
                    "fishing", "#8B5CF6",
                    "coastal", "#3B82F6",
                    "#3B82F6"
                  ],
                  "fill-opacity": ["*", ["get", "intensity"], 0.3],
                }}
              />
              <Layer
                id="concentration-stroke"
                type="line"
                paint={{
                  "line-color": [
                    "match",
                    ["get", "type"],
                    "gyre", "#EF4444",
                    "river", "#F59E0B",
                    "fishing", "#8B5CF6",
                    "coastal", "#3B82F6",
                    "#3B82F6"
                  ],
                  "line-width": 2,
                  "line-opacity": 0.8,
                  "line-dasharray": [2, 2],
                }}
              />
            </Source>
          )}

          {/* Ocean currents */}
          {showCurrents && (
            <Source id="ocean-currents" type="geojson" data={currentsGeojson}>
              <Layer
                id="currents-line"
                type="line"
                paint={{
                  "line-color": "#06B6D4",
                  "line-width": ["*", ["get", "speed"], 2],
                  "line-opacity": 0.6,
                }}
              />
            </Source>
          )}

          {/* Animated debris particles */}
          <AnimatePresence>
            {particles.map((particle) => (
              <Marker
                key={particle.id}
                longitude={particle.position.lng}
                latitude={particle.position.lat}
                anchor="center"
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 0.8 - (particle.age / particle.maxAge) * 0.6,
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="rounded-full"
                  style={{
                    width: particle.size,
                    height: particle.size,
                    backgroundColor: getParticleColor(particle.type),
                    boxShadow: `0 0 6px ${getParticleColor(particle.type)}`,
                  }}
                />
              </Marker>
            ))}
          </AnimatePresence>

          {/* Debris cluster markers */}
          {debrisClusters.map((cluster) => (
            <Marker
              key={cluster.id}
              longitude={cluster.position.lng}
              latitude={cluster.position.lat}
              anchor="center"
            >
              <motion.div
                className="relative cursor-pointer"
                onClick={() => setSelectedCluster(selectedCluster?.id === cluster.id ? null : cluster)}
                whileHover={{ scale: 1.1 }}
              >
                {/* Pulsing ring for high intensity */}
                {cluster.intensity > 0.8 && (
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      width: 40,
                      height: 40,
                      left: -20,
                      top: -20,
                      border: `2px solid ${getClusterColor(cluster.type)}`,
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}

                {/* Main marker */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                  style={{ backgroundColor: getClusterColor(cluster.type) }}
                >
                  <span className="text-white text-xs font-bold">
                    {cluster.intensity > 0.8 ? "!" : Math.round(cluster.items / 1000)}K
                  </span>
                </div>

                {/* Selected cluster popup */}
                {selectedCluster?.id === cluster.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-10 left-1/2 -translate-x-1/2 z-10 min-w-[180px]"
                  >
                    <div className="bg-black/90 text-white text-xs rounded-lg p-3 shadow-lg">
                      <div className="font-medium mb-1">{cluster.label}</div>
                      <div className="text-cyan-300">{cluster.items.toLocaleString()} items/km²</div>
                      <div className="text-gray-400 mt-1 capitalize">{cluster.type} zone</div>
                      <div className="text-gray-400">{cluster.size}km radius</div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </Marker>
          ))}

          {/* Tracking buoys */}
          {showBuoys &&
            trackingBuoys.map((buoy) => (
              <Marker
                key={buoy.id}
                longitude={buoy.position.lng}
                latitude={buoy.position.lat}
                anchor="center"
              >
                <div className="relative group">
                  {/* Buoy icon */}
                  <motion.div
                    className="w-5 h-5 rounded-full flex items-center justify-center border border-white shadow"
                    style={{ backgroundColor: getBuoyColor(buoy.status) }}
                    animate={buoy.status === "active" ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </motion.div>

                  {/* Hover tooltip */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      <div className="capitalize">{buoy.status}</div>
                      <div className="text-gray-400">{buoy.lastPing}</div>
                    </div>
                  </div>
                </div>
              </Marker>
            ))}
        </Map>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-[var(--border)] flex items-center gap-4 text-xs overflow-x-auto">
        <span className="text-[var(--foreground-muted)]">Debris Type:</span>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-[var(--foreground-muted)]">Microplastic</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-[var(--foreground-muted)]">Macroplastic</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-[var(--foreground-muted)]">Ghost Nets</span>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-[var(--foreground-muted)]">Fishing Gear</span>
        </div>
      </div>

      {/* Footer stats */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {totalItems.toLocaleString()}
              </p>
              <p className="text-xs text-[var(--foreground-muted)]">items/km² total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{criticalZones}</p>
              <p className="text-xs text-[var(--foreground-muted)]">critical zones</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-500">
                {activeBuoys}/{trackingBuoys.length}
              </p>
              <p className="text-xs text-[var(--foreground-muted)]">buoys active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-500">{particles.length}</p>
              <p className="text-xs text-[var(--foreground-muted)]">particles tracked</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCurrents(!showCurrents)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showCurrents
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "bg-[var(--background)] text-[var(--foreground-muted)]"
              }`}
            >
              Currents
            </button>
            <button
              onClick={() => setShowBuoys(!showBuoys)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showBuoys
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-[var(--background)] text-[var(--foreground-muted)]"
              }`}
            >
              Buoys
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
