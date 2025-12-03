"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const dataNodes = [
  { id: "planetary", label: "Planetary Boundaries", x: 15, y: 20, color: "--ld-ocean" },
  { id: "sdgs", label: "UN SDGs", x: 85, y: 25, color: "--ld-bio" },
  { id: "policies", label: "Global & Local Policies", x: 20, y: 75, color: "--ld-air" },
  { id: "data", label: "Real World Data", x: 80, y: 80, color: "--ld-heat" },
];

const _connections = [
  { from: "planetary", to: "center" },
  { from: "sdgs", to: "center" },
  { from: "policies", to: "center" },
  { from: "data", to: "center" },
];

export default function ApproachSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [pulseIndex, setPulseIndex] = useState(0);

  // Animate data pulses
  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % dataNodes.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      className="ld-section relative overflow-hidden"
      style={{ background: "var(--ld-navy-deep)" }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, rgba(45, 212, 191, 0.05) 0%, transparent 60%)",
        }}
      />

      <div className="ld-section-content relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Interactive Node Graph */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative aspect-square max-w-lg mx-auto lg:mx-0 order-2 lg:order-1"
          >
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full">
              {dataNodes.map((node, i) => (
                <motion.line
                  key={`line-${node.id}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2="50%"
                  y2="50%"
                  stroke={`var(${node.color})`}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 0.3 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                />
              ))}

              {/* Animated pulse along lines */}
              {dataNodes.map((node, i) => (
                <motion.circle
                  key={`pulse-${node.id}`}
                  r="4"
                  fill={`var(${node.color})`}
                  initial={{ opacity: 0 }}
                  animate={
                    pulseIndex === i && isInView
                      ? {
                          cx: [`${node.x}%`, "50%"],
                          cy: [`${node.y}%`, "50%"],
                          opacity: [0, 1, 0],
                        }
                      : { opacity: 0 }
                  }
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              ))}
            </svg>

            {/* Center node - Impact Atlas */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.8, type: "spring" }}
            >
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, var(--ld-navy-mid), var(--ld-navy-dark))",
                  border: "2px solid var(--ld-teal)",
                  boxShadow: "0 0 60px var(--ld-teal-glow)",
                }}
              >
                <div className="text-center">
                  <div
                    className="text-xs font-semibold tracking-wider mb-1"
                    style={{ color: "var(--ld-teal)" }}
                  >
                    IMPACT
                  </div>
                  <div
                    className="text-lg font-bold"
                    style={{ color: "var(--ld-white)" }}
                  >
                    ATLAS
                  </div>
                </div>
              </div>

              {/* Rotating ring */}
              <motion.div
                className="absolute inset-[-8px] rounded-full border border-dashed"
                style={{ borderColor: "var(--ld-white-10)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>

            {/* Data source nodes */}
            {dataNodes.map((node, i) => (
              <motion.div
                key={node.id}
                className="absolute cursor-pointer"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
              >
                <motion.div
                  className="relative"
                  animate={{
                    scale: activeNode === node.id ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Glow ring */}
                  <div
                    className="absolute inset-[-4px] rounded-full opacity-0 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle, var(${node.color}), transparent 70%)`,
                      opacity: activeNode === node.id || pulseIndex === i ? 0.3 : 0,
                    }}
                  />

                  {/* Node */}
                  <div
                    className="relative px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300"
                    style={{
                      background: activeNode === node.id
                        ? `color-mix(in srgb, var(${node.color}) 20%, var(--ld-navy-dark))`
                        : "var(--ld-navy-mid)",
                      border: `1px solid var(${node.color})`,
                      color: `var(${node.color})`,
                      boxShadow: activeNode === node.id
                        ? `0 0 20px color-mix(in srgb, var(${node.color}) 30%, transparent)`
                        : "none",
                    }}
                  >
                    {node.label}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2">
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="ld-caption mb-4"
            >
              Our Approach
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="ld-display-lg mb-6"
            >
              Connecting the{" "}
              <span className="ld-gradient-text">dots</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="ld-body-lg mb-8"
            >
              Through Big Data, AI, and Human Expertise, we bridge the gap between
              science, policy, and action.
            </motion.p>

            {/* What we connect */}
            <div className="space-y-4">
              {[
                { label: "Planetary Boundaries", desc: "Earth's safe operating limits", color: "--ld-ocean" },
                { label: "UN SDGs", desc: "17 global sustainability goals", color: "--ld-bio" },
                { label: "Policies", desc: "Global treaties to local regulations", color: "--ld-air" },
                { label: "Real Data", desc: "Satellite imagery, sensors, research", color: "--ld-heat" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ background: `var(${item.color})` }}
                  />
                  <div>
                    <span className="font-medium" style={{ color: "var(--ld-white-90)" }}>
                      {item.label}
                    </span>
                    <span className="mx-2" style={{ color: "var(--ld-white-30)" }}>—</span>
                    <span style={{ color: "var(--ld-white-50)" }}>{item.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Output */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-8 p-6 rounded-xl"
              style={{
                background: "var(--ld-teal-subtle)",
                border: "1px solid var(--ld-teal)",
              }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--ld-teal)" }}>
                The Result
              </p>
              <p className="mt-2" style={{ color: "var(--ld-white-90)" }}>
                <strong>Actionable, prioritised playbooks</strong> — not just dashboards.
                Quick wins scored by impact so cities focus on what matters most.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
