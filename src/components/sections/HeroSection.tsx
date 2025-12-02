"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const splitProgress = useTransform(scrollYProgress, [0, 0.5], [50, 80]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="ld-section relative"
    >
      {/* Split City Background - monochromatic, premium */}
      <motion.div
        className="absolute inset-0"
        style={{ y: backgroundY }}
      >
        {/* Base image - desaturated */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=2000&q=80')`,
            filter: "grayscale(1) brightness(0.25) contrast(1.1)",
          }}
        />

        {/* Restored side (right) - slight teal tint */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=2000&q=80')`,
            filter: "grayscale(0.7) brightness(0.35) contrast(1.1) sepia(0.1)",
            clipPath: useTransform(splitProgress, (v) => `polygon(${v}% 0, 100% 0, 100% 100%, ${v - 20}% 100%)`),
          }}
        />

        {/* Gradient overlays - neutral */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(9,9,11,0.9), rgba(9,9,11,0.5), rgba(9,9,11,0.95))" }}
        />

        {/* Animated divider line - subtle */}
        <motion.div
          className="absolute top-0 bottom-0 w-px"
          style={{
            left: useTransform(splitProgress, (v) => `${v - 10}%`),
            background: "linear-gradient(to bottom, transparent, var(--ld-white-30), transparent)",
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="ld-section-content relative z-10 flex flex-col justify-center h-full">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="ld-caption mb-6"
          >
            Climate Intelligence Platform
          </motion.p>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="ld-display-xl mb-6"
          >
            Cities are blind to their{" "}
            <span className="ld-gradient-text">quickest wins.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="ld-body-lg max-w-2xl mb-10"
          >
            While urban leaders debate long-term strategies, high-impact
            opportunities slip away. Impact Atlas reveals what others miss.
          </motion.p>

          {/* Pain Points - unified silver aesthetic */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap gap-6 mb-12"
          >
            {[
              "Data trapped in silos",
              "Months to analyze",
              "Budgets & lives at risk",
            ].map((text, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "var(--ld-silver-muted)" }}
                />
                <span className="ld-body-sm">{text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-wrap gap-4"
          >
            <a href="#vision" className="ld-btn-primary">
              See How It Works
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
            <a href="/dashboard" className="ld-btn-secondary">
              View Live Demo
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest" style={{ color: "var(--ld-white-50)" }}>Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-5 h-5" style={{ color: "var(--ld-white-50)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
