"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const dataSources = [
  {
    id: "copernicus",
    name: "Copernicus",
    category: "Satellite",
    description: "EU Earth observation programme - climate, atmosphere, marine data",
    color: "--ld-ocean",
  },
  {
    id: "nasa",
    name: "NASA",
    category: "Satellite",
    description: "Earth science data - temperature, vegetation, emissions",
    color: "--ld-heat",
  },
  {
    id: "gbif",
    name: "GBIF",
    category: "Biodiversity",
    description: "Global Biodiversity Information Facility - species occurrence data",
    color: "--ld-bio",
  },
  {
    id: "google",
    name: "Google",
    category: "AI/Maps",
    description: "Environmental Insights Explorer, Earth Engine, mapping data",
    color: "--ld-air",
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    category: "AI",
    description: "Earth-2 climate simulation and AI infrastructure",
    color: "--ld-restore",
  },
  {
    id: "un",
    name: "UN",
    category: "Policy",
    description: "SDG indicators, climate agreements, global frameworks",
    color: "--ld-teal",
  },
  {
    id: "smhi",
    name: "SMHI",
    category: "Weather",
    description: "Swedish Meteorological and Hydrological Institute",
    color: "--ld-ocean",
  },
  {
    id: "scb",
    name: "SCB",
    category: "Statistics",
    description: "Statistics Sweden - socio-economic data",
    color: "--ld-air",
  },
  {
    id: "gfw",
    name: "Global Fishing Watch",
    category: "Marine",
    description: "Vessel tracking and fishing activity monitoring",
    color: "--ld-ocean",
  },
];

export default function DataSourcesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [hoveredSource, setHoveredSource] = useState<string | null>(null);

  return (
    <section
      ref={sectionRef}
      className="ld-section relative overflow-hidden"
      style={{ background: "var(--ld-navy-deep)" }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(var(--ld-silver-muted) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="ld-section-content relative z-10">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-12">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="ld-caption mb-4"
            >
              Data Sources
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="ld-display-lg mb-6"
            >
              Powered by{" "}
              <span className="ld-gradient-text">global data</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="ld-body-lg"
            >
              We integrate trusted data from leading space agencies, research institutions,
              and international organizations — all speaking one unified language.
            </motion.p>
          </div>

          {/* Data flow visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div
              className="p-6 rounded-2xl"
              style={{
                background: "var(--ld-navy-dark)",
                border: "1px solid var(--ld-white-10)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ background: "var(--ld-teal)" }}
                />
                <span className="text-sm font-mono" style={{ color: "var(--ld-teal)" }}>
                  Live Data Pipeline
                </span>
              </div>

              {/* Animated data streams */}
              <div className="space-y-2">
                {["Satellite imagery", "Sensor readings", "Policy frameworks", "Research data"].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${70 + i * 8}%` } : {}}
                    transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                    className="h-2 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, var(--ld-teal), transparent)`,
                      opacity: 0.6 - i * 0.1,
                    }}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--ld-white-40)" }}>
                  Sources connected
                </span>
                <span className="text-sm font-mono font-bold" style={{ color: "var(--ld-teal)" }}>
                  {dataSources.length}+
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Data source grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          {dataSources.map((source, i) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.7 + i * 0.05 }}
              onMouseEnter={() => setHoveredSource(source.id)}
              onMouseLeave={() => setHoveredSource(null)}
              className="group relative"
            >
              <div
                className="p-4 rounded-xl h-full transition-all duration-300"
                style={{
                  background: hoveredSource === source.id ? "var(--ld-navy-mid)" : "var(--ld-navy-dark)",
                  border: hoveredSource === source.id
                    ? `1px solid color-mix(in srgb, var(${source.color}) 50%, transparent)`
                    : "1px solid var(--ld-white-10)",
                  transform: hoveredSource === source.id ? "translateY(-4px)" : "none",
                }}
              >
                {/* Category badge */}
                <div
                  className="inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider mb-3"
                  style={{
                    background: `color-mix(in srgb, var(${source.color}) 15%, transparent)`,
                    color: `var(${source.color})`,
                  }}
                >
                  {source.category}
                </div>

                {/* Name */}
                <h3
                  className="font-semibold mb-2 transition-colors duration-300"
                  style={{ color: hoveredSource === source.id ? "var(--ld-white)" : "var(--ld-white-80)" }}
                >
                  {source.name}
                </h3>

                {/* Description */}
                <p
                  className="text-xs leading-relaxed transition-colors duration-300"
                  style={{ color: hoveredSource === source.id ? "var(--ld-white-60)" : "var(--ld-white-40)" }}
                >
                  {source.description}
                </p>

                {/* Connection indicator */}
                <div
                  className="absolute top-3 right-3 w-2 h-2 rounded-full"
                  style={{
                    background: `var(${source.color})`,
                    boxShadow: hoveredSource === source.id ? `0 0 8px var(${source.color})` : "none",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-8 text-center text-sm"
          style={{ color: "var(--ld-white-40)" }}
        >
          + many more regional and local data providers
        </motion.p>
      </div>
    </section>
  );
}
