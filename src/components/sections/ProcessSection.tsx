"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Connect Your Data",
    description: "Integrate existing city datasets — sensors, satellites, surveys — in hours, not months.",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "AI Analyzes",
    description: "Our models identify highest-ROI interventions across all six environmental domains.",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Act on Quick Wins",
    description: "Receive prioritized action playbooks with cost estimates, timelines, and projected impact.",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];

const partners = [
  "Google Earth Engine",
  "NVIDIA",
  "Copernicus",
  "NOAA",
  "Global Forest Watch",
  "GBIF",
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

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.15 }}
              className="relative"
            >
              {/* Connector line (not on last item) */}
              {i < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-10 left-full w-full h-[2px]"
                  style={{
                    background: "linear-gradient(to right, var(--ld-white-30), transparent)",
                  }}
                />
              )}

              <div className="ld-card p-8 h-full">
                {/* Step number */}
                <div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-6 text-sm font-semibold"
                  style={{
                    background: "var(--ld-teal)",
                    color: "var(--ld-navy-deep)",
                  }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div
                  className="mb-4"
                  style={{ color: "var(--ld-teal)" }}
                >
                  {step.icon}
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
          <p className="ld-body-sm mb-6">Powered by trusted data sources</p>
          <div className="flex flex-wrap justify-center gap-8">
            {partners.map((partner, i) => (
              <motion.span
                key={partner}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 0.5 } : {}}
                transition={{ duration: 0.4, delay: 0.9 + i * 0.05 }}
                whileHover={{ opacity: 1 }}
                className="text-sm font-medium cursor-default"
                style={{ color: "var(--ld-white-50)" }}
              >
                {partner}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
