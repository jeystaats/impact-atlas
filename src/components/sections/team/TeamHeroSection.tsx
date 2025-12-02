"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function TeamHeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      className="ld-section relative overflow-hidden pt-24"
      style={{ minHeight: "100vh" }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
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
          className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-10"
          style={{ background: "var(--ld-teal)" }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] rounded-full blur-3xl opacity-5"
          style={{ background: "var(--ld-bio)" }}
        />
      </div>

      <div className="ld-section-content relative z-10 flex flex-col justify-center min-h-[50vh]">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <span className="ld-caption">The Team</span>
            <span
              className="px-3 py-1 text-xs font-medium rounded-full"
              style={{
                background: "var(--ld-teal-subtle)",
                color: "var(--ld-teal)",
              }}
            >
              Fixathon 2025
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="ld-display-xl mb-6"
          >
            The minds behind{" "}
            <span className="ld-gradient-text">Impact Atlas</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="ld-body-lg max-w-2xl mx-auto"
          >
            A multidisciplinary team combining climate science, technology, and design
            to help cities take action on what matters most.
          </motion.p>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest" style={{ color: "var(--ld-white-50)" }}>
          Meet the team
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
