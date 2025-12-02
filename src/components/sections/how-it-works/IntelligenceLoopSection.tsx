"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    id: "scan",
    number: "01",
    title: "Scan",
    description: "Ingest satellite imagery, sensor data, and open datasets from global sources",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    color: "--ld-ocean",
  },
  {
    id: "analyze",
    number: "02",
    title: "Analyze",
    description: "AI processes data against Planetary Boundaries, SDGs, and local policies",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: "--ld-air",
  },
  {
    id: "prioritize",
    number: "03",
    title: "Prioritize",
    description: "Score opportunities by impact potential, feasibility, and cost-efficiency",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ),
    color: "--ld-heat",
  },
  {
    id: "act",
    number: "04",
    title: "Act",
    description: "Deliver actionable playbooks with specific locations and interventions",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: "--ld-bio",
  },
];

export default function IntelligenceLoopSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [activeStep, setActiveStep] = useState(0);

  // Auto-cycle through steps
  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      className="ld-section relative"
      style={{ background: "var(--ld-navy-dark)" }}
    >
      <div className="ld-section-content relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="ld-caption mb-4"
          >
            The Intelligence Loop
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="ld-display-lg mb-6"
          >
            Four steps to{" "}
            <span className="ld-gradient-text">quick wins</span>
          </motion.h2>
        </div>

        {/* Loop Visualization */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Circular diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative aspect-square max-w-md mx-auto"
          >
            {/* Outer ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{ border: "1px solid var(--ld-white-10)" }}
            />

            {/* Progress arc */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="48%"
                fill="none"
                stroke="var(--ld-white-5)"
                strokeWidth="2"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="48%"
                fill="none"
                stroke={`var(${steps[activeStep].color})`}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(activeStep + 1) * 25}% 100%`}
                initial={{ strokeDasharray: "0% 100%" }}
                animate={{ strokeDasharray: `${(activeStep + 1) * 25}% 100%` }}
                transition={{ duration: 0.5 }}
                style={{
                  filter: `drop-shadow(0 0 8px var(${steps[activeStep].color}))`,
                }}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="text-center p-8"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, var(${steps[activeStep].color}) 20%, transparent), transparent)`,
                    border: `1px solid var(${steps[activeStep].color})`,
                    color: `var(${steps[activeStep].color})`,
                  }}
                >
                  {steps[activeStep].icon}
                </div>
                <div
                  className="text-sm font-mono mb-2"
                  style={{ color: `var(${steps[activeStep].color})` }}
                >
                  {steps[activeStep].number}
                </div>
                <div
                  className="text-2xl font-semibold mb-2"
                  style={{ color: "var(--ld-white)" }}
                >
                  {steps[activeStep].title}
                </div>
                <div
                  className="text-sm max-w-[200px]"
                  style={{ color: "var(--ld-white-60)" }}
                >
                  {steps[activeStep].description}
                </div>
              </motion.div>
            </div>

            {/* Step indicators around the circle */}
            {steps.map((step, i) => {
              const angle = (i * 90 - 90) * (Math.PI / 180);
              const radius = 42;
              const x = 50 + Math.cos(angle) * radius;
              const y = 50 + Math.sin(angle) * radius;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(i)}
                  className="absolute w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: "translate(-50%, -50%)",
                    background: activeStep === i ? `var(${step.color})` : "var(--ld-navy-mid)",
                    border: `2px solid ${activeStep === i ? `var(${step.color})` : "var(--ld-white-20)"}`,
                    boxShadow: activeStep === i ? `0 0 20px var(${step.color})` : "none",
                  }}
                >
                  <span
                    className="text-xs font-bold"
                    style={{ color: activeStep === i ? "var(--ld-navy-deep)" : "var(--ld-white-60)" }}
                  >
                    {step.number}
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Right: Step list */}
          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.button
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                onClick={() => setActiveStep(i)}
                className={`
                  w-full text-left p-5 rounded-xl transition-all duration-300
                  ${activeStep === i ? "scale-[1.02]" : ""}
                `}
                style={{
                  background: activeStep === i ? "var(--ld-navy-mid)" : "transparent",
                  border: activeStep === i
                    ? `1px solid color-mix(in srgb, var(${step.color}) 50%, transparent)`
                    : "1px solid transparent",
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: activeStep === i
                        ? `linear-gradient(135deg, color-mix(in srgb, var(${step.color}) 30%, transparent), transparent)`
                        : "var(--ld-white-5)",
                      color: activeStep === i ? `var(${step.color})` : "var(--ld-white-40)",
                    }}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-mono"
                        style={{ color: activeStep === i ? `var(${step.color})` : "var(--ld-white-30)" }}
                      >
                        {step.number}
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: activeStep === i ? "var(--ld-white)" : "var(--ld-white-70)" }}
                      >
                        {step.title}
                      </span>
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: activeStep === i ? "var(--ld-white-60)" : "var(--ld-white-40)" }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
