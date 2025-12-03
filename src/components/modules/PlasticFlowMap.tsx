"use client";

/**
 * PlasticFlowMap Component
 *
 * Ocean current simulation with plastic flow prediction:
 * - Animated plastic particles following currents
 * - Accumulation zone forecasting
 * - Prediction path visualization
 *
 * Refactored to use BaseMap for common map functionality.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BaseMap, Source, Layer, Marker } from "@/components/maps";
import type { BaseMapRef } from "@/components/maps";
import { cities } from "@/data/modules";
import { Icon } from "@/components/ui/icons";

// =============================================================================
// TYPES
// =============================================================================

interface FlowParticle {
  id: string;
  position: { lat: number; lng: number };
  velocity: { lat: number; lng: number };
  age: number;
  maxAge: number;
  size: number;
}

interface AccumulationZone {
  id: string;
  position: { lat: number; lng: number };
  intensity: number;
  label: string;
  plasticAmount: string;
}

interface CurrentVector {
  position: { lat: number; lng: number };
  direction: number;
  strength: number;
}

interface PlasticFlowMapProps {
  cityId?: string;
  className?: string;
  height?: number;
}

// =============================================================================
// DATA GENERATORS
// =============================================================================

function generateCurrents(cityLat: number, cityLng: number): CurrentVector[] {
  const currents: CurrentVector[] = [];
  const gridSize = 6;
  const spacing = 0.015;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const lat = cityLat - 0.02 + i * spacing;
      const lng = cityLng + j * spacing;
      const centerLat = cityLat + 0.01;
      const centerLng = cityLng + 0.04;
      const angle = Math.atan2(centerLat - lat, centerLng - lng);

      currents.push({
        position: { lat, lng },
        direction: (angle * 180) / Math.PI + (Math.random() - 0.5) * 30,
        strength: 0.3 + Math.random() * 0.5,
      });
    }
  }
  return currents;
}

function generateAccumulationZones(cityLat: number, cityLng: number): AccumulationZone[] {
  return [
    { id: "az1", position: { lat: cityLat - 0.010, lng: cityLng + 0.019 }, intensity: 0.95, label: "Platja de la Barceloneta", plasticAmount: "380 kg/week" },
    { id: "az2", position: { lat: cityLat + 0.030, lng: cityLng + 0.056 }, intensity: 0.98, label: "Desembocadura del Besòs", plasticAmount: "520 kg/week" },
    { id: "az3", position: { lat: cityLat, lng: cityLng + 0.032 }, intensity: 0.70, label: "Port Olímpic Marina", plasticAmount: "245 kg/week" },
    { id: "az4", position: { lat: cityLat + 0.010, lng: cityLng + 0.042 }, intensity: 0.45, label: "Platja del Bogatell", plasticAmount: "165 kg/week" },
  ];
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ParticleMarkerProps {
  particle: FlowParticle;
}

function ParticleMarker({ particle }: ParticleMarkerProps) {
  return (
    <Marker longitude={particle.position.lng} latitude={particle.position.lat} anchor="center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 - particle.age / particle.maxAge }}
        exit={{ scale: 0, opacity: 0 }}
        className="rounded-full"
        style={{
          width: particle.size,
          height: particle.size,
          backgroundColor: `hsl(${200 + particle.age * 0.3}, 70%, 60%)`,
          boxShadow: "0 0 4px rgba(59, 130, 246, 0.5)",
        }}
      />
    </Marker>
  );
}

interface ZoneMarkerProps {
  zone: AccumulationZone;
}

function ZoneMarker({ zone }: ZoneMarkerProps) {
  return (
    <Marker longitude={zone.position.lng} latitude={zone.position.lat} anchor="center">
      <motion.div className="relative" initial={{ scale: 0 }} animate={{ scale: 1 }}>
        <motion.div
          className="absolute rounded-full border-2 border-red-500"
          style={{
            width: 40 + zone.intensity * 20,
            height: 40 + zone.intensity * 20,
            left: -(20 + zone.intensity * 10),
            top: -(20 + zone.intensity * 10),
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center"
          style={{ marginLeft: -12, marginTop: -12 }}
        >
          <span className="text-white text-xs font-bold">!</span>
        </div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <div className="bg-black/80 text-white text-xs px-2 py-1 rounded">
            {zone.label}<br />
            <span className="text-red-300">{zone.plasticAmount}</span>
          </div>
        </div>
      </motion.div>
    </Marker>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PlasticFlowMap({ cityId = "barcelona", className = "", height = 500 }: PlasticFlowMapProps) {
  // State
  const [particles, setParticles] = useState<FlowParticle[]>([]);
  const [showCurrents, setShowCurrents] = useState(true);
  const [showPrediction, setShowPrediction] = useState(true);
  const [predictionDays, setPredictionDays] = useState(7);

  // Refs
  const animationRef = useRef<number | undefined>(undefined);
  const mapRef = useRef<BaseMapRef>(null);

  // City data
  const city = cities.find((c) => c.id === cityId) || cities[0];

  // Generated data
  const currents = useMemo(() => generateCurrents(city.coordinates.lat, city.coordinates.lng), [city]);
  const accumulationZones = useMemo(() => generateAccumulationZones(city.coordinates.lat, city.coordinates.lng), [city]);

  // Auto-fit bounds
  useEffect(() => {
    if (accumulationZones.length > 0 && mapRef.current) {
      const points = [...accumulationZones.map((z) => z.position), city.coordinates];
      mapRef.current.fitBounds(points, 50);
    }
  }, [accumulationZones, city]);

  // Get current vector at position
  const getCurrentAt = useCallback((lat: number, lng: number) => {
    let totalVelLat = 0, totalVelLng = 0, totalWeight = 0;
    currents.forEach((current) => {
      const dist = Math.sqrt(Math.pow(current.position.lat - lat, 2) + Math.pow(current.position.lng - lng, 2));
      const weight = Math.max(0, 1 - dist / 0.03) * current.strength;
      if (weight > 0) {
        const radians = (current.direction * Math.PI) / 180;
        totalVelLat += Math.sin(radians) * weight;
        totalVelLng += Math.cos(radians) * weight;
        totalWeight += weight;
      }
    });
    if (totalWeight > 0) {
      return { lat: (totalVelLat / totalWeight) * 0.0001, lng: (totalVelLng / totalWeight) * 0.0001 };
    }
    return { lat: 0, lng: 0 };
  }, [currents]);

  // Spawn particle
  const spawnParticle = useCallback(() => {
    const sources = [
      { lat: city.coordinates.lat - 0.02, lng: city.coordinates.lng + 0.01 },
      { lat: city.coordinates.lat, lng: city.coordinates.lng + 0.005 },
      { lat: city.coordinates.lat + 0.015, lng: city.coordinates.lng + 0.015 },
    ];
    const source = sources[Math.floor(Math.random() * sources.length)];
    return {
      id: `p-${Date.now()}-${Math.random()}`,
      position: { lat: source.lat + (Math.random() - 0.5) * 0.01, lng: source.lng + (Math.random() - 0.5) * 0.01 },
      velocity: { lat: 0, lng: 0 },
      age: 0,
      maxAge: 200 + Math.random() * 100,
      size: 2 + Math.random() * 3,
    };
  }, [city]);

  // Animation loop
  useEffect(() => {
    let frameCount = 0;
    const animate = () => {
      frameCount++;
      setParticles((prev) => {
        const newParticles = [...prev];
        if (frameCount % 5 === 0 && newParticles.length < 100) newParticles.push(spawnParticle());
        return newParticles
          .map((particle) => {
            const current = getCurrentAt(particle.position.lat, particle.position.lng);
            return {
              ...particle,
              position: {
                lat: particle.position.lat + current.lat + particle.velocity.lat * 0.5,
                lng: particle.position.lng + current.lng + particle.velocity.lng * 0.5,
              },
              velocity: { lat: current.lat * 0.3, lng: current.lng * 0.3 },
              age: particle.age + 1,
            };
          })
          .filter((p) => p.age < p.maxAge);
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [getCurrentAt, spawnParticle]);

  // GeoJSON data
  const currentArrowsGeojson = useMemo(() => ({
    type: "FeatureCollection" as const,
    features: currents.map((current) => ({
      type: "Feature" as const,
      properties: { direction: current.direction, strength: current.strength },
      geometry: { type: "Point" as const, coordinates: [current.position.lng, current.position.lat] },
    })),
  }), [currents]);

  const predictionPathGeojson = useMemo(() => {
    if (!showPrediction) return { type: "FeatureCollection" as const, features: [] };
    const paths = accumulationZones.map((zone) => {
      const points: [number, number][] = [];
      let lat = city.coordinates.lat;
      let lng = city.coordinates.lng + 0.01;
      for (let i = 0; i < 30; i++) {
        points.push([lng, lat]);
        const current = getCurrentAt(lat, lng);
        lat += current.lat * 3;
        lng += current.lng * 3;
      }
      points.push([zone.position.lng, zone.position.lat]);
      return {
        type: "Feature" as const,
        properties: { zoneId: zone.id },
        geometry: { type: "LineString" as const, coordinates: points },
      };
    });
    return { type: "FeatureCollection" as const, features: paths };
  }, [showPrediction, accumulationZones, city, getCurrentAt]);

  const mapHeight = height - 160;

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
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Icon name="waves" className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">Plastic Flow Prediction</h3>
            <p className="text-xs text-[var(--foreground-muted)]">Ocean current simulation with accumulation forecasting</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--foreground-muted)]">Forecast:</span>
            <select
              value={predictionDays}
              onChange={(e) => setPredictionDays(Number(e.target.value))}
              className="bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--foreground)]"
            >
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map */}
      <BaseMap
        ref={mapRef}
        center={{ lat: city.coordinates.lat, lng: city.coordinates.lng + 0.03 }}
        zoom={12}
        height={mapHeight}
        showNavigation={true}
        navigationPosition="top-right"
      >
        {/* Prediction paths */}
        {showPrediction && (
          <Source id="prediction-paths" type="geojson" data={predictionPathGeojson}>
            <Layer id="prediction-line" type="line" paint={{ "line-color": "#3B82F6", "line-width": 2, "line-opacity": 0.5, "line-dasharray": [2, 2] }} />
          </Source>
        )}

        {/* Current arrows */}
        {showCurrents && (
          <Source id="current-arrows" type="geojson" data={currentArrowsGeojson}>
            <Layer id="current-circles" type="circle" paint={{ "circle-radius": 3, "circle-color": "#60A5FA", "circle-opacity": ["get", "strength"] }} />
          </Source>
        )}

        {/* Particles */}
        <AnimatePresence>
          {particles.map((particle) => <ParticleMarker key={particle.id} particle={particle} />)}
        </AnimatePresence>

        {/* Accumulation zones */}
        {accumulationZones.map((zone) => <ZoneMarker key={zone.id} zone={zone} />)}
      </BaseMap>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{accumulationZones.length}</p>
              <p className="text-xs text-[var(--foreground-muted)]">Accumulation Zones</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">1.3K</p>
              <p className="text-xs text-[var(--foreground-muted)]">kg/week forecast</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">{particles.length}</p>
              <p className="text-xs text-[var(--foreground-muted)]">Particles simulated</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCurrents(!showCurrents)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${showCurrents ? "bg-blue-500/20 text-blue-400" : "bg-[var(--background)] text-[var(--foreground-muted)]"}`}
            >
              Currents
            </button>
            <button
              onClick={() => setShowPrediction(!showPrediction)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${showPrediction ? "bg-blue-500/20 text-blue-400" : "bg-[var(--background)] text-[var(--foreground-muted)]"}`}
            >
              Prediction
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
