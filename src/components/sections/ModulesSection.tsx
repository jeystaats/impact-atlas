"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const modules = [
  {
    id: "heat",
    title: "Urban Heat & Trees",
    description: "Map heat islands, find cooling opportunities in hours",
    color: "--ld-heat",
    size: "ld-bento-lg",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    id: "air",
    title: "Air Pollution",
    description: "Track pollution corridors and health outcomes",
    color: "--ld-air",
    size: "ld-bento-wide",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
      </svg>
    ),
  },
  {
    id: "plastic",
    title: "Coastal Plastic",
    description: "Identify accumulation zones",
    color: "--ld-ocean",
    size: "ld-bento-sm",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
  },
  {
    id: "port",
    title: "Port Emissions",
    description: "Monitor maritime impact",
    color: "--ld-port",
    size: "ld-bento-sm",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
      </svg>
    ),
  },
  {
    id: "bio",
    title: "Biodiversity",
    description: "Map critical habitats and wildlife corridors",
    color: "--ld-bio",
    size: "ld-bento-md",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
      </svg>
    ),
  },
  {
    id: "restore",
    title: "Land Restoration",
    description: "Prioritize nature-based solutions by ROI",
    color: "--ld-restore",
    size: "ld-bento-full",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
  },
];

export default function ModulesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      id="modules"
      ref={sectionRef}
      className="ld-section relative"
      style={{ background: "var(--ld-navy-deep)" }}
    >
      {/* Background accents */}
      <div
        className="absolute top-1/4 left-0 w-96 h-96 rounded-full blur-[150px]"
        style={{ background: "var(--ld-teal)", opacity: 0.05 }}
      />
      <div
        className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full blur-[120px]"
        style={{ background: "var(--ld-bio)", opacity: 0.05 }}
      />

      <div className="ld-section-content relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
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
            One platform,{" "}
            <span className="ld-gradient-text">complete coverage.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="ld-body-lg max-w-2xl mx-auto"
          >
            Each module targets a specific environmental challenge with
            AI-powered insights and actionable recommendations.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="ld-bento-grid">
          {modules.map((module, i) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className={`${module.size} ld-card p-6 cursor-pointer group`}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: `color-mix(in srgb, var(${module.color}) 20%, transparent)`,
                  color: `var(${module.color})`,
                }}
              >
                {module.icon}
              </div>

              {/* Title */}
              <h3 className="ld-heading mb-2 group-hover:text-[var(--ld-teal-light)] transition-colors">
                {module.title}
              </h3>

              {/* Description */}
              <p className="ld-body-sm">{module.description}</p>

              {/* Hover arrow */}
              <div
                className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--ld-white-50)" }}
              >
                <span className="text-sm">Explore</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
