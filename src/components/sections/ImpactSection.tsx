"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

const metrics = [
  { value: 47, suffix: "", label: "Heat hotspots identified" },
  { value: 23, suffix: "", label: "Quick wins prioritized" },
  { value: 2.3, suffix: "M", label: "Projected savings", prefix: "$" },
  { value: 850, suffix: "", label: "Hectares restoration potential" },
];

function AnimatedNumber({
  value,
  suffix = "",
  prefix = "",
  duration = 2
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      setDisplayValue(value * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  const formatted = value % 1 === 0
    ? Math.round(displayValue).toLocaleString()
    : displayValue.toFixed(1);

  return (
    <span ref={ref}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

export default function ImpactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      id="impact"
      ref={sectionRef}
      className="ld-section relative"
      style={{ background: "var(--ld-navy-deep)" }}
    >
      {/* Background city silhouette */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 opacity-10"
        style={{
          background: "linear-gradient(to top, var(--ld-navy-mid), transparent)",
        }}
      />

      <div className="ld-section-content relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="ld-caption mb-4"
          >
            Real Impact
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="ld-display-lg mb-4"
          >
            What we found in{" "}
            <span className="ld-gradient-text">24 hours.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="ld-body-lg max-w-xl mx-auto"
          >
            A single city analysis revealed immediate opportunities for impact.
          </motion.p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
              className="ld-card p-5 text-center"
            >
              <p
                className="ld-data mb-2"
                style={{ color: "var(--ld-white)" }}
              >
                <AnimatedNumber
                  value={metric.value}
                  suffix={metric.suffix}
                  prefix={metric.prefix || ""}
                />
              </p>
              <p className="ld-body-sm">{metric.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div
            className="text-6xl mb-4"
            style={{ color: "var(--ld-white-10)" }}
          >
            "
          </div>
          <p
            className="text-xl italic mb-6"
            style={{ color: "var(--ld-white-90)" }}
          >
            Impact Atlas helped us identify quick wins we would have missed for years.
            The ROI prioritization alone saved months of analysis.
          </p>
          <p className="ld-body-sm">
            — Sustainability Director, European City
          </p>
        </motion.div>
      </div>
    </section>
  );
}
