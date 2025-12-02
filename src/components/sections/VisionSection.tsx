"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// Positions as percentages within the map container (keep within 15-85% range)
const cities = [
  { name: "Singapore", x: 78, y: 62, color: "--ld-heat", delay: 0.4 },      // Southeast Asia
  { name: "Rotterdam", x: 48, y: 35, color: "--ld-ocean", delay: 0.6 },     // Europe
  { name: "Copenhagen", x: 52, y: 28, color: "--ld-bio", delay: 0.8 },      // Europe (north)
  { name: "Lagos", x: 46, y: 58, color: "--ld-air", delay: 1.0 },           // Africa
  { name: "Mumbai", x: 68, y: 48, color: "--ld-restore", delay: 1.2 },      // Asia
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
            {/* Simple world map SVG - positions match % coordinates in container */}
            <svg
              viewBox="0 0 100 75"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full"
              style={{ opacity: 0.25 }}
            >
              {/* North America */}
              <path
                d="M5,15 Q10,10 22,12 L28,18 Q32,24 28,32 L20,36 Q12,34 8,30 L5,22 Q3,18 5,15"
                fill="var(--ld-navy-light)"
              />
              {/* South America */}
              <path
                d="M18,42 Q24,38 30,42 L32,55 Q28,65 20,62 L15,52 Q14,46 18,42"
                fill="var(--ld-navy-light)"
              />
              {/* Europe - centered around x:48-52, y:28-35 */}
              <path
                d="M42,22 Q50,18 58,22 L60,32 Q56,40 48,38 L42,32 Q40,26 42,22"
                fill="var(--ld-navy-light)"
              />
              {/* Africa - centered around x:46, y:58 */}
              <path
                d="M40,42 Q50,38 56,44 L54,62 Q48,70 40,66 L36,52 Q38,46 40,42"
                fill="var(--ld-navy-light)"
              />
              {/* Asia - centered around x:68-78, y:48-62 */}
              <path
                d="M60,18 Q75,12 90,22 L92,42 Q88,58 72,55 L62,48 Q58,36 60,26 Q58,22 60,18"
                fill="var(--ld-navy-light)"
              />
              {/* Australia */}
              <path
                d="M76,58 Q86,55 92,62 L90,70 Q82,74 76,68 L74,62 Q74,60 76,58"
                fill="var(--ld-navy-light)"
              />
            </svg>

            {/* Hotspots - with module colors */}
            {cities.map((city) => (
              <motion.div
                key={city.name}
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: city.delay }}
                className="absolute"
                style={{
                  left: `${city.x}%`,
                  top: `${city.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Pulse rings */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 20,
                    height: 20,
                    top: "50%",
                    left: "50%",
                    marginTop: -10,
                    marginLeft: -10,
                    border: `2px solid var(${city.color})`,
                  }}
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 32,
                    height: 32,
                    top: "50%",
                    left: "50%",
                    marginTop: -16,
                    marginLeft: -16,
                    border: `1px solid var(${city.color})`,
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.5,
                  }}
                />
                {/* Dot */}
                <div
                  className="relative w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: `var(${city.color})`,
                    boxShadow: `0 0 12px color-mix(in srgb, var(${city.color}) 50%, transparent)`,
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
