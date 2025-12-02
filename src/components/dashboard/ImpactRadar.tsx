"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { modules } from "@/data/modules";

interface ModuleHealth {
  id: string;
  title: string;
  color: string;
  health: number; // 0-100
  activity: number; // 0-100
  alerts: number;
}

// Static health data for each module (deterministic to avoid hydration mismatches)
const moduleHealthData: Record<string, { health: number; activity: number; alerts: number }> = {
  "urban-heat": { health: 78, activity: 65, alerts: 2 },
  "coastal-plastic": { health: 85, activity: 72, alerts: 1 },
  "ocean-plastic": { health: 92, activity: 88, alerts: 0 },
  "port-emissions": { health: 71, activity: 55, alerts: 3 },
  "biodiversity": { health: 89, activity: 78, alerts: 1 },
  "restoration": { health: 95, activity: 92, alerts: 0 },
};

// Generate health data for each module using static values
function generateModuleHealth(): ModuleHealth[] {
  return modules.map((module) => {
    const data = moduleHealthData[module.id] || { health: 80, activity: 60, alerts: 0 };
    return {
      id: module.id,
      title: module.title.split(" ")[0] + " " + (module.title.split(" ")[1] || ""), // Short name
      color: module.color,
      health: data.health,
      activity: data.activity,
      alerts: data.alerts,
    };
  });
}

interface ImpactRadarProps {
  size?: number;
  className?: string;
}

export function ImpactRadar({ size = 280, className = "" }: ImpactRadarProps) {
  const moduleHealth = useMemo(() => generateModuleHealth(), []);
  const center = size / 2;
  const maxRadius = (size / 2) - 40;
  const innerRadius = 35;

  // Create radar segments
  const segments = moduleHealth.map((module, index) => {
    const angleStep = (2 * Math.PI) / moduleHealth.length;
    const startAngle = index * angleStep - Math.PI / 2; // Start from top
    const endAngle = startAngle + angleStep;
    const midAngle = (startAngle + endAngle) / 2;

    // Radius based on health (higher health = larger radius)
    const radius = innerRadius + (maxRadius - innerRadius) * (module.health / 100);

    // Create arc path
    const x1 = center + Math.cos(startAngle) * innerRadius;
    const y1 = center + Math.sin(startAngle) * innerRadius;
    const x2 = center + Math.cos(startAngle) * radius;
    const y2 = center + Math.sin(startAngle) * radius;
    const x3 = center + Math.cos(endAngle) * radius;
    const y3 = center + Math.sin(endAngle) * radius;
    const x4 = center + Math.cos(endAngle) * innerRadius;
    const y4 = center + Math.sin(endAngle) * innerRadius;

    // Label position
    const labelRadius = maxRadius + 20;
    const labelX = center + Math.cos(midAngle) * labelRadius;
    const labelY = center + Math.sin(midAngle) * labelRadius;

    // Dot position (for activity indicator)
    const dotRadius = innerRadius + (maxRadius - innerRadius) * (module.activity / 100);
    const dotX = center + Math.cos(midAngle) * dotRadius;
    const dotY = center + Math.sin(midAngle) * dotRadius;

    return {
      ...module,
      path: `M ${x1} ${y1} L ${x2} ${y2} A ${radius} ${radius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}`,
      labelX,
      labelY,
      dotX,
      dotY,
      midAngle,
    };
  });

  // Create concentric rings for reference
  const rings = [0.25, 0.5, 0.75, 1].map((factor) => ({
    radius: innerRadius + (maxRadius - innerRadius) * factor,
    label: `${Math.round(factor * 100)}%`,
  }));

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradients for each module */}
          {segments.map((segment) => (
            <radialGradient
              key={`gradient-${segment.id}`}
              id={`radar-gradient-${segment.id}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor={segment.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={segment.color} stopOpacity="0.3" />
            </radialGradient>
          ))}
        </defs>

        {/* Background rings */}
        {rings.map((ring, index) => (
          <motion.circle
            key={index}
            cx={center}
            cy={center}
            r={ring.radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="4 4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.5, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          />
        ))}

        {/* Radial lines */}
        {segments.map((segment, index) => {
          const angleStep = (2 * Math.PI) / segments.length;
          const angle = index * angleStep - Math.PI / 2;
          const x2 = center + Math.cos(angle) * maxRadius;
          const y2 = center + Math.sin(angle) * maxRadius;
          return (
            <motion.line
              key={`line-${index}`}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="var(--border)"
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            />
          );
        })}

        {/* Module segments */}
        {segments.map((segment, index) => (
          <motion.g key={segment.id}>
            <motion.path
              d={segment.path}
              fill={`url(#radar-gradient-${segment.id})`}
              stroke={segment.color}
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.3 + index * 0.1,
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              whileHover={{
                filter: "url(#glow)",
                scale: 1.02,
              }}
              style={{ transformOrigin: `${center}px ${center}px`, cursor: "pointer" }}
            />

            {/* Activity dot with pulse */}
            <motion.circle
              cx={segment.dotX}
              cy={segment.dotY}
              r={4}
              fill={segment.color}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            />
            <motion.circle
              cx={segment.dotX}
              cy={segment.dotY}
              r={4}
              fill={segment.color}
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 2.5 }}
              transition={{
                delay: 0.8 + index * 0.1,
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />

            {/* Alert indicator */}
            {segment.alerts > 0 && (
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <circle
                  cx={segment.dotX + 8}
                  cy={segment.dotY - 8}
                  r={8}
                  fill="#EF4444"
                />
                <text
                  x={segment.dotX + 8}
                  y={segment.dotY - 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  fontWeight="bold"
                >
                  {segment.alerts}
                </text>
              </motion.g>
            )}
          </motion.g>
        ))}

        {/* Center circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="var(--background-tertiary)"
          stroke="var(--border)"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        />

        {/* Center text */}
        <motion.text
          x={center}
          y={center - 5}
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="var(--foreground)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(
            moduleHealth.reduce((acc, m) => acc + m.health, 0) / moduleHealth.length
          )}%
        </motion.text>
        <motion.text
          x={center}
          y={center + 12}
          textAnchor="middle"
          fontSize="10"
          fill="var(--foreground-muted)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Overall Health
        </motion.text>
      </svg>

      {/* Module labels */}
      <div className="absolute inset-0 pointer-events-none">
        {segments.map((segment, index) => {
          // Determine text alignment based on angle
          const isRight = segment.midAngle > -Math.PI / 2 && segment.midAngle < Math.PI / 2;
          const isTop = segment.midAngle < 0;

          return (
            <motion.div
              key={`label-${segment.id}`}
              className="absolute text-xs font-medium"
              style={{
                left: segment.labelX,
                top: segment.labelY,
                transform: `translate(${isRight ? "0%" : "-100%"}, -50%)`,
                color: segment.color,
              }}
              initial={{ opacity: 0, x: isRight ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.05 }}
            >
              {segment.title}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
