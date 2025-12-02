"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

export default function HowItWorksCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      className="ld-section relative overflow-hidden"
      style={{ background: "var(--ld-navy-deep)", minHeight: "auto", paddingTop: "6rem", paddingBottom: "6rem" }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at bottom center, rgba(45, 212, 191, 0.1) 0%, transparent 60%)",
        }}
      />

      <div className="ld-section-content relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: "var(--ld-teal-subtle)",
              border: "1px solid var(--ld-teal)",
            }}
          >
            <span className="text-sm font-medium" style={{ color: "var(--ld-teal)" }}>
              From months to minutes
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="ld-display-lg mb-6"
          >
            See it in{" "}
            <span className="ld-gradient-text">action</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="ld-body-lg mb-10"
          >
            Explore the live dashboard and discover quick wins for cities around the world.
            No signup required.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href="/dashboard" className="ld-btn-primary">
              Explore Dashboard
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/team" className="ld-btn-secondary">
              Meet the Team
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-16 grid grid-cols-3 gap-8"
          >
            {[
              { value: ">90%", label: "Analysis time saved" },
              { value: "6", label: "Environmental modules" },
              { value: "∞", label: "Quick wins to discover" },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  className="text-2xl md:text-3xl font-bold font-mono mb-1"
                  style={{ color: "var(--ld-teal)" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs md:text-sm"
                  style={{ color: "var(--ld-white-50)" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
