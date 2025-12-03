"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const modules = [
  {
    id: "heat",
    title: "Urban Heat & Trees",
    description: "Map heat islands, find cooling opportunities in hours",
    color: "--ld-heat",
    angle: 345,
    radius: 0.88,
    iconPath: "/icons/modules/sun.png",
  },
  {
    id: "air",
    title: "Air Pollution",
    description: "Track pollution corridors and health outcomes",
    color: "--ld-air",
    angle: 52,
    radius: 0.62,
    iconPath: "/icons/modules/wind.png",
  },
  {
    id: "plastic",
    title: "Coastal Plastic",
    description: "Identify accumulation zones and cleanup priorities",
    color: "--ld-ocean",
    angle: 95,
    radius: 0.78,
    iconPath: "/icons/modules/ocean.png",
  },
  {
    id: "port",
    title: "Port Emissions",
    description: "Monitor maritime impact on air and water quality",
    color: "--ld-port",
    angle: 168,
    radius: 0.52,
    iconPath: "/icons/modules/boat.png",
  },
  {
    id: "bio",
    title: "Biodiversity",
    description: "Map critical habitats and wildlife corridors",
    color: "--ld-bio",
    angle: 218,
    radius: 0.72,
    iconPath: "/icons/modules/leaf.png",
  },
  {
    id: "restore",
    title: "Land Restoration",
    description: "Prioritize nature-based solutions by ROI",
    color: "--ld-restore",
    angle: 285,
    radius: 0.58,
    iconPath: "/icons/modules/sprout.png",
  },
];

export default function ModulesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const prefersReducedMotion = useReducedMotion();
  const [scanAngle, setScanAngle] = useState(0);
  // Initialize with all modules if reduced motion is preferred
  const [scannedModules, setScannedModules] = useState<Set<string>>(() =>
    prefersReducedMotion ? new Set(modules.map(m => m.id)) : new Set()
  );
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  // Larger radar
  const radarRadius = 140;

  // Simplified transition for reduced motion
  const getTransition = (delay: number) =>
    prefersReducedMotion
      ? { duration: 0.01 }
      : { duration: 0.6, delay };

  // Animate radar sweep - skip for reduced motion
  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setScanAngle((prev) => {
        const newAngle = (prev + 2.5) % 360;

        modules.forEach((module) => {
          const diff = Math.abs(newAngle - module.angle);
          if (diff < 12 || diff > 348) {
            setScannedModules((s) => new Set([...s, module.id]));
          }
        });

        return newAngle;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isInView, prefersReducedMotion]);

  return (
    <section
      id="modules"
      ref={sectionRef}
      className="ld-section relative overflow-hidden"
      style={{ background: "var(--ld-navy-deep)" }}
    >
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(var(--ld-silver-muted) 1px, transparent 1px),
            linear-gradient(90deg, var(--ld-silver-muted) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="ld-section-content relative z-10">
        {/* Two column layout: Radar left, content right */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Left: Radar - Bigger */}
          <motion.div
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={getTransition(0.3)}
            className="relative mx-auto lg:mx-0 order-2 lg:order-1"
            style={{ width: radarRadius * 2 + 60, height: radarRadius * 2 + 60 }}
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
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px"
              style={{ background: "var(--ld-white-10)", height: radarRadius * 2 }}
            />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-px"
              style={{ background: "var(--ld-white-10)", width: radarRadius * 2 }}
            />

            {/* Radar sweep - hidden for reduced motion */}
            {!prefersReducedMotion && (
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{
                  width: radarRadius * 2,
                  height: radarRadius * 2,
                  background: `conic-gradient(from ${scanAngle}deg, transparent 0deg, rgba(45, 212, 191, 0.2) 3deg, rgba(45, 212, 191, 0.05) 25deg, transparent 50deg)`,
                }}
              />
            )}

            {/* Center dot */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
              style={{
                background: "var(--ld-teal)",
                boxShadow: "0 0 12px var(--ld-teal-glow)",
              }}
            />

            {/* Module blips - scattered */}
            {modules.map((module) => {
              const blipRadius = radarRadius * module.radius;
              const angleRad = (module.angle - 90) * (Math.PI / 180);
              const xPos = Math.cos(angleRad) * blipRadius;
              const yPos = Math.sin(angleRad) * blipRadius;
              const isScanned = scannedModules.has(module.id);
              const isHovered = hoveredModule === module.id;
              const containerCenter = radarRadius + 30;

              return (
                <motion.div
                  key={module.id}
                  className="absolute cursor-pointer z-10"
                  style={{
                    left: containerCenter + xPos,
                    top: containerCenter + yPos,
                    marginLeft: -6,
                    marginTop: -6,
                  }}
                  onMouseEnter={() => setHoveredModule(module.id)}
                  onMouseLeave={() => setHoveredModule(null)}
                  animate={{
                    scale: isHovered ? 1.8 : isScanned ? 1.2 : 0.7,
                  }}
                  transition={prefersReducedMotion ? { duration: 0.01 } : { type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div
                    className="w-3 h-3 rounded-full transition-all duration-300"
                    style={{
                      background: isScanned ? `var(${module.color})` : "var(--ld-silver-muted)",
                      boxShadow: isHovered
                        ? `0 0 20px var(${module.color}), 0 0 40px var(${module.color})`
                        : isScanned
                          ? `0 0 12px color-mix(in srgb, var(${module.color}) 70%, transparent)`
                          : "none",
                    }}
                  />
                </motion.div>
              );
            })}

            {/* Status */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
              <p className="text-xs font-mono" style={{ color: "var(--ld-teal)" }}>
                {scannedModules.size}/6 detected
              </p>
            </div>
          </motion.div>

          {/* Right: Header + description */}
          <div className="order-1 lg:order-2">
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={getTransition(0.2)}
              className="ld-caption mb-3"
            >
              Six Modules
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={getTransition(0.3)}
              className="ld-display-lg mb-4"
            >
              Scanning for{" "}
              <span className="ld-gradient-text">opportunities.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={getTransition(0.5)}
              className="ld-body-lg mb-6"
            >
              Our AI monitors six environmental domains, identifying high-impact interventions in real-time.
            </motion.p>
          </div>
        </div>

        {/* Module Cards Grid - Modern design with gradient borders */}
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={getTransition(0.6)}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-16"
        >
          {modules.map((module, i) => {
            const isScanned = scannedModules.has(module.id);
            const isHovered = hoveredModule === module.id;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={prefersReducedMotion ? { duration: 0.01 } : { duration: 0.4, delay: 0.7 + i * 0.08 }}
                onMouseEnter={() => setHoveredModule(module.id)}
                onMouseLeave={() => setHoveredModule(null)}
                className="group relative cursor-pointer"
              >
                {/* Gradient border wrapper */}
                <div
                  className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, var(${module.color}), transparent 50%, var(${module.color}))`,
                  }}
                />

                {/* Card content */}
                <div
                  className="relative p-5 rounded-2xl h-full transition-all duration-500 overflow-hidden"
                  style={{
                    background: "var(--ld-navy-dark)",
                    border: isScanned && !isHovered ? `1px solid color-mix(in srgb, var(${module.color}) 30%, transparent)` : "1px solid transparent",
                    transform: isHovered ? "translateY(-6px)" : "none",
                    boxShadow: isHovered
                      ? `0 20px 40px rgba(0,0,0,0.5), 0 0 30px color-mix(in srgb, var(${module.color}) 20%, transparent)`
                      : "0 4px 20px rgba(0,0,0,0.2)",
                  }}
                >
                  {/* Background icon - faded */}
                  <div
                    className="absolute -right-4 -bottom-4 w-32 h-32 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500 pointer-events-none"
                  >
                    <Image
                      src={module.iconPath}
                      alt=""
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Glow effect on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, color-mix(in srgb, var(${module.color}) 10%, transparent), transparent 60%)`,
                    }}
                  />

                  {/* Icon container */}
                  <div
                    className="relative w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
                    style={{
                      background: `linear-gradient(135deg, color-mix(in srgb, var(${module.color}) 15%, transparent), color-mix(in srgb, var(${module.color}) 5%, transparent))`,
                      boxShadow: isHovered ? `0 0 20px color-mix(in srgb, var(${module.color}) 30%, transparent)` : "none",
                    }}
                  >
                    <Image
                      src={module.iconPath}
                      alt={module.title}
                      width={36}
                      height={36}
                      className="object-contain relative z-10"
                    />
                  </div>

                  {/* Title */}
                  <h3
                    className="relative text-base font-semibold mb-2 transition-colors duration-300"
                    style={{ color: isHovered ? "var(--ld-white)" : "var(--ld-white-90)" }}
                  >
                    {module.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="relative text-sm leading-relaxed transition-colors duration-300"
                    style={{ color: isHovered ? "var(--ld-white-70)" : "var(--ld-white-40)" }}
                  >
                    {module.description}
                  </p>

                  {/* Active indicator dot */}
                  <div
                    className="absolute top-4 right-4 w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      background: isScanned ? `var(${module.color})` : "var(--ld-white-10)",
                      boxShadow: isScanned ? `0 0 8px var(${module.color})` : "none",
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
