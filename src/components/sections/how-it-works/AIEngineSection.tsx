"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const knowledgeDomains = [
  { id: "planetary", label: "Planetary Boundaries", description: "9 Earth system limits" },
  { id: "sdgs", label: "UN SDGs", description: "17 global goals" },
  { id: "policies", label: "Climate Policies", description: "Global & local laws" },
  { id: "science", label: "Climate Science", description: "Latest research" },
];

const capabilities = [
  {
    title: "Context Understanding",
    description: "Relates global frameworks to local conditions",
    icon: "🧠",
  },
  {
    title: "Pattern Recognition",
    description: "Finds correlations humans might miss",
    icon: "🔍",
  },
  {
    title: "Impact Scoring",
    description: "Quantifies potential outcomes",
    icon: "📊",
  },
  {
    title: "Natural Language",
    description: "Explains findings in plain terms",
    icon: "💬",
  },
];

export default function AIEngineSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [activeDomain, setActiveDomain] = useState(0);

  // Cycle through domains
  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveDomain((prev) => (prev + 1) % knowledgeDomains.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      className="ld-section relative"
      style={{ background: "var(--ld-navy-dark)" }}
    >
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
        style={{ background: "var(--ld-teal)" }}
      />

      <div className="ld-section-content relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="ld-caption mb-4"
          >
            AI Copilot
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="ld-display-lg mb-6"
          >
            Intelligence that{" "}
            <span className="ld-gradient-text">understands context</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="ld-body-lg"
          >
            Our AI doesn't just process data — it understands Planetary Boundaries,
            UN SDGs, and how they relate to global and local policies.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Brain visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative aspect-square max-w-md mx-auto"
          >
            {/* Central "brain" */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-40 h-40 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, var(--ld-navy-mid), var(--ld-navy-deep))",
                  border: "2px solid var(--ld-teal)",
                  boxShadow: "0 0 60px var(--ld-teal-glow), inset 0 0 40px var(--ld-teal-subtle)",
                }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-1">🧠</div>
                  <div
                    className="text-xs font-semibold tracking-wider"
                    style={{ color: "var(--ld-teal)" }}
                  >
                    AI COPILOT
                  </div>
                </div>
              </div>

              {/* Pulsing rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute rounded-full border"
                  style={{
                    width: 160 + ring * 60,
                    height: 160 + ring * 60,
                    borderColor: "var(--ld-teal)",
                    opacity: 0.1,
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: ring * 0.3,
                  }}
                />
              ))}
            </div>

            {/* Knowledge domain nodes */}
            {knowledgeDomains.map((domain, i) => {
              const angle = (i * 90 - 45) * (Math.PI / 180);
              const radius = 45;
              const x = 50 + Math.cos(angle) * radius;
              const y = 50 + Math.sin(angle) * radius;
              const isActive = activeDomain === i;

              return (
                <motion.div
                  key={domain.id}
                  className="absolute"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                >
                  {/* Connection line */}
                  <svg
                    className="absolute"
                    style={{
                      width: 100,
                      height: 100,
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      overflow: "visible",
                    }}
                  >
                    <motion.line
                      x1="50"
                      y1="50"
                      x2={50 + (50 - x) * 0.8}
                      y2={50 + (50 - y) * 0.8}
                      stroke={isActive ? "var(--ld-teal)" : "var(--ld-white-20)"}
                      strokeWidth={isActive ? "2" : "1"}
                      strokeDasharray={isActive ? "none" : "4 4"}
                    />
                  </svg>

                  {/* Node */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative px-4 py-3 rounded-xl text-center cursor-pointer"
                    style={{
                      background: isActive ? "var(--ld-navy-mid)" : "var(--ld-navy-dark)",
                      border: isActive ? "1px solid var(--ld-teal)" : "1px solid var(--ld-white-10)",
                      boxShadow: isActive ? "0 0 20px var(--ld-teal-glow)" : "none",
                      minWidth: 140,
                    }}
                    onClick={() => setActiveDomain(i)}
                  >
                    <div
                      className="text-sm font-semibold mb-1"
                      style={{ color: isActive ? "var(--ld-teal)" : "var(--ld-white-70)" }}
                    >
                      {domain.label}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--ld-white-40)" }}
                    >
                      {domain.description}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Right: Capabilities */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-xl font-semibold mb-6"
              style={{ color: "var(--ld-white)" }}
            >
              Human-AI Symbiosis
            </motion.h3>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="ld-body mb-8"
            >
              Our AI works alongside climate experts to give cities local reach
              with global intelligence. It augments human expertise, never replaces it.
            </motion.p>

            <div className="grid grid-cols-2 gap-4">
              {capabilities.map((cap, i) => (
                <motion.div
                  key={cap.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
                  className="p-4 rounded-xl"
                  style={{
                    background: "var(--ld-navy-deep)",
                    border: "1px solid var(--ld-white-10)",
                  }}
                >
                  <div className="text-2xl mb-2">{cap.icon}</div>
                  <h4
                    className="font-semibold text-sm mb-1"
                    style={{ color: "var(--ld-white-90)" }}
                  >
                    {cap.title}
                  </h4>
                  <p
                    className="text-xs"
                    style={{ color: "var(--ld-white-50)" }}
                  >
                    {cap.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
