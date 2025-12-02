"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image from "next/image";

// Team data
const teamMembers = [
  {
    id: "ola",
    name: "Aleksandra (Ola) Adamska",
    role: "Sustainability Lead",
    bio: "Global Sustainability expert at Unilever. Bringing corporate sustainability experience to urban climate action.",
    expertise: ["Sustainability", "Corporate ESG", "Strategy"],
    imagePath: "/team/ola.png",
    color: "--ld-teal",
    linkedin: "https://www.linkedin.com/in/aleksandra-adamska/",
    facePosition: "center 20%", // Adjust to center face
  },
  {
    id: "jesper",
    name: "Jesper Lindvall",
    role: "Product Lead",
    bio: "Product Manager at EUIS. Translating complex environmental data into actionable solutions.",
    expertise: ["Product Management", "Data Products", "Strategy"],
    imagePath: "/team/jesper.png",
    color: "--ld-bio",
    linkedin: "https://www.linkedin.com/in/jesperlindvall/",
    facePosition: "center 20%", // Adjust to center face
  },
  {
    id: "jasper",
    name: "Jasper Staats",
    role: "Tech Lead",
    bio: "Frontend engineer & UI systems expert. Specializing in React, Next.js, data visualization, and AI integration.",
    expertise: ["React/Next.js", "Design Systems", "Data Viz", "AI"],
    imagePath: "/team/jasper.png",
    color: "--ld-ocean",
    linkedin: "https://www.linkedin.com/in/jasperstaats/",
    website: "https://www.staats.dev/",
    facePosition: "center 20%", // Adjust to center face
  },
];

// Ripple animation component
interface Ripple {
  id: number;
  x: number;
  y: number;
  color: string;
}

function RippleEffect({ ripples, onComplete }: { ripples: Ripple[]; onComplete: (id: number) => void }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <div key={ripple.id} className="absolute" style={{ left: ripple.x, top: ripple.y }}>
            {/* Multiple concentric rings */}
            {[0, 1, 2, 3, 4].map((ringIndex) => (
              <motion.div
                key={ringIndex}
                className="absolute rounded-full"
                style={{
                  border: `2px solid var(${ripple.color})`,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
                initial={{
                  width: 0,
                  height: 0,
                  opacity: 0.8 - ringIndex * 0.1,
                }}
                animate={{
                  width: 600 + ringIndex * 150,
                  height: 600 + ringIndex * 150,
                  opacity: 0,
                }}
                transition={{
                  duration: 1.2 + ringIndex * 0.15,
                  delay: ringIndex * 0.08,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                onAnimationComplete={() => {
                  if (ringIndex === 4) onComplete(ripple.id);
                }}
              />
            ))}
            {/* Central flash */}
            <motion.div
              className="absolute rounded-full"
              style={{
                background: `radial-gradient(circle, var(${ripple.color}), transparent)`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
              initial={{ width: 20, height: 20, opacity: 0.9 }}
              animate={{ width: 100, height: 100, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// LinkedIn icon component
function LinkedInIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

// Website icon component
function WebsiteIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );
}

// Expertise tag positions for radial layout
const expertisePositions = [
  { angle: -60, distance: 140 },
  { angle: -20, distance: 150 },
  { angle: 20, distance: 150 },
  { angle: 60, distance: 140 },
];

// Custom hook for reduced motion preference
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Check on initial render (SSR-safe)
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

// Featured member component
function FeaturedMember({ member }: { member: typeof teamMembers[0] }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      key={member.id}
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        mass: 1,
      }}
    >
      {/* Glowing ring behind image */}
      <div className="relative">
        {/* Animated glow rings */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, transparent 60%, var(${member.color}) 100%)`,
            opacity: 0.15,
            filter: "blur(20px)",
          }}
          animate={!prefersReducedMotion ? {
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Static ring */}
        <div
          className="absolute -inset-3 rounded-full"
          style={{
            border: `2px solid color-mix(in srgb, var(${member.color}) 30%, transparent)`,
          }}
        />
        <div
          className="absolute -inset-6 rounded-full"
          style={{
            border: `1px solid color-mix(in srgb, var(${member.color}) 15%, transparent)`,
          }}
        />

        {/* Main image */}
        <motion.div
          className="relative w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden"
          style={{
            boxShadow: `0 0 60px color-mix(in srgb, var(${member.color}) 30%, transparent)`,
          }}
          whileHover={!prefersReducedMotion ? { scale: 1.02 } : {}}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Image
            src={member.imagePath}
            alt={member.name}
            fill
            className="object-cover"
            style={{ objectPosition: member.facePosition }}
            priority
          />
          {/* Color overlay on image */}
          <div
            className="absolute inset-0 opacity-10 mix-blend-color"
            style={{ background: `var(${member.color})` }}
          />
        </motion.div>

        {/* Expertise tags floating around image */}
        <div className="hidden lg:block">
          {member.expertise.map((skill, index) => {
            const pos = expertisePositions[index] || expertisePositions[0];
            const radians = (pos.angle * Math.PI) / 180;
            const x = Math.cos(radians) * pos.distance;
            const y = Math.sin(radians) * pos.distance;

            return (
              <motion.div
                key={skill}
                className="absolute px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
                style={{
                  left: "50%",
                  top: "50%",
                  background: `color-mix(in srgb, var(${member.color}) 15%, var(--ld-navy-deep))`,
                  border: `1px solid color-mix(in srgb, var(${member.color}) 30%, transparent)`,
                  color: `var(${member.color})`,
                }}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  x: x,
                  y: y - 30,
                  scale: 1,
                }}
                exit={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 15,
                  delay: 0.1 + index * 0.08,
                }}
              >
                {skill}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Name and role */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <h3
          className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2"
          style={{ color: "var(--ld-white)" }}
        >
          {member.name}
        </h3>
        <p
          className="text-lg md:text-xl font-medium mb-4"
          style={{ color: `var(${member.color})` }}
        >
          {member.role}
        </p>
      </motion.div>

      {/* Bio */}
      <motion.p
        className="text-center max-w-md text-sm md:text-base leading-relaxed mb-6"
        style={{ color: "var(--ld-white-70)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        {member.bio}
      </motion.p>

      {/* Mobile expertise tags */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 mb-6 lg:hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {member.expertise.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: `color-mix(in srgb, var(${member.color}) 15%, var(--ld-navy-deep))`,
              border: `1px solid color-mix(in srgb, var(${member.color}) 30%, transparent)`,
              color: `var(${member.color})`,
            }}
          >
            {skill}
          </span>
        ))}
      </motion.div>

      {/* Social links */}
      <motion.div
        className="flex gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        {member.linkedin && (
          <motion.a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-200"
            style={{
              background: `color-mix(in srgb, var(${member.color}) 10%, transparent)`,
              border: `1px solid color-mix(in srgb, var(${member.color}) 30%, transparent)`,
              color: `var(${member.color})`,
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <LinkedInIcon />
            <span className="text-sm font-medium">LinkedIn</span>
          </motion.a>
        )}
        {"website" in member && member.website && (
          <motion.a
            href={member.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-200"
            style={{
              background: "var(--ld-white-5)",
              border: "1px solid var(--ld-white-10)",
              color: "var(--ld-white-70)",
            }}
            whileHover={{
              scale: 1.05,
              y: -2,
              backgroundColor: `color-mix(in srgb, var(${member.color}) 10%, transparent)`,
              borderColor: `color-mix(in srgb, var(${member.color}) 30%, transparent)`,
              color: `var(${member.color})`,
            }}
            whileTap={{ scale: 0.98 }}
          >
            <WebsiteIcon />
            <span className="text-sm font-medium">Website</span>
          </motion.a>
        )}
      </motion.div>
    </motion.div>
  );
}

// Member selector badge
function MemberBadge({
  member,
  isActive,
  onClick,
  index,
}: {
  member: typeof teamMembers[0];
  isActive: boolean;
  onClick: (e: React.MouseEvent) => void;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center gap-4 p-3 md:p-4 rounded-2xl transition-all duration-300 w-full text-left group"
      style={{
        background: isActive
          ? `color-mix(in srgb, var(${member.color}) 15%, var(--ld-navy-deep))`
          : isHovered
          ? "var(--ld-white-5)"
          : "transparent",
        border: isActive
          ? `2px solid color-mix(in srgb, var(${member.color}) 50%, transparent)`
          : "2px solid transparent",
        boxShadow: isActive
          ? `0 0 30px color-mix(in srgb, var(${member.color}) 20%, transparent)`
          : "none",
      }}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: index * 0.1,
      }}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Image */}
      <div className="relative">
        <div
          className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden transition-all duration-300"
          style={{
            boxShadow: isActive
              ? `0 0 0 2px var(${member.color})`
              : "0 0 0 2px var(--ld-white-10)",
          }}
        >
          <Image
            src={member.imagePath}
            alt={member.name}
            fill
            className="object-cover"
            style={{ objectPosition: member.facePosition }}
          />
        </div>
        {/* Active indicator dot */}
        {isActive && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: `var(${member.color})` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-sm md:text-base truncate transition-colors duration-300"
          style={{
            color: isActive ? "var(--ld-white)" : "var(--ld-white-70)",
          }}
        >
          {member.name.split(" ").slice(0, 2).join(" ")}
        </p>
        <p
          className="text-xs md:text-sm truncate transition-colors duration-300"
          style={{
            color: isActive ? `var(${member.color})` : "var(--ld-white-50)",
          }}
        >
          {member.role}
        </p>
      </div>

      {/* Hover arrow */}
      <motion.div
        style={{ color: `var(${member.color})` }}
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: isHovered || isActive ? 1 : 0, x: isHovered || isActive ? 0 : -5 }}
        transition={{ duration: 0.2 }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.div>
    </motion.button>
  );
}

export default function TeamMembersSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [selectedMemberId, setSelectedMemberId] = useState(teamMembers[0].id);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const rippleIdRef = useRef(0);

  const selectedMember = teamMembers.find((m) => m.id === selectedMemberId) || teamMembers[0];

  const handleMemberSelect = useCallback(
    (memberId: string, event: React.MouseEvent) => {
      if (memberId === selectedMemberId || isAnimating) return;

      // Get click position relative to section
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Find member color
      const member = teamMembers.find((m) => m.id === memberId);
      if (!member) return;

      // Create ripple
      const newRipple: Ripple = {
        id: rippleIdRef.current++,
        x,
        y,
        color: member.color,
      };

      setRipples((prev) => [...prev, newRipple]);
      setIsAnimating(true);

      // Delay member change slightly for dramatic effect
      setTimeout(() => {
        setSelectedMemberId(memberId);
        setIsAnimating(false);
      }, 150);
    },
    [selectedMemberId, isAnimating]
  );

  const handleRippleComplete = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <section
      ref={sectionRef}
      className="ld-section relative overflow-hidden"
      style={{
        background: "var(--ld-navy-dark)",
        minHeight: "auto",
        paddingTop: "4rem",
        paddingBottom: "6rem",
      }}
    >
      {/* Background ambient effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{
            background: `radial-gradient(circle, var(${selectedMember.color}), transparent)`,
            left: "20%",
            top: "30%",
            filter: "blur(100px)",
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.02]"
          style={{
            background: `radial-gradient(circle, var(--ld-teal), transparent)`,
            right: "10%",
            bottom: "20%",
            filter: "blur(80px)",
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Ripple effects layer */}
      <RippleEffect ripples={ripples} onComplete={handleRippleComplete} />

      <div className="ld-section-content relative z-10">
        {/* Main content grid */}
        <motion.div
          className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-stretch"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Featured member - Left side */}
          <div className="w-full lg:w-3/5 flex items-center justify-center py-8">
            <AnimatePresence mode="wait">
              <FeaturedMember
                key={selectedMember.id}
                member={selectedMember}
              />
            </AnimatePresence>
          </div>

          {/* Selector badges - Right side */}
          <div className="w-full lg:w-2/5 flex flex-col justify-center">
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: "var(--ld-teal)" }}
              >
                Meet The Team
              </p>
              <h2
                className="text-2xl md:text-3xl font-bold"
                style={{ color: "var(--ld-white)" }}
              >
                Impact Makers
              </h2>
              <p
                className="mt-2 text-sm"
                style={{ color: "var(--ld-white-50)" }}
              >
                Select a team member to learn more about their role in driving climate action.
              </p>
            </motion.div>

            {/* Member list */}
            <div className="space-y-2">
              {teamMembers.map((member, index) => (
                <MemberBadge
                  key={member.id}
                  member={member}
                  isActive={member.id === selectedMemberId}
                  onClick={(e) => handleMemberSelect(member.id, e)}
                  index={index}
                />
              ))}
            </div>

            {/* Impact rings indicator */}
            <motion.div
              className="mt-8 flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="relative w-8 h-8">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: `1px solid var(--ld-teal)`,
                    }}
                    animate={{
                      scale: [1, 2, 2],
                      opacity: [0.4, 0.1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.6,
                      ease: "easeOut",
                    }}
                  />
                ))}
                <div
                  className="absolute inset-2 rounded-full"
                  style={{ background: "var(--ld-teal)" }}
                />
              </div>
              <p
                className="text-xs"
                style={{ color: "var(--ld-white-50)" }}
              >
                Click to create impact ripples
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Built at Fixathon badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <motion.div
            className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl"
            style={{
              background: "var(--ld-navy-deep)",
              border: "1px solid var(--ld-white-10)",
            }}
            whileHover={{
              borderColor: "var(--ld-teal)",
              boxShadow: "0 0 30px var(--ld-teal-glow)",
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-3 h-3 rounded-full"
              style={{ background: "var(--ld-teal)" }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="text-left">
              <p className="text-sm font-medium" style={{ color: "var(--ld-white-90)" }}>
                Built at Norrsken Fixathon Barcelona
              </p>
              <p className="text-xs" style={{ color: "var(--ld-white-50)" }}>
                December 1-2, 2025 - World&apos;s Largest Fixathon
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
