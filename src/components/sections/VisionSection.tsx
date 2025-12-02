"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const cities = [
  { name: "Singapore", x: 75, y: 55, delay: 0.4 },
  { name: "Rotterdam", x: 48, y: 28, delay: 0.6 },
  { name: "Copenhagen", x: 50, y: 24, delay: 0.8 },
  { name: "Lagos", x: 47, y: 52, delay: 1.0 },
  { name: "Mumbai", x: 68, y: 45, delay: 1.2 },
];

export default function VisionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      id="vision"
      ref={sectionRef}
      className="ld-section relative"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, var(--ld-navy-dark) 0%, var(--ld-navy-deep) 70%)" }}
      />

      <div className="ld-section-content relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="ld-caption mb-4"
            >
              The Vision
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="ld-display-lg mb-6"
            >
              Every city has{" "}
              <span className="ld-gradient-text">untapped potential.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="ld-body-lg mb-8"
            >
              Impact Atlas is an <strong style={{ color: "var(--ld-teal)" }}>impact radar</strong> that
              reveals hotspots and quick wins — the fastest paths to measurable
              climate and health outcomes.
            </motion.p>

            {/* Metrics */}
            <div className="space-y-4">
              {[
                { icon: "→", text: "6 intervention areas" },
                { icon: "→", text: "Real-time data integration" },
                { icon: "→", text: "AI-powered prioritization" },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span style={{ color: "var(--ld-teal)" }}>{item.icon}</span>
                  <span className="ld-body">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Map Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden"
            style={{ background: "var(--ld-navy-dark)", border: "1px solid var(--ld-white-10)" }}
          >
            {/* Simple world map SVG */}
            <svg
              viewBox="0 0 100 60"
              className="absolute inset-0 w-full h-full"
              style={{ opacity: 0.3 }}
            >
              {/* Simplified continent shapes */}
              <path
                d="M20,15 Q25,10 35,12 L40,15 Q45,18 42,25 L35,30 Q30,28 25,30 L20,25 Q15,20 20,15"
                fill="var(--ld-navy-light)"
              />
              <path
                d="M45,20 Q55,15 60,20 L65,30 Q60,40 50,38 L45,30 Q42,25 45,20"
                fill="var(--ld-navy-light)"
              />
              <path
                d="M60,25 Q75,20 85,30 L90,45 Q85,55 70,50 L60,40 Q55,35 60,25"
                fill="var(--ld-navy-light)"
              />
              <path
                d="M15,35 Q20,32 30,35 L35,45 Q30,55 20,50 L15,42 Q12,38 15,35"
                fill="var(--ld-navy-light)"
              />
            </svg>

            {/* Hotspots - unified teal */}
            {cities.map((city) => (
              <motion.div
                key={city.name}
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: city.delay }}
                className="absolute ld-hotspot"
                style={{
                  left: `${city.x}%`,
                  top: `${city.y}%`,
                  transform: "translate(-50%, -50%)",
                  color: "var(--ld-teal)",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: "var(--ld-teal)",
                    boxShadow: "0 0 10px var(--ld-teal-glow)",
                  }}
                />
              </motion.div>
            ))}

            {/* Inner border - subtle */}
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{ boxShadow: "inset 0 0 40px rgba(0, 0, 0, 0.3)" }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
