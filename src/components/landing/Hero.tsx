"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon, ModuleIcon } from "@/components/ui/icons";
import { modules } from "@/data/modules";
import Link from "next/link";

type Severity = "low" | "medium" | "high";

const hotspots: Array<{ id: number; x: number; y: number; module: string; label: string; severity: Severity }> = [
  { id: 1, x: 25, y: 35, module: "urban-heat", label: "Heat Island", severity: "high" },
  { id: 2, x: 65, y: 45, module: "coastal-plastic", label: "Plastic Zone", severity: "medium" },
  { id: 3, x: 45, y: 60, module: "port-emissions", label: "Port Spike", severity: "high" },
  { id: 4, x: 80, y: 30, module: "biodiversity", label: "Green Gap", severity: "low" },
  { id: 5, x: 35, y: 75, module: "restoration", label: "Restore Site", severity: "medium" },
];

const severityColors: Record<Severity, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-red-500",
};

export function Hero() {
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [isMapView, setIsMapView] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!activeHotspot) {
        const randomIndex = Math.floor(Math.random() * hotspots.length);
        setActiveHotspot(hotspots[randomIndex].id);
        setTimeout(() => setActiveHotspot(null), 2000);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [activeHotspot]);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-bg)] via-[var(--background)] to-[var(--background)]" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-muted)] text-sm text-[var(--accent-dark)] mb-6"
            >
              <Icon name="sparkles" className="w-4 h-4" />
              <span>AI-Powered Climate Intelligence</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--foreground)] leading-[1.1] mb-6">
              Find <span className="gradient-text">quick climate wins</span> for your city
            </h1>

            <p className="text-lg sm:text-xl text-[var(--foreground-secondary)] leading-relaxed mb-8">
              Impact Atlas combines AI with open data to surface actionable opportunities—where to plant trees, predict plastic accumulation, track emissions, and restore ecosystems.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Explore Your City
                  <Icon name="arrowUpRight" className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 pt-8 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--foreground-muted)] mb-4">Trusted by leading cities</p>
              <div className="flex flex-wrap gap-6 items-center opacity-60">
                {["Amsterdam", "Copenhagen", "Singapore", "Barcelona"].map((city) => (
                  <span key={city} className="text-sm font-medium text-[var(--foreground-secondary)]">
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Interactive map visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
            onMouseEnter={() => setIsMapView(false)}
            onMouseLeave={() => setIsMapView(true)}
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Glass container */}
              <div className="absolute inset-0 rounded-3xl glass-strong shadow-xl overflow-hidden">
                {/* Stylized map background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-bg)] to-white">
                  {/* Map grid lines */}
                  <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
                    {/* Horizontal lines */}
                    {[20, 40, 60, 80].map((y) => (
                      <line key={`h-${y}`} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeWidth="0.2" className="text-[var(--accent)]" />
                    ))}
                    {/* Vertical lines */}
                    {[20, 40, 60, 80].map((x) => (
                      <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="100" stroke="currentColor" strokeWidth="0.2" className="text-[var(--accent)]" />
                    ))}
                    {/* Curved coastline */}
                    <path
                      d="M0,50 Q30,40 50,55 T100,45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      className="text-[var(--accent)]"
                      opacity="0.4"
                    />
                  </svg>

                  {/* Animated hotspots */}
                  <AnimatePresence>
                    {hotspots.map((hotspot) => {
                      const module = modules.find(m => m.id === hotspot.module);
                      const isActive = activeHotspot === hotspot.id;

                      return (
                        <motion.div
                          key={hotspot.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                          }}
                          transition={{
                            delay: hotspot.id * 0.1,
                            duration: 0.4,
                            ease: [0.22, 1, 0.36, 1]
                          }}
                          className="absolute"
                          style={{
                            left: `${hotspot.x}%`,
                            top: `${hotspot.y}%`,
                            transform: "translate(-50%, -50%)"
                          }}
                          onMouseEnter={() => setActiveHotspot(hotspot.id)}
                          onMouseLeave={() => setActiveHotspot(null)}
                        >
                          {/* Pulse ring */}
                          <motion.div
                            animate={isActive ? { scale: [1, 2, 1], opacity: [0.5, 0, 0.5] } : {}}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className={`absolute inset-0 w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full ${severityColors[hotspot.severity]} opacity-30`}
                            style={{ left: "50%", top: "50%" }}
                          />

                          {/* Hotspot dot */}
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            className={`relative w-8 h-8 rounded-full ${severityColors[hotspot.severity]} flex items-center justify-center shadow-lg cursor-pointer`}
                          >
                            <ModuleIcon moduleId={hotspot.module} className="w-4 h-4 text-white" />
                          </motion.div>

                          {/* Tooltip card */}
                          <AnimatePresence>
                            {isActive && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute left-12 top-1/2 -translate-y-1/2 w-48 p-3 rounded-xl bg-white shadow-xl border border-[var(--border)] z-10"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <div
                                    className="w-6 h-6 rounded-md flex items-center justify-center"
                                    style={{ backgroundColor: module?.color + "20" }}
                                  >
                                    <ModuleIcon moduleId={hotspot.module} className="w-3.5 h-3.5" style={{ color: module?.color }} />
                                  </div>
                                  <span className="text-xs font-medium text-[var(--foreground)]">{hotspot.label}</span>
                                </div>
                                <p className="text-xs text-[var(--foreground-secondary)]">
                                  AI detected opportunity for intervention
                                </p>
                                <div className="mt-2 flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${severityColors[hotspot.severity]}`} />
                                  <span className="text-xs text-[var(--foreground-muted)] capitalize">{hotspot.severity} priority</span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Floating stats cards */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -left-4 top-1/4 p-3 rounded-xl glass shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <Icon name="thermometer" className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--foreground-muted)]">Heat Islands</p>
                    <p className="text-sm font-semibold text-[var(--foreground)] tabular-nums">23 detected</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -right-4 top-1/2 p-3 rounded-xl glass shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Icon name="sprout" className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--foreground-muted)]">Quick Wins</p>
                    <p className="text-sm font-semibold text-[var(--foreground)] tabular-nums">57 found</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="absolute left-1/4 -bottom-2 p-3 rounded-xl glass shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Icon name="waves" className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--foreground-muted)]">Plastic Zones</p>
                    <p className="text-sm font-semibold text-[var(--foreground)] tabular-nums">8 predicted</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
