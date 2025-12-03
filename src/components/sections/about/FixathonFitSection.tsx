"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const challenges = [
  {
    id: "oceans",
    number: "0.1",
    title: "Oceans of the Future",
    description: "Oceans cover 70% of Earth, generate half our oxygen, and absorb massive CO₂. Yet they face rising temps, acidification, and plastic pollution.",
    color: "--ld-ocean",
    howWeHelp: [
      "Coastal Plastic Module — predicts accumulation zones",
      "Port Emissions tracking — monitors maritime impact",
      "Biodiversity mapping — identifies marine restoration zones",
    ],
  },
  {
    id: "ai-earth",
    number: "0.2",
    title: "AI for a Living Earth",
    description: "Humanity is pushing the planet beyond safe limits. Climate change, biodiversity loss, and ocean degradation accelerate — we need every tool available.",
    color: "--ld-bio",
    howWeHelp: [
      "AI Copilot — understands Planetary Boundaries & SDGs",
      "Quick Win scoring — prioritizes highest-impact actions",
      "Cross-dataset insights — reveals novel correlations",
    ],
  },
];

export default function FixathonFitSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      className="ld-section relative overflow-hidden"
      style={{ background: "var(--ld-navy-deep)" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0">
        {/* Norrsken-inspired gradient */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: "var(--ld-teal)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: "var(--ld-ocean)" }}
        />
      </div>

      <div className="ld-section-content relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.a
            href="https://www.norrsken.org/fixathon"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-6 hover:scale-105 transition-transform"
            style={{
              background: "var(--ld-white-5)",
              border: "1px solid var(--ld-white-10)",
            }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "var(--ld-teal)" }}
            />
            <span className="text-sm font-medium" style={{ color: "var(--ld-white-70)" }}>
              Norrsken Fixathon Barcelona • Dec 1-2, 2025
            </span>
          </motion.a>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="ld-display-lg mb-6"
          >
            Built for the{" "}
            <span className="ld-gradient-text">Planet Challenge</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="ld-body-lg"
          >
            Impact Atlas directly addresses both challenge tracks of the World&apos;s Largest Fixathon.
          </motion.p>
        </div>

        {/* Challenge Cards */}
        <div className="grid lg:grid-cols-2 gap-8">
          {challenges.map((challenge, i) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.2 }}
              className="relative group"
            >
              {/* Glow on hover */}
              <div
                className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                style={{ background: `var(${challenge.color})` }}
              />

              {/* Card */}
              <div
                className="relative p-8 rounded-2xl h-full"
                style={{
                  background: "var(--ld-navy-dark)",
                  border: `1px solid color-mix(in srgb, var(${challenge.color}) 30%, transparent)`,
                }}
              >
                {/* Challenge number badge */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-6"
                  style={{
                    background: `color-mix(in srgb, var(${challenge.color}) 15%, transparent)`,
                    border: `1px solid var(${challenge.color})`,
                  }}
                >
                  <span
                    className="text-sm font-mono font-bold"
                    style={{ color: `var(${challenge.color})` }}
                  >
                    {challenge.number}
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: `var(${challenge.color})` }}
                  >
                    Challenge
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="text-2xl font-semibold mb-4"
                  style={{ color: "var(--ld-white)" }}
                >
                  {challenge.title}
                </h3>

                {/* Description */}
                <p
                  className="mb-6 leading-relaxed"
                  style={{ color: "var(--ld-white-60)" }}
                >
                  {challenge.description}
                </p>

                {/* How we help */}
                <div
                  className="pt-6"
                  style={{ borderTop: "1px solid var(--ld-white-10)" }}
                >
                  <p
                    className="text-xs font-semibold tracking-wider uppercase mb-4"
                    style={{ color: `var(${challenge.color})` }}
                  >
                    How Impact Atlas Helps
                  </p>
                  <ul className="space-y-3">
                    {challenge.howWeHelp.map((item, j) => (
                      <motion.li
                        key={j}
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.4, delay: 0.6 + i * 0.2 + j * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <svg
                          className="w-5 h-5 flex-shrink-0 mt-0.5"
                          style={{ color: `var(${challenge.color})` }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span style={{ color: "var(--ld-white-80)" }}>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-16 text-center"
        >
          <p className="ld-body mb-6" style={{ color: "var(--ld-white-50)" }}>
            We&apos;re not just addressing these challenges — we&apos;re providing the{" "}
            <span style={{ color: "var(--ld-teal)" }}>intelligence layer</span>{" "}
            cities need to act on them.
          </p>

          <a
            href="/dashboard"
            className="ld-btn-primary inline-flex"
          >
            See the Platform
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
