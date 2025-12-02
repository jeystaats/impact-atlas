"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Icon } from "@/components/ui/icons";

// Floating particle for background effect
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

// Desktop illustration component with animated elements
function DesktopIllustration() {
  return (
    <motion.div
      className="relative w-64 h-44 mx-auto mb-8"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    >
      {/* Monitor body */}
      <motion.div
        className="absolute inset-x-4 top-0 bottom-8 rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, var(--background-tertiary), var(--background-secondary))",
          border: "2px solid var(--border)",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1), 0 8px 16px -8px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Screen bezel */}
        <div className="absolute inset-2 rounded-lg overflow-hidden bg-[var(--foreground)]">
          {/* Screen content - animated dashboard preview */}
          <div className="relative w-full h-full p-2">
            {/* Top bar */}
            <motion.div
              className="flex items-center gap-1.5 mb-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            </motion.div>

            {/* Sidebar simulation */}
            <motion.div
              className="absolute left-2 top-6 bottom-2 w-8 rounded-md"
              style={{ background: "rgba(255, 255, 255, 0.05)" }}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-4 h-4 mx-auto mt-2 rounded"
                  style={{
                    background: i === 1 ? "var(--accent)" : "rgba(255, 255, 255, 0.1)",
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1, duration: 0.3 }}
                />
              ))}
            </motion.div>

            {/* Main content simulation */}
            <motion.div
              className="absolute left-12 right-2 top-6 bottom-2 rounded-md overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              {/* Stats cards */}
              <div className="flex gap-1 mb-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="flex-1 h-6 rounded"
                    style={{ background: "rgba(255, 255, 255, 0.08)" }}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + i * 0.1, duration: 0.3 }}
                  >
                    <motion.div
                      className="h-1.5 w-1/2 m-1 rounded"
                      style={{ background: "var(--accent-light)" }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 1.1 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Map simulation */}
              <motion.div
                className="absolute left-0 right-0 top-9 bottom-0 rounded"
                style={{
                  background: "linear-gradient(135deg, rgba(13, 148, 136, 0.2), rgba(20, 184, 166, 0.1))",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.4 }}
              >
                {/* Animated hotspots */}
                {[
                  { x: 20, y: 30 },
                  { x: 60, y: 50 },
                  { x: 40, y: 70 },
                ].map((pos, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      background: "var(--accent)",
                      boxShadow: "0 0 8px var(--accent)",
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      delay: 1.2 + i * 0.2,
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop",
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Monitor stand neck */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-6"
        style={{
          background: "linear-gradient(180deg, var(--border), var(--background-secondary))",
          borderRadius: "2px",
        }}
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
      />

      {/* Monitor stand base */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-3 rounded-full"
        style={{
          background: "linear-gradient(180deg, var(--background-secondary), var(--border))",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
      />

      {/* Floating sparkle effects */}
      {[
        { x: -10, y: 20, delay: 1.5 },
        { x: 85, y: 10, delay: 2 },
        { x: 90, y: 60, delay: 2.5 },
      ].map((spark, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${spark.x}%`, top: `${spark.y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            rotate: [0, 180],
          }}
          transition={{
            delay: spark.delay,
            duration: 3,
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          <Icon
            name="sparkles"
            className="w-4 h-4"
            style={{ color: "var(--accent)" }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

// Animated background with floating particles
function AnimatedBackground({ particles }: { particles: Particle[] }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, var(--accent-muted) 0%, transparent 70%)",
          top: "-100px",
          right: "-100px",
        }}
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 20, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, var(--accent-lighter) 0%, transparent 70%)",
          bottom: "-50px",
          left: "-50px",
        }}
        animate={{
          scale: [1, 1.15, 1],
          x: [0, -15, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            background: "var(--accent)",
            opacity: 0.15,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(particle.id) * 10, 0],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(var(--accent) 1px, transparent 1px),
            linear-gradient(90deg, var(--accent) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

// Feature pill component
function FeaturePill({
  icon,
  text,
  delay,
}: {
  icon: string;
  text: string;
  delay: number;
}) {
  return (
    <motion.div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
      style={{
        background: "var(--accent-bg)",
        border: "1px solid var(--accent-muted)",
        color: "var(--accent-dark)",
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Icon
        name={icon as "globe" | "chart" | "sparkles"}
        className="w-3.5 h-3.5"
      />
      <span>{text}</span>
    </motion.div>
  );
}

export function MobileBlocker() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch interaction
  const touchY = useMotionValue(0);
  const smoothTouchY = useSpring(touchY, { damping: 30, stiffness: 200 });

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Generate particles on mount
  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 2,
        duration: Math.random() * 4 + 4,
        delay: Math.random() * 2,
      });
    }
    setParticles(newParticles);
  }, []);

  // Check viewport width
  useEffect(() => {
    const checkMobile = () => {
      // Dashboard is desktop-only, so we block anything under lg breakpoint (1024px)
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    setIsVisible(true);

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Touch handlers for subtle parallax effect
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isReducedMotion) return;
      const touch = e.touches[0];
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const centerY = rect.height / 2;
        touchY.set((touch.clientY - rect.top - centerY) * 0.05);
      }
    },
    [touchY, isReducedMotion]
  );

  // Don't render anything until we've checked (prevents flash)
  if (isMobile === null) {
    return null;
  }

  // Don't render blocker on desktop
  if (!isMobile) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{
            background: "var(--background)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onTouchMove={handleTouchMove}
        >
          {/* Animated background */}
          <AnimatedBackground particles={particles} />

          {/* Content */}
          <motion.div
            className="relative z-10 text-center px-6 max-w-md"
            style={{ y: smoothTouchY }}
          >
            {/* Logo badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{
                background: "var(--background-tertiary)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-md)",
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent), var(--accent-light))",
                }}
              >
                <Icon name="globe" className="w-4 h-4 text-white" />
              </div>
              <span
                className="font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Impact Atlas
              </span>
            </motion.div>

            {/* Desktop illustration */}
            <DesktopIllustration />

            {/* Heading */}
            <motion.h1
              className="text-2xl sm:text-3xl font-bold mb-3"
              style={{ color: "var(--foreground)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              Best experienced on{" "}
              <span className="gradient-text">desktop</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-base mb-8 leading-relaxed"
              style={{ color: "var(--foreground-secondary)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              Our interactive dashboard features rich data visualizations and mapping
              tools that work best on larger screens.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              className="flex flex-wrap justify-center gap-2 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <FeaturePill icon="globe" text="Interactive Maps" delay={0.55} />
              <FeaturePill icon="chart" text="Data Analytics" delay={0.65} />
              <FeaturePill icon="sparkles" text="AI Insights" delay={0.75} />
            </motion.div>

            {/* Action prompt */}
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="flex items-center gap-3 px-5 py-3 rounded-xl"
                style={{
                  background: "var(--background-tertiary)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <motion.div
                  animate={
                    isReducedMotion
                      ? {}
                      : {
                          rotate: [0, 10, -10, 0],
                        }
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  <Icon
                    name="arrowRight"
                    className="w-5 h-5"
                    style={{ color: "var(--accent)" }}
                  />
                </motion.div>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Open on your laptop or desktop
                </span>
              </div>

              {/* URL display */}
              <motion.div
                className="flex items-center gap-2 text-xs"
                style={{ color: "var(--foreground-muted)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.4 }}
              >
                <Icon name="externalLink" className="w-3.5 h-3.5" />
                <span className="font-mono">impactatlas.app/dashboard</span>
              </motion.div>
            </motion.div>

            {/* Bottom decorative line */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-32"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--accent-muted), transparent)",
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
            />
          </motion.div>

          {/* Bottom wave decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="absolute bottom-0 w-full h-full"
              style={{ opacity: 0.05 }}
            >
              <motion.path
                d="M0,60 C300,100 600,20 900,60 C1050,80 1150,50 1200,60 L1200,120 L0,120 Z"
                fill="var(--accent)"
                initial={{ d: "M0,80 C300,80 600,80 900,80 C1050,80 1150,80 1200,80 L1200,120 L0,120 Z" }}
                animate={{
                  d: [
                    "M0,60 C300,100 600,20 900,60 C1050,80 1150,50 1200,60 L1200,120 L0,120 Z",
                    "M0,70 C300,30 600,90 900,50 C1050,70 1150,60 1200,70 L1200,120 L0,120 Z",
                    "M0,60 C300,100 600,20 900,60 C1050,80 1150,50 1200,60 L1200,120 L0,120 Z",
                  ],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
