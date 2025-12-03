"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function AboutHeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      className="ld-section relative overflow-hidden pt-24"
      style={{ minHeight: "100vh" }}
    >
      {/* Animated globe background */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(var(--ld-silver-muted) 1px, transparent 1px),
              linear-gradient(90deg, var(--ld-silver-muted) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 70% 30%, rgba(45, 212, 191, 0.08) 0%, transparent 50%)",
          }}
        />

        {/* Animated connection lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Data stream lines */}
          <motion.path
            d="M10,80 Q30,60 50,50 T90,20"
            stroke="url(#lineGradient1)"
            strokeWidth="0.15"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 2, delay: 0.5 }}
          />
          <motion.path
            d="M5,50 Q25,40 45,45 T95,30"
            stroke="url(#lineGradient2)"
            strokeWidth="0.1"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 2, delay: 0.8 }}
          />
          <motion.path
            d="M0,30 Q40,50 60,40 T100,60"
            stroke="url(#lineGradient1)"
            strokeWidth="0.1"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 2, delay: 1.1 }}
          />
          <defs>
            <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--ld-teal)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--ld-teal)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--ld-teal)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--ld-silver)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--ld-silver)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--ld-silver)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating data nodes */}
        {[
          { x: 15, y: 25, delay: 0.3, size: 4 },
          { x: 80, y: 20, delay: 0.5, size: 6 },
          { x: 70, y: 65, delay: 0.7, size: 5 },
          { x: 25, y: 70, delay: 0.9, size: 4 },
          { x: 50, y: 40, delay: 1.1, size: 8 },
        ].map((node, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: node.size,
              height: node.size,
              background: "var(--ld-teal)",
              boxShadow: "0 0 20px var(--ld-teal-glow)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? {
              scale: [0, 1.2, 1],
              opacity: [0, 1, 0.6]
            } : {}}
            transition={{ duration: 0.6, delay: node.delay }}
          />
        ))}
      </div>

      <div className="ld-section-content relative z-10 flex flex-col justify-center min-h-[80vh]">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="ld-caption">About Impact Atlas</span>
            <a
              href="https://www.norrsken.org/fixathon"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-xs font-medium rounded-full hover:scale-105 transition-transform"
              style={{
                background: "var(--ld-teal-subtle)",
                color: "var(--ld-teal)",
              }}
            >
              Fixathon 2025
            </a>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="ld-display-xl mb-6"
          >
            Empowering the{" "}
            <span className="ld-gradient-text">green transition</span>
          </motion.h1>

          {/* Elevator Pitch */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="ld-body-lg max-w-2xl mb-8"
          >
            Impact Atlas helps cities identify their fastest, highest-impact climate
            and nature actions — <strong style={{ color: "var(--ld-teal)" }}>in minutes, not months.</strong>
          </motion.p>

          {/* Key Value Props */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap gap-4"
          >
            {[
              "Satellite & Open Data",
              "AI Decision Copilot",
              "Quick Win Hotspots",
            ].map((item, i) => (
              <div
                key={item}
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: "var(--ld-white-5)",
                  border: "1px solid var(--ld-white-10)",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--ld-teal)" }}
                />
                <span className="text-sm" style={{ color: "var(--ld-white-70)" }}>
                  {item}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest" style={{ color: "var(--ld-white-50)" }}>
            The Problem
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
      </div>
    </section>
  );
}
