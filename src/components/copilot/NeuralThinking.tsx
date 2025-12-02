"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface NeuralThinkingProps {
  stage?: number;
  moduleId?: string;
}

const stages = [
  { icon: "satellite", text: "Scanning satellite data..." },
  { icon: "database", text: "Analyzing climate patterns..." },
  { icon: "sparkles", text: "Generating insights..." },
];

const moduleColors: Record<string, string> = {
  "urban-heat": "#EF4444",
  "coastal-plastic": "#3B82F6",
  "ocean-plastic": "#8B5CF6",
  "port-emissions": "#F59E0B",
  "biodiversity": "#10B981",
  "restoration": "#84CC16",
};

export function NeuralThinking({ stage = 0, moduleId }: NeuralThinkingProps) {
  const [currentStage, setCurrentStage] = useState(stage);
  const accentColor = moduleId ? moduleColors[moduleId] : "var(--accent)";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % stages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-start gap-3 p-4">
      {/* Neural network visualization */}
      <div className="relative w-12 h-12">
        <svg viewBox="0 0 48 48" className="w-full h-full">
          {/* Connection lines */}
          {[0, 1, 2].map((i) => (
            <motion.line
              key={`line-${i}`}
              x1={12 + i * 8}
              y1={16}
              x2={20 + i * 4}
              y2={32}
              stroke={accentColor}
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0.3 }}
              animate={{
                pathLength: [0, 1, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Nodes - top row */}
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={`top-${i}`}
              cx={12 + i * 12}
              cy={12}
              r={4}
              fill={accentColor}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                delay: i * 0.15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Nodes - bottom row */}
          {[0, 1].map((i) => (
            <motion.circle
              key={`bottom-${i}`}
              cx={18 + i * 12}
              cy={36}
              r={4}
              fill={accentColor}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                delay: 0.5 + i * 0.15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Central pulse */}
          <motion.circle
            cx={24}
            cy={24}
            r={6}
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        </svg>
      </div>

      {/* Stage text */}
      <div className="flex-1">
        <motion.div
          key={currentStage}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-sm text-[var(--foreground-secondary)]"
        >
          {stages[currentStage].text}
        </motion.div>
        <div className="flex gap-1 mt-2">
          {stages.map((_, i) => (
            <motion.div
              key={i}
              className="h-1 rounded-full"
              style={{ backgroundColor: accentColor }}
              initial={{ width: 8, opacity: 0.3 }}
              animate={{
                width: i === currentStage ? 24 : 8,
                opacity: i === currentStage ? 1 : 0.3,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
