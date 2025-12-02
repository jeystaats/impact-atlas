"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icons";

interface Hotspot {
  id: string;
  x: number;
  y: number;
  severity: "low" | "medium" | "high" | "critical";
  label: string;
  value?: string;
}

interface MapVisualizationProps {
  moduleId: string;
  hotspots: Hotspot[];
  onHotspotClick?: (hotspot: Hotspot) => void;
  selectedHotspot?: string | null;
}

const severityColors = {
  low: { bg: "bg-emerald-500", ring: "ring-emerald-500/30" },
  medium: { bg: "bg-amber-500", ring: "ring-amber-500/30" },
  high: { bg: "bg-orange-500", ring: "ring-orange-500/30" },
  critical: { bg: "bg-red-500", ring: "ring-red-500/30" },
};

export function MapVisualization({
  moduleId,
  hotspots,
  onHotspotClick,
  selectedHotspot,
}: MapVisualizationProps) {
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

  return (
    <div className="relative h-full min-h-[400px] rounded-xl bg-gradient-to-br from-[var(--accent-bg)] to-[var(--background-secondary)] overflow-hidden">
      {/* Map background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(var(--accent) 1px, transparent 1px),
            linear-gradient(90deg, var(--accent) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Stylized map elements */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Roads/streets */}
        <path
          d="M0,30 L100,30"
          stroke="var(--accent)"
          strokeWidth="0.3"
          opacity="0.3"
        />
        <path
          d="M0,60 L100,60"
          stroke="var(--accent)"
          strokeWidth="0.3"
          opacity="0.3"
        />
        <path
          d="M30,0 L30,100"
          stroke="var(--accent)"
          strokeWidth="0.3"
          opacity="0.3"
        />
        <path
          d="M70,0 L70,100"
          stroke="var(--accent)"
          strokeWidth="0.3"
          opacity="0.3"
        />
        {/* River/coast */}
        <path
          d="M0,80 Q25,75 50,82 T100,78"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="0.5"
          opacity="0.4"
        />
        {/* Parks/green areas */}
        <circle cx="20" cy="45" r="8" fill="var(--accent)" opacity="0.1" />
        <circle cx="80" cy="20" r="6" fill="var(--accent)" opacity="0.1" />
      </svg>

      {/* Hotspots */}
      {hotspots.map((hotspot) => {
        const colors = severityColors[hotspot.severity];
        const isSelected = selectedHotspot === hotspot.id;
        const isHovered = hoveredHotspot === hotspot.id;

        return (
          <motion.div
            key={hotspot.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: Math.random() * 0.3, duration: 0.3 }}
            className="absolute cursor-pointer"
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onMouseEnter={() => setHoveredHotspot(hotspot.id)}
            onMouseLeave={() => setHoveredHotspot(null)}
            onClick={() => onHotspotClick?.(hotspot)}
          >
            {/* Pulse ring for critical/high */}
            {(hotspot.severity === "critical" || hotspot.severity === "high") && (
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute inset-0 w-6 h-6 rounded-full ${colors.bg} opacity-30`}
                style={{ margin: "-3px" }}
              />
            )}

            {/* Main dot */}
            <motion.div
              animate={isSelected || isHovered ? { scale: 1.3 } : { scale: 1 }}
              className={`relative w-6 h-6 rounded-full ${colors.bg} ring-4 ${colors.ring} shadow-lg flex items-center justify-center`}
            >
              {isSelected && (
                <Icon name="target" className="w-3 h-3 text-white" />
              )}
            </motion.div>

            {/* Tooltip */}
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg bg-[var(--foreground)] text-white text-xs whitespace-nowrap z-10"
              >
                <p className="font-medium">{hotspot.label}</p>
                {hotspot.value && (
                  <p className="text-white/70">{hotspot.value}</p>
                )}
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 p-3 rounded-lg glass">
        <p className="text-xs font-medium text-[var(--foreground)] mb-2">Severity</p>
        <div className="flex gap-3">
          {Object.entries(severityColors).map(([level, colors]) => (
            <div key={level} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${colors.bg}`} />
              <span className="text-xs text-[var(--foreground-secondary)] capitalize">{level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        <button className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-white/50 transition-colors">
          <span className="text-[var(--foreground)] font-medium">+</span>
        </button>
        <button className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-white/50 transition-colors">
          <span className="text-[var(--foreground)] font-medium">−</span>
        </button>
      </div>
    </div>
  );
}
