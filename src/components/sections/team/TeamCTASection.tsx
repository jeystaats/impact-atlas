"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

export default function TeamCTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      className="ld-section relative overflow-hidden"
      style={{ background: "var(--ld-navy-deep)", minHeight: "auto", paddingTop: "4rem", paddingBottom: "6rem" }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at bottom center, rgba(45, 212, 191, 0.08) 0%, transparent 60%)",
        }}
      />

      <div className="ld-section-content relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="ld-display-md mb-6"
          >
            Ready to see what we've{" "}
            <span className="ld-gradient-text">built?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="ld-body-lg mb-10"
          >
            Explore the Impact Atlas dashboard and discover quick wins for cities worldwide.
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
            <Link href="/how-it-works" className="ld-btn-secondary">
              How It Works
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
              { label: "About the Project", href: "/about" },
              { label: "See Impact Metrics", href: "/impact" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm transition-colors duration-200 hover:text-[var(--ld-teal)]"
                style={{ color: "var(--ld-white-50)" }}
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
