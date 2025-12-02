"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const modules = [
  {
    id: "heat",
    title: "Urban Heat",
    description: "Map heat islands and find optimal cooling interventions like tree planting locations",
    dataPoints: ["Surface temperature", "Tree canopy", "Building density", "Vulnerable populations"],
    outputs: ["Heat hotspot map", "Tree planting priorities", "Cooling corridor routes"],
    color: "--ld-heat",
    iconPath: "/icons/modules/sun.png",
  },
  {
    id: "air",
    title: "Air Pollution",
    description: "Track pollution corridors and their health impacts on different neighborhoods",
    dataPoints: ["PM2.5/PM10 levels", "Traffic patterns", "Industrial sources", "Health data"],
    outputs: ["Pollution corridor map", "Health risk zones", "Intervention priorities"],
    color: "--ld-air",
    iconPath: "/icons/modules/wind.png",
  },
  {
    id: "plastic",
    title: "Coastal Plastic",
    description: "Predict where plastic will accumulate and prioritize cleanup operations",
    dataPoints: ["Ocean currents", "River outflows", "Beach surveys", "Waste sources"],
    outputs: ["Accumulation predictions", "Cleanup priorities", "Source reduction targets"],
    color: "--ld-ocean",
    iconPath: "/icons/modules/ocean.png",
  },
  {
    id: "port",
    title: "Port Emissions",
    description: "Monitor maritime impact on air and water quality around port cities",
    dataPoints: ["Vessel tracking", "Emission inventories", "Air quality", "Water quality"],
    outputs: ["Emission hotspots", "Shore power opportunities", "Regulation impact"],
    color: "--ld-port",
    iconPath: "/icons/modules/boat.png",
  },
  {
    id: "bio",
    title: "Biodiversity",
    description: "Map critical habitats, wildlife corridors, and restoration opportunities",
    dataPoints: ["Species occurrence", "Habitat mapping", "Connectivity", "Threats"],
    outputs: ["Priority habitats", "Corridor design", "Restoration sites"],
    color: "--ld-bio",
    iconPath: "/icons/modules/leaf.png",
  },
  {
    id: "restore",
    title: "Land Restoration",
    description: "Prioritize nature-based solutions by environmental and economic ROI",
    dataPoints: ["Land use", "Soil quality", "Carbon potential", "Ecosystem services"],
    outputs: ["Restoration priorities", "Carbon projections", "ROI rankings"],
    color: "--ld-restore",
    iconPath: "/icons/modules/sprout.png",
  },
];

export default function ModulesOverviewSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [selectedModule, setSelectedModule] = useState(modules[0]);

  return (
    <section
      ref={sectionRef}
      className="ld-section relative overflow-hidden"
      style={{ background: "var(--ld-navy-deep)" }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(var(--ld-silver-muted) 1px, transparent 1px),
            linear-gradient(90deg, var(--ld-silver-muted) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="ld-section-content relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
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
            className="ld-display-lg mb-6"
          >
            Environmental{" "}
            <span className="ld-gradient-text">intelligence layers</span>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Module selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-2"
          >
            {modules.map((module, i) => (
              <motion.button
                key={module.id}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.05 }}
                onClick={() => setSelectedModule(module)}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300
                  ${selectedModule.id === module.id ? "scale-[1.02]" : ""}
                `}
                style={{
                  background: selectedModule.id === module.id ? "var(--ld-navy-mid)" : "transparent",
                  border: selectedModule.id === module.id
                    ? `1px solid color-mix(in srgb, var(${module.color}) 50%, transparent)`
                    : "1px solid transparent",
                }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: selectedModule.id === module.id
                      ? `linear-gradient(135deg, color-mix(in srgb, var(${module.color}) 20%, transparent), transparent)`
                      : "var(--ld-white-5)",
                  }}
                >
                  <Image
                    src={module.iconPath}
                    alt={module.title}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>

                {/* Title */}
                <span
                  className="font-semibold transition-colors duration-300"
                  style={{
                    color: selectedModule.id === module.id ? "var(--ld-white)" : "var(--ld-white-60)",
                  }}
                >
                  {module.title}
                </span>

                {/* Active indicator */}
                {selectedModule.id === module.id && (
                  <div
                    className="ml-auto w-2 h-2 rounded-full"
                    style={{
                      background: `var(${module.color})`,
                      boxShadow: `0 0 8px var(${module.color})`,
                    }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Right: Module details */}
          <motion.div
            key={selectedModule.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2"
          >
            <div
              className="p-8 rounded-2xl h-full"
              style={{
                background: "var(--ld-navy-dark)",
                border: `1px solid color-mix(in srgb, var(${selectedModule.color}) 30%, transparent)`,
              }}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, var(${selectedModule.color}) 20%, transparent), transparent)`,
                    border: `1px solid var(${selectedModule.color})`,
                  }}
                >
                  <Image
                    src={selectedModule.iconPath}
                    alt={selectedModule.title}
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3
                    className="text-2xl font-semibold mb-2"
                    style={{ color: "var(--ld-white)" }}
                  >
                    {selectedModule.title}
                  </h3>
                  <p style={{ color: "var(--ld-white-60)" }}>
                    {selectedModule.description}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Data points */}
                <div>
                  <h4
                    className="text-sm font-semibold uppercase tracking-wider mb-4"
                    style={{ color: `var(${selectedModule.color})` }}
                  >
                    Data Inputs
                  </h4>
                  <ul className="space-y-2">
                    {selectedModule.dataPoints.map((point, i) => (
                      <motion.li
                        key={point}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: `var(${selectedModule.color})` }}
                        />
                        <span style={{ color: "var(--ld-white-70)" }}>{point}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Outputs */}
                <div>
                  <h4
                    className="text-sm font-semibold uppercase tracking-wider mb-4"
                    style={{ color: "var(--ld-teal)" }}
                  >
                    Actionable Outputs
                  </h4>
                  <ul className="space-y-2">
                    {selectedModule.outputs.map((output, i) => (
                      <motion.li
                        key={output}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: "var(--ld-teal)" }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span style={{ color: "var(--ld-white-70)" }}>{output}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
