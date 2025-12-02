"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function VisionMissionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      className="ld-section relative"
      style={{ background: "var(--ld-navy-dark)" }}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, var(--ld-navy-deep) 0%, var(--ld-navy-dark) 50%, var(--ld-navy-deep) 100%)",
        }}
      />

      <div className="ld-section-content relative z-10">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Card */}
            <div
              className="relative p-8 lg:p-10 rounded-2xl h-full"
              style={{
                background: "linear-gradient(135deg, var(--ld-navy-mid), var(--ld-navy-deep))",
                border: "1px solid var(--ld-white-10)",
              }}
            >
              {/* Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background: "linear-gradient(135deg, var(--ld-teal-subtle), transparent)",
                  border: "1px solid var(--ld-teal)",
                }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: "var(--ld-teal)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>

              {/* Label */}
              <p
                className="text-sm font-semibold tracking-wider uppercase mb-4"
                style={{ color: "var(--ld-teal)" }}
              >
                Our Vision
              </p>

              {/* Content */}
              <h3
                className="text-2xl lg:text-3xl font-semibold leading-tight mb-4"
                style={{ color: "var(--ld-white)" }}
              >
                Unleashing the power of data and AI for sustainable impact
              </h3>

              <p className="ld-body" style={{ color: "var(--ld-white-70)" }}>
                By connecting the dots between science, policy, and action, we enable
                cities, organisations, and states to simplify sustainable impact.
              </p>

              {/* Decorative element */}
              <div
                className="absolute top-0 right-0 w-32 h-32 opacity-5"
                style={{
                  background: "radial-gradient(circle, var(--ld-teal), transparent 70%)",
                }}
              />
            </div>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative"
          >
            {/* Card */}
            <div
              className="relative p-8 lg:p-10 rounded-2xl h-full"
              style={{
                background: "linear-gradient(135deg, var(--ld-navy-mid), var(--ld-navy-deep))",
                border: "1px solid var(--ld-white-10)",
              }}
            >
              {/* Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background: "linear-gradient(135deg, color-mix(in srgb, var(--ld-bio) 15%, transparent), transparent)",
                  border: "1px solid var(--ld-bio)",
                }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: "var(--ld-bio)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>

              {/* Label */}
              <p
                className="text-sm font-semibold tracking-wider uppercase mb-4"
                style={{ color: "var(--ld-bio)" }}
              >
                Our Mission
              </p>

              {/* Content */}
              <h3
                className="text-2xl lg:text-3xl font-semibold leading-tight mb-4"
                style={{ color: "var(--ld-white)" }}
              >
                Translating climate science to actionable playbooks
              </h3>

              <p className="ld-body" style={{ color: "var(--ld-white-70)" }}>
                Empowering cities, states, and organisations by turning sustainability
                goals into real impact — through Big Data, AI, and Human Expertise.
              </p>

              {/* Decorative element */}
              <div
                className="absolute top-0 right-0 w-32 h-32 opacity-5"
                style={{
                  background: "radial-gradient(circle, var(--ld-bio), transparent 70%)",
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <p className="ld-display-md" style={{ color: "var(--ld-white-70)" }}>
            From{" "}
            <span style={{ color: "var(--ld-white)" }}>global goals</span>
            {" "}to{" "}
            <span className="ld-gradient-text">local action</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
