"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      id="cta"
      ref={sectionRef}
      className="ld-section relative"
      style={{ background: "var(--ld-navy-deep)" }}
    >
      {/* Subtle radial gradient - barely visible */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, rgba(45, 212, 191, 0.03) 0%, transparent 60%)",
        }}
      />

      {/* Subtle ambient glow - very restrained */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-[150px]"
        style={{ background: "var(--ld-navy-mid)", opacity: 0.5 }}
      />

      <div className="ld-section-content relative z-10 text-center">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="ld-caption mb-6"
        >
          Ready to See Your City?
        </motion.p>

        {/* Main headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="ld-display-xl mb-6"
        >
          Give your city an
          <br />
          <span className="ld-gradient-text">Impact Atlas.</span>
        </motion.h2>

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="ld-body-lg max-w-xl mx-auto mb-10"
        >
          Built at the intersection of climate science, satellite data, and AI.
          Ready to transform how cities tackle environmental challenges.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a href="/dashboard" className="ld-btn-primary">
            Explore the Demo
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>

        {/* Hackathon badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
            style={{
              background: "var(--ld-white-5)",
              border: "1px solid var(--ld-white-10)",
              color: "var(--ld-white-50)",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Built for Barcelona Fixathon 2025
          </div>
        </motion.div>

        {/* Sponsors */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-12"
        >
          <p className="text-xs uppercase tracking-widest mb-6" style={{ color: "var(--ld-white-30)" }}>
            Supported by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {/* Spotify */}
            <a
              href="https://spotify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <img
                src="https://cdn.prod.website-files.com/65e76a14af207274f46c7f0e/67173f63ef1d60bc1e3bfc89_Spotify_Full_Logo_RGB_Green.png"
                alt="Spotify"
                className="h-7 md:h-8 w-auto"
              />
            </a>
            {/* Google */}
            <a
              href="https://google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <img
                src="https://cdn.prod.website-files.com/65e76a14af207274f46c7f0e/6915f27bb862932c92c34a92_google-white-logo.png"
                alt="Google"
                className="h-7 md:h-8 w-auto"
              />
            </a>
            {/* NVIDIA */}
            <a
              href="https://nvidia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <img
                src="https://cdn.prod.website-files.com/65e76a14af207274f46c7f0e/69025376dc6af1cbf11839c9_NVIDIA_logo%201.svg"
                alt="NVIDIA"
                className="h-7 md:h-8 w-auto"
              />
            </a>
            {/* Riksbanken */}
            <a
              href="https://riksbank.se"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <img
                src="https://cdn.prod.website-files.com/65e76a14af207274f46c7f0e/6904afe11a4e5107d10b480f_logo-riksbanken%206.svg"
                alt="Riksbanken"
                className="h-7 md:h-8 w-auto"
              />
            </a>
            {/* Lovable */}
            <a
              href="https://lovable.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <img
                src="https://cdn.prod.website-files.com/65e76a14af207274f46c7f0e/690a008c310eaea23af7f328_00ee2279-3113-4d7f-b1bc-aa951404e869.png"
                alt="Lovable"
                className="h-7 md:h-8 w-auto"
              />
            </a>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8"
          style={{ color: "var(--ld-white-30)" }}
        >
          <span className="text-sm">Impact Atlas</span>
          <span className="text-sm">©2025</span>
        </motion.div>
      </div>
    </section>
  );
}
