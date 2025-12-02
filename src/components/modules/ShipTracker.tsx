"use client";

import { useState, useEffect, useMemo } from "react";
import Map, { Marker, Source, Layer, Popup, NavigationControl } from "react-map-gl/mapbox";
import { motion, AnimatePresence } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";
import { cities } from "@/data/modules";
import { Icon } from "@/components/ui/icons";
import { useMapStyle } from "@/hooks/useMapStyle";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface Vessel {
  id: string;
  name: string;
  type: "cargo" | "cruise" | "tanker" | "fishing";
  position: { lat: number; lng: number };
  heading: number; // degrees
  speed: number; // knots
  emissions: number; // tonnes CO2/day
  status: "anchored" | "moving" | "docked";
  destination?: string;
  eta?: string;
}

interface EmissionPlume {
  id: string;
  vesselId: string;
  points: Array<{ lat: number; lng: number; intensity: number }>;
}

// Generate mock vessel data
function generateVessels(cityLat: number, cityLng: number): Vessel[] {
  const vessels: Vessel[] = [
    {
      id: "v1",
      name: "MSC Aurora",
      type: "cargo",
      position: { lat: cityLat + 0.025, lng: cityLng + 0.02 },
      heading: 225,
      speed: 0,
      emissions: 85,
      status: "docked",
    },
    {
      id: "v2",
      name: "Ever Forward",
      type: "cargo",
      position: { lat: cityLat + 0.03, lng: cityLng + 0.035 },
      heading: 180,
      speed: 8,
      emissions: 120,
      status: "moving",
      destination: "Container Terminal A",
      eta: "14:30",
    },
    {
      id: "v3",
      name: "Carnival Spirit",
      type: "cruise",
      position: { lat: cityLat + 0.015, lng: cityLng + 0.025 },
      heading: 270,
      speed: 0,
      emissions: 320,
      status: "docked",
    },
    {
      id: "v4",
      name: "Nordic Voyager",
      type: "tanker",
      position: { lat: cityLat + 0.04, lng: cityLng - 0.01 },
      heading: 135,
      speed: 6,
      emissions: 95,
      status: "moving",
      destination: "Fuel Depot",
      eta: "15:45",
    },
    {
      id: "v5",
      name: "Ocean Pride",
      type: "cargo",
      position: { lat: cityLat + 0.02, lng: cityLng + 0.045 },
      heading: 90,
      speed: 0,
      emissions: 45,
      status: "anchored",
    },
    {
      id: "v6",
      name: "Stella Maris",
      type: "fishing",
      position: { lat: cityLat - 0.01, lng: cityLng + 0.03 },
      heading: 45,
      speed: 4,
      emissions: 8,
      status: "moving",
    },
    {
      id: "v7",
      name: "Blue Horizon",
      type: "cargo",
      position: { lat: cityLat + 0.035, lng: cityLng + 0.015 },
      heading: 200,
      speed: 10,
      emissions: 110,
      status: "moving",
      destination: "Container Terminal B",
      eta: "13:00",
    },
  ];
  return vessels;
}

// Generate emission plume trails
function generatePlumes(vessels: Vessel[]): EmissionPlume[] {
  return vessels
    .filter((v) => v.status !== "docked" || v.emissions > 50)
    .map((vessel) => {
      const points = [];
      const trailLength = vessel.status === "moving" ? 8 : 4;
      const headingRad = (vessel.heading * Math.PI) / 180;

      for (let i = 0; i < trailLength; i++) {
        const distance = i * 0.002;
        // Trail goes opposite to heading
        const lat = vessel.position.lat - Math.cos(headingRad) * distance;
        const lng = vessel.position.lng - Math.sin(headingRad) * distance;
        // Add some dispersion
        const dispersion = i * 0.0003;
        points.push({
          lat: lat + (Math.random() - 0.5) * dispersion,
          lng: lng + (Math.random() - 0.5) * dispersion,
          intensity: 1 - i / trailLength,
        });
      }

      return {
        id: `plume-${vessel.id}`,
        vesselId: vessel.id,
        points,
      };
    });
}

interface ShipTrackerProps {
  cityId?: string;
  className?: string;
  height?: number;
}

export function ShipTracker({
  cityId = "amsterdam",
  className = "",
  height = 500,
}: ShipTrackerProps) {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [showEmissions, setShowEmissions] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const { mapStyleUrl } = useMapStyle();

  const city = cities.find((c) => c.id === cityId) || cities[0];

  // Initialize vessels
  useEffect(() => {
    setVessels(generateVessels(city.coordinates.lat, city.coordinates.lng));
  }, [city]);

  // Animate vessel positions
  useEffect(() => {
    const interval = setInterval(() => {
      setVessels((prev) =>
        prev.map((vessel) => {
          if (vessel.status !== "moving") return vessel;

          const headingRad = (vessel.heading * Math.PI) / 180;
          const speedFactor = vessel.speed * 0.00001;

          return {
            ...vessel,
            position: {
              lat: vessel.position.lat + Math.cos(headingRad) * speedFactor,
              lng: vessel.position.lng + Math.sin(headingRad) * speedFactor,
            },
          };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const plumes = useMemo(() => generatePlumes(vessels), [vessels]);

  const filteredVessels = vessels.filter(
    (v) => filterType === "all" || v.type === filterType
  );

  const totalEmissions = vessels.reduce((acc, v) => acc + v.emissions, 0);

  const vesselIcons = {
    cargo: "📦",
    cruise: "🚢",
    tanker: "🛢️",
    fishing: "🎣",
  };

  const vesselColors = {
    cargo: "#F59E0B",
    cruise: "#8B5CF6",
    tanker: "#EF4444",
    fishing: "#10B981",
  };

  // GeoJSON for emission plumes
  const plumeGeojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: plumes.flatMap((plume) =>
        plume.points.map((point) => ({
          type: "Feature" as const,
          properties: {
            intensity: point.intensity,
            vesselId: plume.vesselId,
          },
          geometry: {
            type: "Point" as const,
            coordinates: [point.lng, point.lat],
          },
        }))
      ),
    }),
    [plumes]
  );

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
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Icon name="ship" className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">Port Emissions Tracker</h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              Live vessel tracking with emission attribution
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          {["all", "cargo", "cruise", "tanker", "fishing"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterType === type
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--background)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {type === "all" ? "All" : vesselIcons[type as keyof typeof vesselIcons]}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ height: height - 160 }}>
        <Map
          initialViewState={{
            longitude: city.coordinates.lng + 0.02,
            latitude: city.coordinates.lat + 0.02,
            zoom: 12,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={mapStyleUrl}
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={false}
        >
          <NavigationControl position="top-right" showCompass={true} />

          {/* Emission plumes */}
          {showEmissions && (
            <Source id="emission-plumes" type="geojson" data={plumeGeojson}>
              <Layer
                id="plume-heat"
                type="heatmap"
                paint={{
                  "heatmap-weight": ["get", "intensity"],
                  "heatmap-intensity": 0.6,
                  "heatmap-color": [
                    "interpolate",
                    ["linear"],
                    ["heatmap-density"],
                    0,
                    "rgba(0, 0, 0, 0)",
                    0.2,
                    "rgba(128, 128, 128, 0.3)",
                    0.4,
                    "rgba(160, 160, 160, 0.4)",
                    0.6,
                    "rgba(180, 180, 180, 0.5)",
                    1,
                    "rgba(200, 200, 200, 0.6)",
                  ],
                  "heatmap-radius": 25,
                  "heatmap-opacity": 0.7,
                }}
              />
            </Source>
          )}

          {/* Vessel markers */}
          <AnimatePresence>
            {filteredVessels.map((vessel) => (
              <Marker
                key={vessel.id}
                longitude={vessel.position.lng}
                latitude={vessel.position.lat}
                anchor="center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="relative cursor-pointer"
                  onClick={() => setSelectedVessel(vessel)}
                  style={{
                    transform: `rotate(${vessel.heading}deg)`,
                  }}
                >
                  {/* Vessel icon */}
                  <motion.div
                    className="relative"
                    animate={
                      vessel.status === "moving"
                        ? { y: [0, -2, 0] }
                        : {}
                    }
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg border-2"
                      style={{
                        backgroundColor: vesselColors[vessel.type],
                        borderColor: "white",
                        transform: `rotate(-${vessel.heading}deg)`,
                      }}
                    >
                      <span className="text-sm">
                        {vesselIcons[vessel.type]}
                      </span>
                    </div>

                    {/* Emission indicator */}
                    {vessel.emissions > 100 && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border border-white"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </motion.div>

                  {/* Status indicator */}
                  <div
                    className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full border border-white ${
                      vessel.status === "moving"
                        ? "bg-green-500"
                        : vessel.status === "anchored"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                    style={{ transform: `translateX(-50%) rotate(-${vessel.heading}deg)` }}
                  />
                </motion.div>
              </Marker>
            ))}
          </AnimatePresence>

          {/* Selected vessel popup */}
          {selectedVessel && (
            <Popup
              longitude={selectedVessel.position.lng}
              latitude={selectedVessel.position.lat}
              anchor="bottom"
              onClose={() => setSelectedVessel(null)}
              closeButton={true}
              closeOnClick={false}
            >
              <div className="p-2 min-w-[220px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{vesselIcons[selectedVessel.type]}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedVessel.name}</h4>
                    <p className="text-xs text-gray-500 capitalize">{selectedVessel.type}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium capitalize ${
                      selectedVessel.status === "moving" ? "text-green-600" :
                      selectedVessel.status === "anchored" ? "text-yellow-600" : "text-blue-600"
                    }`}>
                      {selectedVessel.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Speed:</span>
                    <span className="font-medium text-gray-900">{selectedVessel.speed} knots</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">CO2 Emissions:</span>
                    <span className={`font-medium ${
                      selectedVessel.emissions > 100 ? "text-red-600" : "text-gray-900"
                    }`}>
                      {selectedVessel.emissions} t/day
                    </span>
                  </div>
                  {selectedVessel.destination && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Destination:</span>
                      <span className="font-medium text-gray-900">{selectedVessel.destination}</span>
                    </div>
                  )}
                  {selectedVessel.eta && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">ETA:</span>
                      <span className="font-medium text-gray-900">{selectedVessel.eta}</span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Footer stats */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {filteredVessels.length}
              </p>
              <p className="text-xs text-[var(--foreground-muted)]">Vessels Tracked</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-500">
                {Math.round(totalEmissions)}
              </p>
              <p className="text-xs text-[var(--foreground-muted)]">Tonnes CO2/day</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">
                {vessels.filter((v) => v.status === "moving").length}
              </p>
              <p className="text-xs text-[var(--foreground-muted)]">In Transit</p>
            </div>
          </div>

          <button
            onClick={() => setShowEmissions(!showEmissions)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showEmissions
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--background)] text-[var(--foreground-muted)]"
            }`}
          >
            <Icon name="waves" className="w-4 h-4" />
            Emissions
          </button>
        </div>
      </div>
    </motion.div>
  );
}
