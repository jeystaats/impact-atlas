"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Map, { Source, Layer, Marker, NavigationControl } from "react-map-gl/mapbox";
import { motion, AnimatePresence } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";
import { cities } from "@/data/modules";
import { Icon } from "@/components/ui/icons";
import { useMapStyle } from "@/hooks/useMapStyle";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// AQI Color Scale (EPA Standard)
const AQI_COLORS = {
  good: "#10B981", // 0-50
  moderate: "#FBBF24", // 51-100
  unhealthySensitive: "#F97316", // 101-150
  unhealthy: "#EF4444", // 151-200
  veryUnhealthy: "#8B5CF6", // 201-300
  hazardous: "#7C2D12", // 301+
};

const AQI_THRESHOLDS = [
  { max: 50, label: "Good", color: AQI_COLORS.good },
  { max: 100, label: "Moderate", color: AQI_COLORS.moderate },
  { max: 150, label: "Unhealthy (Sensitive)", color: AQI_COLORS.unhealthySensitive },
  { max: 200, label: "Unhealthy", color: AQI_COLORS.unhealthy },
  { max: 300, label: "Very Unhealthy", color: AQI_COLORS.veryUnhealthy },
  { max: 500, label: "Hazardous", color: AQI_COLORS.hazardous },
];

// Pollutant types
type PollutantType = "pm25" | "no2" | "o3" | "so2";

const POLLUTANT_LABELS: Record<PollutantType, string> = {
  pm25: "PM2.5",
  no2: "NO2",
  o3: "O3",
  so2: "SO2",
};

// Time of day options
type TimeOfDay = "morning" | "rush_hour" | "afternoon" | "evening";

const TIME_LABELS: Record<TimeOfDay, string> = {
  morning: "Morning",
  rush_hour: "Rush Hour",
  afternoon: "Afternoon",
  evening: "Evening",
};

// Time multipliers for AQI values
const TIME_MULTIPLIERS: Record<TimeOfDay, number> = {
  morning: 0.75,
  rush_hour: 1.25,
  afternoon: 0.9,
  evening: 0.65,
};

// Interfaces
interface MonitoringStation {
  id: string;
  lat: number;
  lng: number;
  name: string;
  aqi: number;
  pm25: number;
  no2: number;
  o3: number;
  so2: number;
  status: "online" | "offline" | "maintenance";
  type: "traffic" | "industrial" | "background" | "residential" | "urban";
}

interface PollutionZone {
  id: string;
  center: { lat: number; lng: number };
  radius: number;
  intensity: number; // 0-1
  primaryPollutant: PollutantType;
}

interface WindParticle {
  id: string;
  position: { lat: number; lng: number };
  velocity: { lat: number; lng: number };
  age: number;
  maxAge: number;
  opacity: number;
}

// Barcelona Monitoring Stations
function generateMonitoringStations(cityLat: number, cityLng: number): MonitoringStation[] {
  return [
    {
      id: "ms-eixample",
      lat: cityLat + 0.006,
      lng: cityLng - 0.008,
      name: "Eixample",
      aqi: 120,
      pm25: 45,
      no2: 68,
      o3: 35,
      so2: 12,
      status: "online",
      type: "traffic",
    },
    {
      id: "ms-zona-franca",
      lat: cityLat - 0.030,
      lng: cityLng - 0.048,
      name: "Zona Franca",
      aqi: 140,
      pm25: 58,
      no2: 52,
      o3: 28,
      so2: 38,
      status: "online",
      type: "industrial",
    },
    {
      id: "ms-port-vell",
      lat: cityLat - 0.012,
      lng: cityLng + 0.018,
      name: "Port Vell",
      aqi: 95,
      pm25: 32,
      no2: 48,
      o3: 42,
      so2: 22,
      status: "online",
      type: "urban",
    },
    {
      id: "ms-placa-catalunya",
      lat: cityLat + 0.002,
      lng: cityLng - 0.003,
      name: "Placa Catalunya",
      aqi: 85,
      pm25: 28,
      no2: 55,
      o3: 38,
      so2: 8,
      status: "online",
      type: "urban",
    },
    {
      id: "ms-collserola",
      lat: cityLat + 0.045,
      lng: cityLng - 0.025,
      name: "Collserola",
      aqi: 35,
      pm25: 12,
      no2: 15,
      o3: 52,
      so2: 3,
      status: "online",
      type: "background",
    },
    {
      id: "ms-sant-adria",
      lat: cityLat + 0.025,
      lng: cityLng + 0.065,
      name: "Sant Adria",
      aqi: 110,
      pm25: 42,
      no2: 45,
      o3: 32,
      so2: 28,
      status: "online",
      type: "industrial",
    },
    {
      id: "ms-gracia",
      lat: cityLat + 0.018,
      lng: cityLng - 0.012,
      name: "Gracia",
      aqi: 75,
      pm25: 25,
      no2: 42,
      o3: 45,
      so2: 6,
      status: "online",
      type: "residential",
    },
    {
      id: "ms-poblenou",
      lat: cityLat + 0.008,
      lng: cityLng + 0.038,
      name: "Poblenou",
      aqi: 88,
      pm25: 30,
      no2: 52,
      o3: 40,
      so2: 15,
      status: "online",
      type: "urban",
    },
    {
      id: "ms-sants",
      lat: cityLat - 0.008,
      lng: cityLng - 0.035,
      name: "Sants",
      aqi: 92,
      pm25: 35,
      no2: 58,
      o3: 36,
      so2: 10,
      status: "maintenance",
      type: "traffic",
    },
    {
      id: "ms-diagonal",
      lat: cityLat + 0.012,
      lng: cityLng + 0.015,
      name: "Diagonal Mar",
      aqi: 68,
      pm25: 22,
      no2: 38,
      o3: 48,
      so2: 5,
      status: "online",
      type: "residential",
    },
  ];
}

// Generate pollution zones based on station data
function generatePollutionZones(
  stations: MonitoringStation[],
  cityLat: number,
  cityLng: number
): PollutionZone[] {
  const zones: PollutionZone[] = [];

  // Create zones around high-pollution stations
  stations
    .filter((s) => s.aqi > 80)
    .forEach((station, index) => {
      // Determine primary pollutant
      const pollutants: { type: PollutantType; value: number }[] = [
        { type: "pm25", value: station.pm25 },
        { type: "no2", value: station.no2 },
        { type: "o3", value: station.o3 },
        { type: "so2", value: station.so2 },
      ];
      const primary = pollutants.reduce((a, b) => (a.value > b.value ? a : b));

      zones.push({
        id: `zone-${station.id}`,
        center: { lat: station.lat, lng: station.lng },
        radius: 0.008 + (station.aqi / 200) * 0.006,
        intensity: Math.min(station.aqi / 150, 1),
        primaryPollutant: primary.type,
      });
    });

  // Add some interpolated zones for smoother coverage
  zones.push({
    id: "zone-eixample-core",
    center: { lat: cityLat + 0.004, lng: cityLng - 0.005 },
    radius: 0.012,
    intensity: 0.7,
    primaryPollutant: "no2",
  });

  zones.push({
    id: "zone-industrial-corridor",
    center: { lat: cityLat - 0.020, lng: cityLng - 0.030 },
    radius: 0.018,
    intensity: 0.85,
    primaryPollutant: "pm25",
  });

  return zones;
}

// Get AQI color based on value
function getAQIColor(aqi: number): string {
  for (const threshold of AQI_THRESHOLDS) {
    if (aqi <= threshold.max) return threshold.color;
  }
  return AQI_COLORS.hazardous;
}

// Get AQI label based on value
function getAQILabel(aqi: number): string {
  for (const threshold of AQI_THRESHOLDS) {
    if (aqi <= threshold.max) return threshold.label;
  }
  return "Hazardous";
}

interface AirQualityMapProps {
  cityId?: string;
  className?: string;
  height?: number;
  showControls?: boolean;
}

export function AirQualityMap({
  cityId = "barcelona",
  className = "",
  height = 500,
  showControls = true,
}: AirQualityMapProps) {
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<MonitoringStation | null>(null);
  const [activePollutant, setActivePollutant] = useState<PollutantType>("pm25");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("rush_hour");
  const [windParticles, setWindParticles] = useState<WindParticle[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showWind, setShowWind] = useState(true);
  const [pulsePhase, setPulsePhase] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);
  const { mapStyleUrl } = useMapStyle();

  const city = cities.find((c) => c.id === cityId) || cities[0];

  // Wind configuration (Barcelona typically has sea breeze from SE)
  const windDirection = useMemo(() => {
    const directions: Record<TimeOfDay, number> = {
      morning: 135, // SE - sea breeze beginning
      rush_hour: 120, // ESE
      afternoon: 90, // E - strong sea breeze
      evening: 180, // S - land breeze transition
    };
    return directions[timeOfDay];
  }, [timeOfDay]);

  const windSpeed = useMemo(() => {
    const speeds: Record<TimeOfDay, number> = {
      morning: 0.6,
      rush_hour: 0.4,
      afternoon: 0.8,
      evening: 0.5,
    };
    return speeds[timeOfDay];
  }, [timeOfDay]);

  // Initialize stations
  useEffect(() => {
    const baseStations = generateMonitoringStations(
      city.coordinates.lat,
      city.coordinates.lng
    );
    setStations(baseStations);
  }, [city]);

  // Apply time-of-day multiplier to station values
  const adjustedStations = useMemo(() => {
    const multiplier = TIME_MULTIPLIERS[timeOfDay];
    return stations.map((station) => ({
      ...station,
      aqi: Math.round(station.aqi * multiplier),
      pm25: Math.round(station.pm25 * multiplier),
      no2: Math.round(station.no2 * multiplier),
      o3: Math.round(station.o3 * (timeOfDay === "afternoon" ? 1.3 : multiplier)),
      so2: Math.round(station.so2 * multiplier),
    }));
  }, [stations, timeOfDay]);

  // Generate pollution zones
  const pollutionZones = useMemo(
    () =>
      generatePollutionZones(
        adjustedStations,
        city.coordinates.lat,
        city.coordinates.lng
      ),
    [adjustedStations, city]
  );

  // Spawn wind particle
  const spawnWindParticle = useCallback(() => {
    const windRad = (windDirection * Math.PI) / 180;
    // Spawn from upwind edge
    const spawnOffset = 0.06;
    const spawnLat =
      city.coordinates.lat - Math.cos(windRad) * spawnOffset + (Math.random() - 0.5) * 0.04;
    const spawnLng =
      city.coordinates.lng - Math.sin(windRad) * spawnOffset + (Math.random() - 0.5) * 0.04;

    return {
      id: `wind-${Date.now()}-${Math.random()}`,
      position: { lat: spawnLat, lng: spawnLng },
      velocity: {
        lat: Math.cos(windRad) * windSpeed * 0.0002,
        lng: Math.sin(windRad) * windSpeed * 0.0002,
      },
      age: 0,
      maxAge: 150 + Math.random() * 100,
      opacity: 0.3 + Math.random() * 0.4,
    };
  }, [city, windDirection, windSpeed]);

  // Animation loop for wind particles and pulse
  useEffect(() => {
    let frameCount = 0;

    const animate = () => {
      frameCount++;

      // Update pulse phase for high-pollution markers
      setPulsePhase((prev) => (prev + 0.05) % (Math.PI * 2));

      // Update wind particles
      if (showWind) {
        setWindParticles((prev) => {
          const newParticles = [...prev];

          // Spawn new particles
          if (frameCount % 3 === 0 && newParticles.length < 80) {
            newParticles.push(spawnWindParticle());
          }

          // Update existing particles
          return newParticles
            .map((particle) => ({
              ...particle,
              position: {
                lat: particle.position.lat + particle.velocity.lat,
                lng: particle.position.lng + particle.velocity.lng,
              },
              age: particle.age + 1,
            }))
            .filter((p) => p.age < p.maxAge);
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showWind, spawnWindParticle]);

  // GeoJSON for heatmap layer
  const heatmapGeojson = useMemo(() => {
    const features: GeoJSON.Feature[] = [];

    // Add station points with pollution intensity
    adjustedStations.forEach((station) => {
      const pollutantValue = station[activePollutant];
      const normalizedIntensity = Math.min(pollutantValue / 60, 1);

      features.push({
        type: "Feature",
        properties: {
          intensity: normalizedIntensity,
          aqi: station.aqi,
        },
        geometry: {
          type: "Point",
          coordinates: [station.lng, station.lat],
        },
      });

      // Add surrounding points for smoother heatmap
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const distance = 0.004 + Math.random() * 0.003;
        features.push({
          type: "Feature",
          properties: {
            intensity: normalizedIntensity * (0.5 + Math.random() * 0.3),
            aqi: station.aqi * (0.6 + Math.random() * 0.3),
          },
          geometry: {
            type: "Point",
            coordinates: [
              station.lng + Math.cos(angle) * distance,
              station.lat + Math.sin(angle) * distance,
            ],
          },
        });
      }
    });

    // Add pollution zone centers
    pollutionZones.forEach((zone) => {
      features.push({
        type: "Feature",
        properties: {
          intensity: zone.intensity,
          aqi: zone.intensity * 150,
        },
        geometry: {
          type: "Point",
          coordinates: [zone.center.lng, zone.center.lat],
        },
      });
    });

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }, [adjustedStations, pollutionZones, activePollutant]);

  // Heatmap layer style with AQI color gradient
  const heatmapLayerStyle = useMemo(
    () => ({
      id: "aqi-heatmap",
      type: "heatmap",
      paint: {
        "heatmap-weight": ["interpolate", ["linear"], ["get", "intensity"], 0, 0, 1, 1],
        "heatmap-intensity": 0.8,
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(0, 0, 0, 0)",
          0.15,
          AQI_COLORS.good,
          0.35,
          AQI_COLORS.moderate,
          0.55,
          AQI_COLORS.unhealthySensitive,
          0.75,
          AQI_COLORS.unhealthy,
          0.9,
          AQI_COLORS.veryUnhealthy,
          1,
          AQI_COLORS.hazardous,
        ],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 30, 14, 50],
        "heatmap-opacity": 0.75,
      },
    }),
    []
  );

  // Calculate statistics
  const avgAQI = useMemo(() => {
    const online = adjustedStations.filter((s) => s.status === "online");
    if (online.length === 0) return 0;
    return Math.round(online.reduce((acc, s) => acc + s.aqi, 0) / online.length);
  }, [adjustedStations]);

  const onlineStations = adjustedStations.filter((s) => s.status === "online").length;

  const aqiTrend = useMemo(() => {
    // Simulated trend based on time of day
    if (timeOfDay === "rush_hour") return { direction: "up", value: "+15%" };
    if (timeOfDay === "evening") return { direction: "down", value: "-22%" };
    if (timeOfDay === "morning") return { direction: "down", value: "-8%" };
    return { direction: "neutral", value: "0%" };
  }, [timeOfDay]);

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
            <Icon name="activity" className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">Air Quality Monitor</h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              Real-time AQI with pollutant tracking and wind dispersion
            </p>
          </div>
        </div>

        {/* Time Controls */}
        {showControls && (
          <div className="flex items-center gap-2">
            {(Object.keys(TIME_LABELS) as TimeOfDay[]).map((time) => (
              <button
                key={time}
                onClick={() => setTimeOfDay(time)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  timeOfDay === time
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "bg-[var(--background)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {TIME_LABELS[time]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pollutant Filter */}
      {showControls && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border)] bg-[var(--background)]/50">
          <span className="text-xs text-[var(--foreground-muted)] mr-2">Pollutant:</span>
          {(Object.keys(POLLUTANT_LABELS) as PollutantType[]).map((pollutant) => (
            <button
              key={pollutant}
              onClick={() => setActivePollutant(pollutant)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activePollutant === pollutant
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
              }`}
            >
              {POLLUTANT_LABELS[pollutant]}
            </button>
          ))}
        </div>
      )}

      {/* Map */}
      <div style={{ height: height - (showControls ? 220 : 160) }}>
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
          <NavigationControl position="top-right" showCompass={true} />

          {/* AQI Heatmap Layer */}
          {showHeatmap && (
            <Source id="aqi-data" type="geojson" data={heatmapGeojson}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Layer {...(heatmapLayerStyle as any)} />
            </Source>
          )}

          {/* Wind Particles */}
          <AnimatePresence>
            {showWind &&
              windParticles.map((particle) => (
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
                      opacity: particle.opacity * (1 - particle.age / particle.maxAge),
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="rounded-full bg-white/60"
                    style={{
                      width: 3,
                      height: 3,
                      boxShadow: "0 0 4px rgba(255, 255, 255, 0.5)",
                    }}
                  />
                </Marker>
              ))}
          </AnimatePresence>

          {/* Monitoring Station Markers */}
          <AnimatePresence>
            {adjustedStations.map((station) => {
              const isHighPollution = station.aqi > 100;
              const pulseScale = isHighPollution ? 1 + Math.sin(pulsePhase) * 0.15 : 1;

              return (
                <Marker
                  key={station.id}
                  longitude={station.lng}
                  latitude={station.lat}
                  anchor="center"
                >
                  <motion.div
                    className="relative cursor-pointer"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onClick={() => setSelectedStation(station)}
                    whileHover={{ scale: 1.1 }}
                  >
                    {/* Pulse ring for high pollution */}
                    {isHighPollution && (
                      <motion.div
                        className="absolute rounded-full border-2"
                        style={{
                          width: 48,
                          height: 48,
                          left: -14,
                          top: -14,
                          borderColor: getAQIColor(station.aqi),
                          transform: `scale(${pulseScale})`,
                        }}
                        animate={{
                          opacity: [0.6, 0, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}

                    {/* Station marker */}
                    <div
                      className="w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                      style={{
                        backgroundColor: getAQIColor(station.aqi),
                      }}
                    >
                      <span className="text-[8px] font-bold text-white">
                        {station.aqi}
                      </span>
                    </div>

                    {/* Status indicator */}
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                        station.status === "online"
                          ? "bg-green-500"
                          : station.status === "maintenance"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                  </motion.div>
                </Marker>
              );
            })}
          </AnimatePresence>

          {/* Selected station popup */}
          {selectedStation && (
            <Marker
              longitude={selectedStation.lng}
              latitude={selectedStation.lat}
              anchor="bottom"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-xl p-3 min-w-[200px] -translate-x-1/2 mb-8"
              >
                <button
                  onClick={() => setSelectedStation(null)}
                  className="absolute top-2 right-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                >
                  <Icon name="x" className="w-3 h-3" />
                </button>

                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${getAQIColor(selectedStation.aqi)}20` }}
                  >
                    <span
                      className="text-sm font-bold"
                      style={{ color: getAQIColor(selectedStation.aqi) }}
                    >
                      {selectedStation.aqi}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)] text-sm">
                      {selectedStation.name}
                    </h4>
                    <p
                      className="text-xs font-medium"
                      style={{ color: getAQIColor(selectedStation.aqi) }}
                    >
                      {getAQILabel(selectedStation.aqi)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-muted)]">PM2.5:</span>
                    <span className="font-medium text-[var(--foreground)]">
                      {selectedStation.pm25} ug/m3
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-muted)]">NO2:</span>
                    <span className="font-medium text-[var(--foreground)]">
                      {selectedStation.no2} ppb
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-muted)]">O3:</span>
                    <span className="font-medium text-[var(--foreground)]">
                      {selectedStation.o3} ppb
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-muted)]">SO2:</span>
                    <span className="font-medium text-[var(--foreground)]">
                      {selectedStation.so2} ppb
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs text-[var(--foreground-muted)] capitalize">
                    {selectedStation.type} station
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      selectedStation.status === "online"
                        ? "text-green-500"
                        : selectedStation.status === "maintenance"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {selectedStation.status}
                  </span>
                </div>
              </motion.div>
            </Marker>
          )}

          {/* Wind Direction Indicator */}
          {showWind && (
            <div className="absolute bottom-4 left-4 bg-[var(--background)]/90 backdrop-blur-sm rounded-lg p-2 border border-[var(--border)]">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: windDirection }}
                  className="w-6 h-6 flex items-center justify-center"
                >
                  <Icon name="arrowRight" className="w-4 h-4 text-[var(--foreground)]" />
                </motion.div>
                <div className="text-xs">
                  <p className="text-[var(--foreground-muted)]">Wind</p>
                  <p className="font-medium text-[var(--foreground)]">
                    {Math.round(windSpeed * 15)} km/h
                  </p>
                </div>
              </div>
            </div>
          )}
        </Map>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--background)]/50">
        <div className="flex items-center gap-4">
          <span className="text-xs text-[var(--foreground-muted)]">AQI Scale:</span>
          <div className="flex items-center gap-1">
            {AQI_THRESHOLDS.slice(0, 5).map((threshold, index) => (
              <div key={threshold.label} className="flex items-center">
                <div
                  className="w-6 h-2 first:rounded-l last:rounded-r"
                  style={{ backgroundColor: threshold.color }}
                  title={threshold.label}
                />
                {index < 4 && (
                  <span className="text-[10px] text-[var(--foreground-muted)] mx-0.5">
                    {threshold.max}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] text-[var(--foreground-muted)]">Online</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-[10px] text-[var(--foreground-muted)]">Maintenance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Footer */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-2">
                <p
                  className="text-2xl font-bold"
                  style={{ color: getAQIColor(avgAQI) }}
                >
                  {avgAQI}
                </p>
                <span
                  className="text-xs font-medium px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${getAQIColor(avgAQI)}20`,
                    color: getAQIColor(avgAQI),
                  }}
                >
                  {getAQILabel(avgAQI)}
                </span>
              </div>
              <p className="text-xs text-[var(--foreground-muted)]">Average AQI</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {onlineStations}
              </p>
              <p className="text-xs text-[var(--foreground-muted)]">Active Monitors</p>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <Icon
                  name={aqiTrend.direction === "up" ? "trendingUp" : "trendingDown"}
                  className={`w-4 h-4 ${
                    aqiTrend.direction === "up" ? "text-red-500" : "text-green-500"
                  }`}
                />
                <p
                  className={`text-2xl font-bold ${
                    aqiTrend.direction === "up" ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {aqiTrend.value}
                </p>
              </div>
              <p className="text-xs text-[var(--foreground-muted)]">24h Trend</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showHeatmap
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "bg-[var(--background)] text-[var(--foreground-muted)]"
              }`}
            >
              <Icon name="layers" className="w-4 h-4" />
              Heatmap
            </button>
            <button
              onClick={() => setShowWind(!showWind)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showWind
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "bg-[var(--background)] text-[var(--foreground-muted)]"
              }`}
            >
              <Icon name="activity" className="w-4 h-4" />
              Wind
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
