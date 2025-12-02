"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const problems = [
  {
    id: "translation",
    number: "01",
    title: "Policy → Action Gap",
    description: "High complexity in understanding how global sustainability efforts interact and translate at various levels of locality. Even advanced countries struggle to translate climate goals to climate impact.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "--ld-ocean",
  },
  {
    id: "fragmented",
    number: "02",
    title: "Fragmented Data",
    description: "Environmental, climate, and socio-economic data live in separate portals, formats, and institutions. Copernicus, NASA, GBIF, UN — nothing speaks the same language.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    color: "--ld-air",
  },
  {
    id: "slow",
    number: "03",
    title: "Slow Decision Cycles",
    description: "Cities are under pressure to show visible progress within 12–24 months. Heat mitigation, pollution hotspots, restoration wins — they can't wait for long policy cycles.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "--ld-heat",
  },
  {
    id: "participation",
    number: "04",
    title: "Limited Participation",
    description: "Low visibility of high-impact, low-effort climate actions. Citizens and private sector don't know where they can make a difference.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: "--ld-bio",
  },
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [hoveredProblem, setHoveredProblem] = useState<string | null>(null);

  return (
    <section
      ref={sectionRef}
      className="ld-section relative"
      style={{ background: "var(--ld-navy-dark)" }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(var(--ld-silver-muted) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="ld-section-content relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="ld-caption mb-4"
          >
            The Challenge
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="ld-display-lg mb-6"
          >
            Urban climate teams face{" "}
            <span className="ld-gradient-text">four barriers</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="ld-body-lg"
          >
            Cities want to act on climate. But the path from global policy to local
            action is blocked by complexity, fragmentation, and time pressure.
          </motion.p>
        </div>

        {/* Problem Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
              onMouseEnter={() => setHoveredProblem(problem.id)}
              onMouseLeave={() => setHoveredProblem(null)}
              className="group relative"
            >
              {/* Gradient border on hover */}
              <div
                className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, var(${problem.color}), transparent 60%)`,
                }}
              />

              {/* Card */}
              <div
                className="relative p-8 rounded-2xl h-full transition-all duration-300"
                style={{
                  background: "var(--ld-navy-deep)",
                  border: "1px solid var(--ld-white-10)",
                  transform: hoveredProblem === problem.id ? "translateY(-4px)" : "none",
                }}
              >
                {/* Number */}
                <span
                  className="absolute top-6 right-6 text-5xl font-bold opacity-10"
                  style={{ color: `var(${problem.color})` }}
                >
                  {problem.number}
                </span>

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, var(${problem.color}) 20%, transparent), color-mix(in srgb, var(${problem.color}) 5%, transparent))`,
                    color: `var(${problem.color})`,
                  }}
                >
                  {problem.icon}
                </div>

                {/* Content */}
                <h3
                  className="text-xl font-semibold mb-3 transition-colors duration-300"
                  style={{ color: hoveredProblem === problem.id ? "var(--ld-white)" : "var(--ld-white-90)" }}
                >
                  {problem.title}
                </h3>

                <p
                  className="leading-relaxed transition-colors duration-300"
                  style={{ color: hoveredProblem === problem.id ? "var(--ld-white-70)" : "var(--ld-white-50)" }}
                >
                  {problem.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom stat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-12 text-center"
        >
          <p className="ld-body" style={{ color: "var(--ld-white-50)" }}>
            Result: Cities waste{" "}
            <span style={{ color: "var(--ld-heat)" }}>months of analysis time</span>{" "}
            and miss high-impact opportunities hiding in plain sight.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
