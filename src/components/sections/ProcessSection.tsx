"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const steps = [
  {
    number: "01",
    title: "Connect Your Data",
    description: "Integrate existing city datasets — sensors, satellites, surveys — in hours, not months.",
    icon: "/icons/connect.png",
  },
  {
    number: "02",
    title: "AI Analyzes",
    description: "Our models identify highest-ROI interventions across all six environmental domains.",
    icon: "/icons/analyze.png",
  },
  {
    number: "03",
    title: "Act on Quick Wins",
    description: "Receive prioritized action playbooks with cost estimates, timelines, and projected impact.",
    icon: "/icons/quickwin.png",
  },
];

const partners = [
  { name: "Google Earth Engine", logo: "/logos/google-earth-engine.svg", width: 140 },
  { name: "NVIDIA", logo: "/logos/nvidia.svg", width: 100 },
  { name: "Copernicus", logo: "/logos/copernicus.svg", width: 130 },
  { name: "NOAA", logo: "/logos/noaa.svg", width: 90 },
  { name: "Global Forest Watch", logo: "/logos/global-forest-watch.svg", width: 130 },
  { name: "GBIF", logo: "/logos/gbif.svg", width: 80 },
];

export default function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      id="process"
      ref={sectionRef}
      className="ld-section relative"
      style={{ background: "var(--ld-navy-dark)" }}
    >
      {/* Subtle gradient accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[150px] opacity-[0.03]"
        style={{ background: "var(--ld-teal)" }}
      />

      <div className="ld-section-content relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="ld-caption mb-4"
          >
            How It Works
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="ld-display-lg"
          >
            From data to decision{" "}
            <span className="ld-gradient-text">in days.</span>
          </motion.h2>
        </div>

        {/* Steps - Visual cards with 3D icons */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.15 }}
              className="relative group"
            >
              {/* Connector line (not on last item) */}
              {i < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-16 left-full w-full h-px z-0"
                  style={{
                    background: "linear-gradient(to right, var(--ld-white-10), transparent)",
                  }}
                />
              )}

              <div className="ld-card p-8 h-full text-center relative overflow-hidden">
                {/* Background number - large and subtle */}
                <div
                  className="absolute top-4 right-4 text-6xl font-bold opacity-[0.03] select-none"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {step.number}
                </div>

                {/* 3D Icon */}
                <motion.div
                  className="relative w-20 h-20 mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Image
                    src={step.icon}
                    alt={step.title}
                    fill
                    className="object-contain drop-shadow-lg"
                  />
                </motion.div>

                {/* Step indicator */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-xs font-medium"
                  style={{
                    background: "var(--ld-teal-subtle)",
                    color: "var(--ld-teal)",
                  }}
                >
                  Step {step.number}
                </div>

                {/* Title */}
                <h3 className="ld-heading mb-3">{step.title}</h3>

                {/* Description */}
                <p className="ld-body-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Partner logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <p className="ld-body-sm mb-8">Powered by trusted data sources</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {partners.map((partner, i) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.9 + i * 0.05 }}
                whileHover={{ scale: 1.08 }}
                className="cursor-default transition-all duration-300 [filter:brightness(0)_invert(1)_opacity(0.5)] hover:[filter:none]"
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={partner.width}
                  height={40}
                  className="h-8 md:h-10 w-auto object-contain"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
