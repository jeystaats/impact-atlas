"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

export default function AboutCTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      className="ld-section relative"
      style={{ background: "var(--ld-navy-dark)", minHeight: "auto", paddingTop: "6rem", paddingBottom: "6rem" }}
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
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="ld-display-lg mb-6"
          >
            Ready to explore{" "}
            <span className="ld-gradient-text">quick wins?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="ld-body-lg mb-10"
          >
            See how Impact Atlas reveals high-impact climate actions
            for cities around the world.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href="/dashboard" className="ld-btn-primary">
              View Live Demo
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/team" className="ld-btn-secondary">
              Meet the Team
            </Link>
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 flex flex-wrap justify-center gap-6"
          >
            {[
              { label: "See Impact Metrics", href: "/impact" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm transition-colors duration-200"
                style={{ color: "var(--ld-white-50)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ld-teal)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ld-white-50)")}
              >
                {link.label} →
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
