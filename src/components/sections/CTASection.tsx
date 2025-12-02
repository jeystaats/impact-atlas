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
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {/* Norrsken */}
            <a
              href="https://norrsken.org"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <svg className="h-5 md:h-6" viewBox="0 0 512 116" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M90.5 0L58.4 58L90.5 116H58.4L26.3 58L58.4 0H90.5ZM32.1 0L0 58L32.1 116H0L32.1 58L0 0H32.1Z" fill="currentColor" style={{ color: "var(--ld-white-80)" }}/>
                <path d="M155.5 28.5V87H141.8V46.9L121 87H109.8L89 46.9V87H75.3V28.5H92.1L115.4 71.1L138.7 28.5H155.5ZM217.8 58.1C217.8 75.8 203.9 88.5 184.8 88.5C165.7 88.5 151.8 75.8 151.8 58.1C151.8 40.1 165.7 27 184.8 27C203.9 27 217.8 40.1 217.8 58.1ZM203.5 58.1C203.5 47.5 195.4 40 184.8 40C174.2 40 166.1 47.5 166.1 58.1C166.1 68.4 174.2 75.9 184.8 75.9C195.4 75.9 203.5 68.4 203.5 58.1ZM276.2 87L258.5 62.1H249.2V87H235.2V28.5H263.8C279.4 28.5 289.4 37.6 289.4 50.8C289.4 61.4 282.8 69.2 272.5 72L292.1 87H276.2ZM249.2 51.2H262.3C269.4 51.2 274.1 47.3 274.1 50.8C274.1 47.5 269.4 41 262.3 41H249.2V51.2ZM356.8 87L339.1 62.1H329.8V87H315.8V28.5H344.4C360 28.5 370 37.6 370 50.8C370 61.4 363.4 69.2 353.1 72L372.7 87H356.8ZM329.8 51.2H342.9C350 51.2 354.7 47.3 354.7 50.8C354.7 47.5 350 41 342.9 41H329.8V51.2ZM409.2 88.5C391.5 88.5 379.2 78.2 378.4 63.2H393.1C394.1 71.1 400.5 76.3 409.5 76.3C418.2 76.3 423.5 72 423.5 65.7C423.5 47.9 379.8 58.4 379.8 32.8C379.8 21.2 390.2 27 406.8 27C423.4 27 435.1 36.7 436.5 50.5H421.6C420.6 43.5 414.9 38.8 406.8 38.8C398.7 38.8 393.6 42.5 393.6 48.4C393.6 65.4 437.3 55.4 437.3 80.5C437.3 92.4 426.5 88.5 409.2 88.5ZM512 87H497.2L488.8 73.3L479.9 87H465.1L481.3 57.4L465.7 28.5H480.5L488.6 41.8L497 28.5H511.8L496.3 57.1L512 87Z" fill="currentColor" style={{ color: "var(--ld-white-80)" }}/>
              </svg>
            </a>
            {/* Spotify */}
            <a
              href="https://spotify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <svg className="h-6 md:h-7" viewBox="0 0 168 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 0C11.2 0 0 11.2 0 25s11.2 25 25 25 25-11.2 25-25S38.8 0 25 0zm11.5 36c-.5.7-1.3 1-2.1.6-5.8-3.5-13-4.3-21.6-2.4-.8.2-1.6-.3-1.8-1.1-.2-.8.3-1.6 1.1-1.8 9.4-2.1 17.4-1.2 24 2.7.7.4 1 1.3.4 2zm3-6.8c-.6.9-1.7 1.2-2.6.6-6.6-4.1-16.7-5.3-24.5-2.9-1 .3-2-.3-2.3-1.2-.3-1 .3-2 1.2-2.3 9-2.7 20.1-1.4 27.7 3.3.8.5 1.1 1.6.5 2.5zm.3-7.1c-7.9-4.7-21-5.1-28.6-2.8-1.2.4-2.5-.3-2.9-1.5-.4-1.2.3-2.5 1.5-2.9 8.7-2.6 23.2-2.1 32.3 3.3 1.1.6 1.4 2 .8 3.1-.6 1-2 1.4-3.1.8z" fill="#1DB954"/>
                <path d="M73.5 21.5c-4.8-1.1-5.6-1.9-5.6-3.6 0-1.6 1.5-2.6 3.8-2.6 2.2 0 4.4.8 6.6 2.5.1.1.2.1.3 0 .1 0 .2-.1.2-.2l2.1-3c.1-.2.1-.4-.1-.5-2.6-2.2-5.5-3.2-9-3.2-5 0-8.5 3-8.5 7.3 0 4.6 3 6.2 8.3 7.5 4.6 1.1 5.3 2 5.3 3.5 0 1.8-1.6 2.8-4.2 2.8-2.9 0-5.2-1-7.7-3.1-.1-.1-.2-.1-.3-.1-.1 0-.2.1-.2.1l-2.3 2.9c-.1.2-.1.4.1.5 2.9 2.6 6.5 4 10.2 4 5.4 0 8.9-2.9 8.9-7.5.1-4-2.6-6-8.9-7.3zM95.7 16.9c-2.3 0-4.2 1-5.7 3v-2.4c0-.2-.2-.4-.4-.4h-4c-.2 0-.4.2-.4.4v25.9c0 .2.2.4.4.4h4c.2 0 .4-.2.4-.4V31c1.5 1.8 3.4 2.7 5.7 2.7 4.2 0 8.5-3.3 8.5-8.4 0-5.1-4.3-8.4-8.5-8.4zm3.7 8.4c0 2.6-1.8 4.5-4.3 4.5-2.4 0-4.3-2-4.3-4.5 0-2.5 1.9-4.4 4.3-4.4 2.4 0 4.3 1.9 4.3 4.4zM119.5 16.9c-5 0-8.8 3.7-8.8 8.5 0 4.7 3.8 8.3 8.8 8.3 5 0 8.8-3.6 8.8-8.4 0-4.8-3.8-8.4-8.8-8.4zm0 13c-2.5 0-4.4-1.9-4.4-4.5 0-2.6 1.8-4.5 4.4-4.5 2.5 0 4.4 1.9 4.4 4.5 0 2.6-1.8 4.5-4.4 4.5zM141.5 17.1h-4.4v-5c0-.2-.2-.4-.4-.4h-4c-.2 0-.4.2-.4.4v5h-1.9c-.2 0-.4.2-.4.4v3.4c0 .2.2.4.4.4h1.9v8.8c0 3.6 1.8 5.4 5.3 5.4 1.4 0 2.6-.3 3.8-.9.1-.1.2-.2.2-.4v-3.2c0-.1-.1-.3-.2-.3-.1-.1-.2-.1-.3 0-.8.4-1.5.5-2.3.5-1.3 0-1.8-.5-1.8-1.9v-7.9h4.4c.2 0 .4-.2.4-.4v-3.4c.1-.3-.1-.5-.3-.5zM159.5 17.1v-.5c0-1.6.6-2.3 2-2.3.8 0 1.4.2 2.1.4.1 0 .3 0 .3-.1.1-.1.1-.2.1-.3v-3.4c0-.2-.1-.3-.3-.4-.8-.3-1.9-.5-3.2-.5-3.6 0-5.5 2-5.5 5.9v.8h-1.9c-.2 0-.4.2-.4.4v3.4c0 .2.2.4.4.4h1.9v12.5c0 .2.2.4.4.4h4c.2 0 .4-.2.4-.4V21h3.8l5.8 12.4c-.7 1.5-1.3 1.8-2.2 1.8-.7 0-1.5-.2-2.2-.6-.1 0-.2-.1-.3 0-.1 0-.2.1-.3.2l-1.4 3c-.1.2 0 .4.2.5 1.4.7 2.6 1 4.2 1 2.9 0 4.5-1.3 5.9-5l6.9-18c0-.1 0-.3-.1-.4-.1-.1-.2-.1-.3-.1h-4.2c-.2 0-.3.1-.4.3l-4.2 12-4.6-12c-.1-.2-.2-.3-.4-.3h-6.7z" fill="currentColor" style={{ color: "var(--ld-white-80)" }}/>
              </svg>
            </a>
            {/* Google */}
            <a
              href="https://google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <svg className="h-6 md:h-7" viewBox="0 0 272 92" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335"/>
                <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05"/>
                <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4"/>
                <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853"/>
                <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335"/>
                <path d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z" fill="#4285F4"/>
              </svg>
            </a>
            {/* NVIDIA */}
            <a
              href="https://nvidia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <svg className="h-6 md:h-7" viewBox="0 0 351 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M150.5 13.1V67h-12.8V31.5l-17 35.5h-8.9l-17-35.5V67H82V13.1h16.8l17.5 36.2 17.4-36.2h16.8zM216.6 13.1L191 67h-13.5l25.6-53.9h13.5zM234.6 13.1h26.8c17.3 0 27.7 10.7 27.7 26.9 0 16.3-10.4 27-27.7 27h-26.8V13.1zm13.2 42.8h12.3c9.7 0 15.2-5.8 15.2-15.9 0-9.9-5.5-15.8-15.2-15.8h-12.3v31.7zM312.5 13.1V67h-13.1V13.1h13.1zM351 67h-14l-4.5-11.6h-22l-4.4 11.6h-13.8l22.2-53.9h14.4L351 67zm-22.1-22l-7.4-19.6-7.5 19.6h14.9z" fill="#76B900"/>
                <path d="M57.8 25.4c-1.1.1-2.1.2-3.2.4v-3.9c1.2-.2 2.4-.3 3.6-.4 12.9-1 23.9 5 29.3 15.2V18.3c-7.4-7.9-18.2-11.9-29.7-10.8-3.6.4-7 1.2-10.2 2.4v16.4c3.1-1.4 6.5-2.1 10.2-2.4v1.5zm0 8.7v-.9c-3.6.3-6.9 1-9.8 2.3v28.8c2.9 1.5 6.2 2.4 9.8 2.7v-.9c-5.2-.4-9.3-4.7-9.3-10 0-5.5 4.1-9.8 9.3-10.2v-.8c-6.5.5-11.7 5.8-11.7 12.4 0 6.5 5.2 11.8 11.7 12.3v1c-7.8-.5-14-7-14-14.9 0-7.7 6.2-14.2 14-14.8zm-10.2-7.8v-4.2c-7.1 3-12.7 8.5-15.8 15.3v18.8c3.1 6.8 8.7 12.3 15.8 15.3V53.6c-.2 0-.3.1-.5.1-2.9 0-5.3-2.4-5.3-5.3 0-2.9 2.4-5.3 5.3-5.3.2 0 .3 0 .5.1v-2.5c-.2 0-.3 0-.5 0-4.3 0-7.8 3.5-7.8 7.8s3.5 7.8 7.8 7.8c.2 0 .3 0 .5 0v8.9c-9.5-4.7-16-14.4-16-25.7 0-11.2 6.5-20.9 16-25.6v11.9zm38.2-3.4c-4.3-2.1-9.1-3.3-14.2-3.5v3.9c4 .2 7.7 1.2 11 2.7V9.1C75.1 7.4 67 7.3 59.2 8.3c-1.9.3-3.7.6-5.4 1V0C43.1 2.8 34.4 10.8 30 21c-1.3 3-2.2 6.1-2.8 9.4v19.3c.6 3.3 1.5 6.4 2.8 9.4 4.4 10.2 13.1 18.2 23.8 21v-9.3c1.7.4 3.5.7 5.4 1 7.8 1 15.9.9 23.4-.8V22.9z" fill="#76B900"/>
              </svg>
            </a>
            {/* Lovable */}
            <a
              href="https://lovable.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <svg className="h-6 md:h-7" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 5c-2.8 0-5.4 1.1-7.3 3C6.8 6.1 4.2 5 1.4 5c-3.3 0-6 2.7-6 6 0 1.7.7 3.2 1.8 4.3L16 32l18.8-16.7c1.1-1.1 1.8-2.6 1.8-4.3 0-3.3-2.7-6-6-6-2.8 0-5.4 1.1-7.3 3-1.9-1.9-4.5-3-7.3-3z" fill="#FF6B6B"/>
                <text x="42" y="22" fontFamily="system-ui, sans-serif" fontSize="15" fontWeight="600" fill="currentColor" style={{ color: "var(--ld-white-80)" }}>Lovable</text>
              </svg>
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
