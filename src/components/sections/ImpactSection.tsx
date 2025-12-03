"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Module icons for the floating visualization
const moduleIcons = [
  { src: "/icons/modules/sun.png", alt: "Urban Heat", color: "--ld-heat", label: "Heat Islands" },
  { src: "/icons/modules/wind.png", alt: "Air Quality", color: "--ld-air", label: "Air Pollution" },
  { src: "/icons/modules/ocean.png", alt: "Coastal Plastic", color: "--ld-ocean", label: "Plastic Flows" },
  { src: "/icons/modules/boat.png", alt: "Port Emissions", color: "--ld-port", label: "Port Impact" },
  { src: "/icons/modules/leaf.png", alt: "Biodiversity", color: "--ld-bio", label: "Biodiversity" },
  { src: "/icons/modules/sprout.png", alt: "Restoration", color: "--ld-restore", label: "Restoration" },
];

// The transformation stages
const transformationStages = [
  {
    id: "chaos",
    title: "Scattered Data",
    description: "Siloed datasets. Conflicting priorities. Analysis paralysis.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    id: "unified",
    title: "Unified Intelligence",
    description: "All environmental data streams in one analysis engine.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    ),
  },
  {
    id: "ranked",
    title: "Ranked Priorities",
    description: "Your highest-impact opportunities, sorted by ROI and feasibility.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
      </svg>
    ),
  },
  {
    id: "action",
    title: "Clear Action",
    description: "Detailed playbooks with timelines, costs, and projected outcomes.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
];

// Floating particle component for the chaos visualization
function FloatingParticle({
  delay,
  duration,
  size,
  color,
  isOrdered,
  orderedPosition,
  prefersReducedMotion,
}: {
  delay: number;
  duration: number;
  size: number;
  color: string;
  isOrdered: boolean;
  orderedPosition: { x: number; y: number };
  prefersReducedMotion: boolean;
}) {
  const randomX = Math.random() * 100;
  const randomY = Math.random() * 100;

  // For reduced motion, show static particles
  if (prefersReducedMotion) {
    return (
      <div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: `var(${color})`,
          boxShadow: `0 0 ${size * 2}px var(${color})`,
          left: isOrdered ? `${orderedPosition.x}%` : `${randomX}%`,
          top: isOrdered ? `${orderedPosition.y}%` : `${randomY}%`,
          opacity: 0.6,
        }}
      />
    );
  }

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: `var(${color})`,
        boxShadow: `0 0 ${size * 2}px var(${color})`,
      }}
      initial={{
        left: `${randomX}%`,
        top: `${randomY}%`,
        opacity: 0,
        scale: 0,
      }}
      animate={isOrdered ? {
        left: `${orderedPosition.x}%`,
        top: `${orderedPosition.y}%`,
        opacity: 0.8,
        scale: 1,
      } : {
        left: [`${randomX}%`, `${(randomX + 30) % 100}%`, `${randomX}%`],
        top: [`${randomY}%`, `${(randomY + 20) % 100}%`, `${randomY}%`],
        opacity: [0, 0.6, 0],
        scale: [0.5, 1, 0.5],
      }}
      transition={isOrdered ? {
        duration: 1.2,
        delay: delay * 0.1,
        ease: [0.34, 1.56, 0.64, 1], // spring-like
      } : {
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Connection lines SVG component - connects to the module icon positions
function ConnectionLines({ showOrdered, prefersReducedMotion }: { showOrdered: boolean; prefersReducedMotion: boolean }) {
  // Create connections between module icons (forming a hexagonal network)
  const connections = [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
    { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 0 },
    // Cross connections through center
    { from: 0, to: 3 }, { from: 1, to: 4 }, { from: 2, to: 5 },
  ];

  // Use the same radius as the module icons when ordered (35)
  const orderedRadius = 35;

  // Calculate position for each icon index
  const getIconPosition = (index: number) => {
    const angle = (index / moduleIcons.length) * Math.PI * 2;
    return {
      x: 50 + Math.cos(angle) * orderedRadius,
      y: 50 + Math.sin(angle) * orderedRadius,
    };
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      {connections.map((conn, i) => {
        const fromPos = getIconPosition(conn.from);
        const toPos = getIconPosition(conn.to);

        return (
          <motion.line
            key={i}
            x1={`${fromPos.x}%`}
            y1={`${fromPos.y}%`}
            x2={`${toPos.x}%`}
            y2={`${toPos.y}%`}
            stroke="var(--ld-teal)"
            strokeWidth={1.5}
            strokeLinecap="round"
            initial={{ opacity: 0, pathLength: prefersReducedMotion ? 1 : 0 }}
            animate={showOrdered ? {
              opacity: 0.5,
              pathLength: 1,
            } : {
              opacity: 0,
              pathLength: prefersReducedMotion ? 1 : 0,
            }}
            transition={prefersReducedMotion ? { duration: 0.01 } : {
              duration: 0.6,
              delay: showOrdered ? 0.5 + i * 0.06 : 0,
              ease: "easeOut",
            }}
          />
        );
      })}
    </svg>
  );
}

// The main visualization showing transformation
function TransformationVisualization({ isInView, showOrdered, prefersReducedMotion }: { isInView: boolean; showOrdered: boolean; prefersReducedMotion: boolean }) {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    delay: i * 0.2,
    duration: 4 + Math.random() * 3,
    size: 4 + Math.random() * 6,
    color: moduleIcons[i % moduleIcons.length].color,
    orderedPosition: {
      x: 20 + (i % 6) * 12,
      y: 30 + Math.floor(i / 6) * 15,
    },
  }));

  return (
    <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-2xl" style={{ background: "var(--ld-navy-mid)" }}>
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: "radial-gradient(circle at 50% 50%, var(--ld-teal-glow), transparent 70%)",
        }}
      />

      {/* Floating particles */}
      {isInView && particles.map((p, i) => (
        <FloatingParticle key={i} {...p} isOrdered={showOrdered} prefersReducedMotion={prefersReducedMotion} />
      ))}

      {/* Connection lines between icons when ordered */}
      {isInView && <ConnectionLines showOrdered={showOrdered} prefersReducedMotion={prefersReducedMotion} />}

      {/* Center icon showing state */}
      <AnimatePresence mode="wait">
        <motion.div
          key={showOrdered ? "ordered" : "chaos"}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.8 }}
          transition={prefersReducedMotion ? { duration: 0.01 } : { duration: 0.5 }}
        >
          {showOrdered ? (
            <div className="flex flex-col items-center gap-2">
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "var(--ld-teal-subtle)",
                  border: "1px solid var(--ld-teal)",
                  boxShadow: "0 0 20px var(--ld-teal-glow)",
                }}
                animate={prefersReducedMotion ? {} : {
                  boxShadow: ["0 0 20px var(--ld-teal-glow)", "0 0 40px var(--ld-teal-glow)", "0 0 20px var(--ld-teal-glow)"],
                }}
                transition={prefersReducedMotion ? {} : { duration: 2, repeat: Infinity }}
              >
                <svg className="w-7 h-7" style={{ color: "var(--ld-teal)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              <span className="text-xs font-medium" style={{ color: "var(--ld-teal)" }}>Priorities Ranked</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "var(--ld-white-5)",
                  border: "1px solid var(--ld-white-10)",
                }}
                animate={prefersReducedMotion ? {} : { rotate: [0, 5, -5, 0] }}
                transition={prefersReducedMotion ? {} : { duration: 2, repeat: Infinity }}
              >
                <svg className="w-7 h-7" style={{ color: "var(--ld-white-50)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </motion.div>
              <span className="text-xs font-medium" style={{ color: "var(--ld-white-50)" }}>Analyzing Data...</span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Module icons floating around the edges */}
      {isInView && moduleIcons.map((icon, i) => {
        const angle = (i / moduleIcons.length) * Math.PI * 2;
        const radius = showOrdered ? 35 : 40;
        const x = 50 + Math.cos(angle) * radius;
        const y = 50 + Math.sin(angle) * radius;

        return (
          <motion.div
            key={icon.alt}
            className="absolute w-10 h-10 md:w-12 md:h-12"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0 }}
            animate={prefersReducedMotion ? {
              opacity: 1,
              scale: 1,
            } : showOrdered ? {
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
            } : {
              opacity: [0.4, 0.8, 0.4],
              scale: [0.8, 1, 0.8],
              x: [0, Math.random() * 20 - 10, 0],
              y: [0, Math.random() * 20 - 10, 0],
            }}
            transition={prefersReducedMotion ? { duration: 0.01 } : showOrdered ? {
              duration: 0.8,
              delay: i * 0.1,
              ease: [0.34, 1.56, 0.64, 1],
            } : {
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Image
              src={icon.src}
              alt={icon.alt}
              fill
              className="object-contain drop-shadow-lg"
            />
          </motion.div>
        );
      })}
    </div>
  );
}

// Progress indicator for the transformation
function TransformationProgress({ currentStage, onStageClick, prefersReducedMotion }: { currentStage: number; onStageClick: (stage: number) => void; prefersReducedMotion: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
      {transformationStages.map((stage, i) => (
        <button
          key={stage.id}
          onClick={() => onStageClick(i)}
          className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full transition-all duration-300 cursor-pointer"
          style={{
            background: currentStage >= i ? "var(--ld-teal-subtle)" : "var(--ld-white-5)",
            border: `1px solid ${currentStage >= i ? "var(--ld-teal)" : "var(--ld-white-10)"}`,
          }}
        >
          <motion.div
            style={{ color: currentStage >= i ? "var(--ld-teal)" : "var(--ld-white-50)" }}
            animate={!prefersReducedMotion && currentStage === i ? { scale: [1, 1.1, 1] } : {}}
            transition={prefersReducedMotion ? {} : { duration: 0.5, repeat: currentStage === i ? Infinity : 0, repeatDelay: 1 }}
          >
            {stage.icon}
          </motion.div>
          <span
            className="text-xs md:text-sm font-medium hidden sm:inline"
            style={{ color: currentStage >= i ? "var(--ld-teal)" : "var(--ld-white-50)" }}
          >
            {stage.title}
          </span>
        </button>
      ))}
    </div>
  );
}

// The value pillars component
function ValuePillars({ isInView, prefersReducedMotion }: { isInView: boolean; prefersReducedMotion: boolean }) {
  const pillars = [
    {
      title: "Clarity",
      description: "See your city's environmental challenges unified in one view",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: "Prioritization",
      description: "Know which actions deliver the highest impact for your budget",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21l3.75-3.75" />
        </svg>
      ),
    },
    {
      title: "Action",
      description: "Get implementation-ready playbooks with timelines and costs",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4 mt-10">
      {pillars.map((pillar, i) => (
        <motion.div
          key={pillar.title}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={prefersReducedMotion ? { duration: 0.01 } : { duration: 0.6, delay: 0.8 + i * 0.15 }}
          className="group"
        >
          <div className="ld-card p-5 md:p-6 h-full text-center relative overflow-hidden transition-all duration-300 hover:border-[var(--ld-teal)]">
            {/* Hover glow effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: "radial-gradient(circle at 50% 0%, var(--ld-teal-glow), transparent 70%)",
              }}
            />

            <motion.div
              className="relative w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
              style={{
                background: "var(--ld-teal-subtle)",
                color: "var(--ld-teal)",
              }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 5 }}
              transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 300 }}
            >
              {pillar.icon}
            </motion.div>

            <h3 className="ld-heading mb-2 relative">{pillar.title}</h3>
            <p className="ld-body-sm relative">{pillar.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Trust signals component
function TrustSignals({ isInView, prefersReducedMotion }: { isInView: boolean; prefersReducedMotion: boolean }) {
  const signals = [
    { label: "Satellite Data", source: "Copernicus, Landsat" },
    { label: "Climate Models", source: "IPCC, NOAA" },
    { label: "Urban Sensors", source: "City IoT Networks" },
    { label: "Research", source: "Peer-Reviewed Studies" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={prefersReducedMotion ? { duration: 0.01 } : { duration: 0.6, delay: 1.2 }}
      className="mt-10 text-center"
    >
      <p className="ld-body-sm mb-4">Built on trusted data foundations</p>
      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {signals.map((signal, i) => (
          <motion.div
            key={signal.label}
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={prefersReducedMotion ? { duration: 0.01 } : { duration: 0.4, delay: 1.3 + i * 0.1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: "var(--ld-white-5)",
              border: "1px solid var(--ld-white-10)",
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--ld-teal)" }}
            />
            <span className="text-xs md:text-sm" style={{ color: "var(--ld-white-70)" }}>
              {signal.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function ImpactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [currentStage, setCurrentStage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  // Simplified transition for reduced motion
  const getTransition = (delay: number) =>
    prefersReducedMotion
      ? { duration: 0.01 }
      : { duration: 0.6, delay };

  // Auto-advance through stages - skip for reduced motion
  useEffect(() => {
    if (!isInView || !isAutoPlaying || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % transformationStages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isInView, isAutoPlaying, prefersReducedMotion]);

  const handleStageClick = (stage: number) => {
    setCurrentStage(stage);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 100]);

  return (
    <section
      id="impact"
      ref={sectionRef}
      className="ld-section relative overflow-hidden"
      style={{ background: "var(--ld-navy-deep)" }}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          y: backgroundY,
          background: "radial-gradient(ellipse at 50% 0%, var(--ld-teal-glow), transparent 50%)",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(var(--ld-white-30) 1px, transparent 1px),
                           linear-gradient(90deg, var(--ld-white-30) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="ld-section-content relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={getTransition(0.2)}
            className="ld-caption mb-3"
          >
            The Transformation
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={getTransition(0.3)}
            className="ld-display-lg mb-3"
          >
            From data chaos to{" "}
            <span className="ld-gradient-text">clear action.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={getTransition(0.5)}
            className="ld-body max-w-2xl mx-auto"
          >
            Watch how Impact Atlas transforms scattered environmental data
            into prioritized, actionable climate strategies.
          </motion.p>
        </div>

        {/* Transformation Visualization */}
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={getTransition(0.6)}
          className="mb-6"
        >
          <TransformationVisualization
            isInView={isInView}
            showOrdered={currentStage >= 2}
            prefersReducedMotion={prefersReducedMotion}
          />
        </motion.div>

        {/* Stage Progress */}
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={getTransition(0.7)}
          className="mb-4"
        >
          <TransformationProgress
            currentStage={currentStage}
            onStageClick={handleStageClick}
            prefersReducedMotion={prefersReducedMotion}
          />
        </motion.div>

        {/* Current Stage Description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }}
            transition={prefersReducedMotion ? { duration: 0.01 } : { duration: 0.3 }}
            className="text-center max-w-lg mx-auto"
          >
            <p className="ld-body-sm" style={{ color: "var(--ld-white-70)" }}>
              {transformationStages[currentStage].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Value Pillars */}
        <ValuePillars isInView={isInView} prefersReducedMotion={prefersReducedMotion} />

        {/* Trust Signals */}
        <TrustSignals isInView={isInView} prefersReducedMotion={prefersReducedMotion} />
      </div>
    </section>
  );
}
