"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function HowItWorksHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      className="ld-section relative overflow-hidden"
      style={{ minHeight: "70vh" }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(var(--ld-silver-muted) 1px, transparent 1px),
              linear-gradient(90deg, var(--ld-silver-muted) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Gradient orbs */}
        <div
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
          style={{ background: "var(--ld-teal)" }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-5"
          style={{ background: "var(--ld-ocean)" }}
        />
      </div>

      <div className="ld-section-content relative z-10 flex flex-col justify-center min-h-[60vh]">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="ld-caption mb-6"
          >
            How It Works
          </motion.p>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="ld-display-xl mb-6"
          >
            From global data to{" "}
            <span className="ld-gradient-text">local action</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="ld-body-lg max-w-2xl mb-10"
          >
            Impact Atlas combines satellite imagery, open environmental datasets,
            and an AI decision copilot to reveal your city's highest-impact
            climate opportunities.
          </motion.p>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap gap-8"
          >
            {[
              { value: "6", label: "Environmental Modules" },
              { value: "10+", label: "Data Sources" },
              { value: "90%", label: "Faster Analysis" },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: "var(--ld-teal)" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-sm"
                  style={{ color: "var(--ld-white-50)" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest" style={{ color: "var(--ld-white-50)" }}>
          The Process
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-5 h-5" style={{ color: "var(--ld-white-50)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
