"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const modules = [
  {
    id: "heat",
    title: "Urban Heat & Trees",
    description: "Map heat islands, find cooling opportunities in hours",
    color: "--ld-heat",
    angle: 0, // Position on the radar (degrees)
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    id: "air",
    title: "Air Pollution",
    description: "Track pollution corridors and health outcomes",
    color: "--ld-air",
    angle: 60,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
      </svg>
    ),
  },
  {
    id: "plastic",
    title: "Coastal Plastic",
    description: "Identify accumulation zones and cleanup priorities",
    color: "--ld-ocean",
    angle: 120,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
  },
  {
    id: "port",
    title: "Port Emissions",
    description: "Monitor maritime impact on air and water quality",
    color: "--ld-port",
    angle: 180,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
      </svg>
    ),
  },
  {
    id: "bio",
    title: "Biodiversity",
    description: "Map critical habitats and wildlife corridors",
    color: "--ld-bio",
    angle: 240,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
      </svg>
    ),
  },
  {
    id: "restore",
    title: "Land Restoration",
    description: "Prioritize nature-based solutions by ROI",
    color: "--ld-restore",
    angle: 300,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
  },
];

function RadarBlip({
  module,
  isScanned,
  isHovered,
  onHover,
  onLeave,
  onClick,
  radarRadius
}: {
  module: typeof modules[0];
  isScanned: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
  radarRadius: number;
}) {
  // Calculate position on the radar circle
  const angleRad = (module.angle - 90) * (Math.PI / 180);
  const x = Math.cos(angleRad) * radarRadius;
  const y = Math.sin(angleRad) * radarRadius;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: "50%",
        top: "50%",
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* Pulse rings when scanned */}
      <AnimatePresence>
        {isScanned && (
          <>
            <motion.div
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 rounded-full"
              style={{
                background: `var(${module.color})`,
                width: 60,
                height: 60,
                marginLeft: -30,
                marginTop: -30,
              }}
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0.6 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
              className="absolute inset-0 rounded-full"
              style={{
                background: `var(${module.color})`,
                width: 60,
                height: 60,
                marginLeft: -30,
                marginTop: -30,
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Blip dot */}
      <motion.div
        animate={{
          scale: isHovered ? 1.3 : isScanned ? [1, 1.2, 1] : 0.8,
          opacity: isScanned ? 1 : 0.3,
        }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-4 h-4 rounded-full"
        style={{
          background: `var(${module.color})`,
          boxShadow: isScanned ? `0 0 20px var(${module.color}), 0 0 40px var(${module.color})` : "none",
        }}
      />

      {/* Module card - appears on scan/hover */}
      <AnimatePresence>
        {(isScanned || isHovered) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute left-1/2 -translate-x-1/2 mt-4 w-48 p-4 rounded-xl z-20"
            style={{
              background: "var(--ld-navy-dark)",
              border: `1px solid color-mix(in srgb, var(${module.color}) 30%, transparent)`,
              boxShadow: `0 10px 40px rgba(0,0,0,0.4), 0 0 20px color-mix(in srgb, var(${module.color}) 20%, transparent)`,
            }}
          >
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
              style={{
                background: `color-mix(in srgb, var(${module.color}) 20%, transparent)`,
                color: `var(${module.color})`,
              }}
            >
              {module.icon}
            </div>

            {/* Title with typing effect */}
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm font-semibold mb-1"
              style={{ color: "var(--ld-white)" }}
            >
              {module.title}
            </motion.h3>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs"
              style={{ color: "var(--ld-white-50)" }}
            >
              {module.description}
            </motion.p>

            {/* Data stream effect */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-3 h-[2px] rounded-full"
              style={{ background: `var(${module.color})` }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ModulesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [scanAngle, setScanAngle] = useState(0);
  const [scannedModules, setScannedModules] = useState<Set<string>>(new Set());
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Radar dimensions
  const radarRadius = 180;

  // Animate radar sweep
  useEffect(() => {
    if (!isInView || isPaused) return;

    const interval = setInterval(() => {
      setScanAngle((prev) => {
        const newAngle = (prev + 2) % 360;

        // Check if any module is being scanned
        modules.forEach((module) => {
          const diff = Math.abs(newAngle - module.angle);
          if (diff < 10 || diff > 350) {
            setScannedModules((s) => new Set([...s, module.id]));
          }
        });

        return newAngle;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isInView, isPaused]);

  // Pause on hover
  const handleModuleHover = (id: string) => {
    setHoveredModule(id);
    setIsPaused(true);
  };

  const handleModuleLeave = () => {
    setHoveredModule(null);
    setIsPaused(false);
  };

  return (
    <section
      id="modules"
      ref={sectionRef}
      className="ld-section relative overflow-hidden"
      style={{ background: "var(--ld-navy-deep)" }}
    >
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(var(--ld-teal) 1px, transparent 1px),
            linear-gradient(90deg, var(--ld-teal) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px]"
        style={{ background: "var(--ld-teal)", opacity: 0.05 }}
      />

      <div className="ld-section-content relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="ld-caption mb-4"
          >
            Six Modules
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="ld-display-lg mb-4"
          >
            Scanning for{" "}
            <span className="ld-gradient-text">opportunities.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="ld-body-lg max-w-2xl mx-auto"
          >
            Our AI continuously monitors six environmental domains,
            identifying high-impact interventions in real-time.
          </motion.p>
        </div>

        {/* Radar Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative mx-auto"
          style={{ width: radarRadius * 2 + 200, height: radarRadius * 2 + 200 }}
        >
          {/* Radar circles */}
          {[0.33, 0.66, 1].map((scale, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: radarRadius * 2 * scale,
                height: radarRadius * 2 * scale,
                border: "1px solid var(--ld-white-10)",
              }}
            />
          ))}

          {/* Cross lines */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2"
            style={{ background: "var(--ld-white-10)" }}
          />
          <div
            className="absolute top-1/2 left-0 right-0 h-[1px] -translate-y-1/2"
            style={{ background: "var(--ld-white-10)" }}
          />

          {/* Radar sweep */}
          <motion.div
            className="absolute left-1/2 top-1/2 origin-center"
            style={{
              width: radarRadius + 100,
              height: 2,
              marginLeft: 0,
              marginTop: -1,
              background: `linear-gradient(90deg, var(--ld-teal), transparent)`,
              boxShadow: "0 0 20px var(--ld-teal)",
              rotate: scanAngle,
            }}
          />

          {/* Sweep trail (conic gradient) */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{
              width: radarRadius * 2 + 50,
              height: radarRadius * 2 + 50,
              background: `conic-gradient(from ${scanAngle - 30}deg, transparent, rgba(0, 206, 209, 0.15), transparent 30deg)`,
            }}
          />

          {/* Center dot */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
            style={{
              background: "var(--ld-teal)",
              boxShadow: "0 0 10px var(--ld-teal), 0 0 20px var(--ld-teal)",
            }}
          />

          {/* Module blips */}
          {modules.map((module) => (
            <RadarBlip
              key={module.id}
              module={module}
              isScanned={scannedModules.has(module.id)}
              isHovered={hoveredModule === module.id}
              onHover={() => handleModuleHover(module.id)}
              onLeave={handleModuleLeave}
              onClick={() => setSelectedModule(module.id)}
              radarRadius={radarRadius}
            />
          ))}

          {/* Status text */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center"
            style={{ color: "var(--ld-white-50)" }}
          >
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xs font-mono uppercase tracking-wider"
            >
              {scannedModules.size < 6 ? "Scanning..." : "All modules detected"}
            </motion.p>
            <p className="text-xs font-mono mt-1" style={{ color: "var(--ld-teal)" }}>
              {scannedModules.size}/6 modules active
            </p>
          </div>
        </motion.div>

        {/* Module legend - compact list below radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex flex-wrap justify-center gap-4 mt-8"
        >
          {modules.map((module) => (
            <motion.button
              key={module.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setHoveredModule(module.id);
                setIsPaused(true);
                setTimeout(() => {
                  setHoveredModule(null);
                  setIsPaused(false);
                }, 3000);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all"
              style={{
                background: scannedModules.has(module.id)
                  ? `color-mix(in srgb, var(${module.color}) 15%, transparent)`
                  : "var(--ld-white-5)",
                border: `1px solid ${scannedModules.has(module.id) ? `var(${module.color})` : "var(--ld-white-10)"}`,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: `var(${module.color})`,
                  boxShadow: scannedModules.has(module.id) ? `0 0 8px var(${module.color})` : "none",
                }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: scannedModules.has(module.id) ? "var(--ld-white)" : "var(--ld-white-50)" }}
              >
                {module.title}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
