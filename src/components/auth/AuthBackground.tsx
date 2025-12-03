"use client";

import { useEffect, useRef, useState, useCallback, useSyncExternalStore, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  angle: number;
}

interface ConnectionLine {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;
}

interface StatItem {
  value: string;
  label: string;
  delay: number;
}

const stats: StatItem[] = [
  { value: "450+", label: "Cities Connected", delay: 0 },
  { value: "2.3M", label: "Data Points", delay: 0.2 },
  { value: "12%", label: "Average Impact", delay: 0.4 },
];

// Reduced motion detection using useSyncExternalStore
function subscribeToReducedMotion(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false; // Default to animations enabled on server
}

// Generate initial particles
function generateInitialParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.3 + 0.1,
      angle: Math.random() * Math.PI * 2,
    });
  }
  return particles;
}

export default function AuthBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  // Use lazy initialization to avoid setState in useEffect
  const [particles, setParticles] = useState<Particle[]>(generateInitialParticles);
  // Use useSyncExternalStore for reduced motion preference
  const isReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const [activeStatIndex, setActiveStatIndex] = useState(0);

  // Mouse tracking for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Parallax transforms
  const globeX = useTransform(smoothMouseX, [-500, 500], [-15, 15]);
  const globeY = useTransform(smoothMouseY, [-500, 500], [-15, 15]);
  const particleFieldX = useTransform(smoothMouseX, [-500, 500], [10, -10]);
  const particleFieldY = useTransform(smoothMouseY, [-500, 500], [10, -10]);

  // Generate connection lines between nearby particles using useMemo
  const connections = useMemo(() => {
    const newConnections: ConnectionLine[] = [];
    let connectionId = 0;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 15 && connectionId < 30) {
          newConnections.push({
            id: connectionId++,
            x1: particles[i].x,
            y1: particles[i].y,
            x2: particles[j].x,
            y2: particles[j].y,
            opacity: (15 - distance) / 15 * 0.3,
          });
        }
      }
    }
    return newConnections;
  }, [particles]);

  // Animate particles
  useEffect(() => {
    if (isReducedMotion) return;

    const animate = () => {
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          x: (particle.x + Math.cos(particle.angle) * particle.speed + 100) % 100,
          y: (particle.y + Math.sin(particle.angle) * particle.speed + 100) % 100,
          angle: particle.angle + (Math.random() - 0.5) * 0.02,
        }))
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isReducedMotion]);

  // Cycle through stats
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % stats.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Mouse move handler
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      mouseX.set(e.clientX - rect.left - centerX);
      mouseY.set(e.clientY - rect.top - centerY);
    },
    [mouseX, mouseY]
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="auth-background relative w-full h-full overflow-hidden"
      style={{ background: "var(--ld-navy-deep)" }}
    >
      {/* Base gradient layer */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 40%, rgba(0, 206, 209, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 80% at 80% 60%, rgba(0, 163, 166, 0.06) 0%, transparent 50%),
            linear-gradient(180deg, var(--ld-navy-deep) 0%, var(--ld-navy-dark) 100%)
          `,
        }}
      />

      {/* Aurora effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={
          isReducedMotion
            ? {}
            : {
                background: [
                  "radial-gradient(ellipse 100% 50% at 30% 20%, rgba(0, 206, 209, 0.15) 0%, transparent 60%)",
                  "radial-gradient(ellipse 100% 50% at 50% 30%, rgba(0, 206, 209, 0.12) 0%, transparent 60%)",
                  "radial-gradient(ellipse 100% 50% at 70% 25%, rgba(0, 206, 209, 0.15) 0%, transparent 60%)",
                  "radial-gradient(ellipse 100% 50% at 30% 20%, rgba(0, 206, 209, 0.15) 0%, transparent 60%)",
                ],
              }
        }
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Particle field */}
      <motion.div
        className="absolute inset-0"
        style={{ x: particleFieldX, y: particleFieldY }}
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Connection lines */}
          {connections.map((line) => (
            <motion.line
              key={line.id}
              x1={`${line.x1}%`}
              y1={`${line.y1}%`}
              x2={`${line.x2}%`}
              y2={`${line.y2}%`}
              stroke="var(--ld-teal)"
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{ opacity: line.opacity }}
              transition={{ duration: 2, delay: line.id * 0.05 }}
            />
          ))}
          {/* Particles */}
          {particles.map((particle) => (
            <motion.circle
              key={particle.id}
              cx={`${particle.x}%`}
              cy={`${particle.y}%`}
              r={particle.size}
              fill="var(--ld-teal)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: particle.opacity, scale: 1 }}
              transition={{ duration: 1, delay: particle.id * 0.02 }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Animated globe */}
      <motion.div
        className="absolute left-[10%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] lg:w-[600px] lg:h-[600px]"
        style={{ x: globeX, y: globeY }}
      >
        <motion.div
          className="relative w-full h-full"
          animate={isReducedMotion ? {} : { rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        >
          {/* Globe outer ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "1px solid rgba(0, 206, 209, 0.2)",
              boxShadow: "0 0 60px rgba(0, 206, 209, 0.1), inset 0 0 60px rgba(0, 206, 209, 0.05)",
            }}
          />

          {/* Globe latitude lines */}
          {[20, 40, 60, 80].map((offset) => (
            <div
              key={offset}
              className="absolute rounded-full"
              style={{
                top: `${offset / 2}%`,
                left: `${offset / 2}%`,
                right: `${offset / 2}%`,
                bottom: `${offset / 2}%`,
                border: "1px solid rgba(0, 206, 209, 0.08)",
              }}
            />
          ))}

          {/* Globe meridian lines */}
          <div
            className="absolute inset-[10%] rounded-full"
            style={{
              border: "1px solid rgba(0, 206, 209, 0.12)",
              transform: "rotateY(60deg)",
            }}
          />
          <div
            className="absolute inset-[10%] rounded-full"
            style={{
              border: "1px solid rgba(0, 206, 209, 0.12)",
              transform: "rotateY(-60deg)",
            }}
          />
          <div
            className="absolute inset-[10%] rounded-full"
            style={{
              border: "1px solid rgba(0, 206, 209, 0.15)",
              transform: "rotateX(90deg)",
            }}
          />

          {/* Globe center glow */}
          <div
            className="absolute inset-[30%] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(0, 206, 209, 0.15) 0%, transparent 70%)",
            }}
          />

          {/* Orbiting data points */}
          {[0, 72, 144, 216, 288].map((rotation, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3"
              style={{
                top: "50%",
                left: "50%",
                transformOrigin: "0 0",
              }}
              animate={
                isReducedMotion
                  ? {}
                  : {
                      rotate: [rotation, rotation + 360],
                    }
              }
              transition={{
                duration: 20 + i * 5,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: "6px",
                  height: "6px",
                  background: i % 2 === 0 ? "var(--ld-teal)" : "var(--ld-teal-light)",
                  transform: `translateX(${120 + i * 30}px) translateY(-50%)`,
                  boxShadow: "0 0 10px var(--ld-teal-glow)",
                }}
                animate={isReducedMotion ? {} : { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2 + i * 0.5, repeat: Infinity }}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Floating stats */}
      <div className="absolute left-[8%] bottom-[15%] space-y-6 z-10">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: activeStatIndex === index ? 1 : 0.3,
              x: 0,
              scale: activeStatIndex === index ? 1 : 0.95,
            }}
            transition={{ duration: 0.5, delay: stat.delay }}
            className="flex items-center gap-3"
          >
            <motion.div
              className="w-1.5 h-8 rounded-full"
              style={{ background: "var(--ld-teal)" }}
              animate={{
                height: activeStatIndex === index ? 32 : 16,
                opacity: activeStatIndex === index ? 1 : 0.4,
              }}
              transition={{ duration: 0.3 }}
            />
            <div>
              <motion.p
                className="text-2xl font-bold"
                style={{ color: "var(--ld-teal-light)" }}
              >
                {stat.value}
              </motion.p>
              <p
                className="text-sm"
                style={{ color: "var(--ld-white-50)" }}
              >
                {stat.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(var(--ld-teal) 1px, transparent 1px),
            linear-gradient(90deg, var(--ld-teal) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: "linear-gradient(to top, var(--ld-navy-deep), transparent)",
        }}
      />
    </div>
  );
}
