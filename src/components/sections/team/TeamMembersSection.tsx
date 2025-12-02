"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const teamMembers = [
  {
    id: "ola",
    name: "Aleksandra (Ola) Adamska",
    role: "Sustainability Lead",
    bio: "Global Sustainability expert at Unilever. Bringing corporate sustainability experience to urban climate action.",
    expertise: ["Sustainability", "Corporate ESG", "Strategy"],
    imagePath: "/team/ola.jpeg",
    color: "--ld-teal",
    linkedin: "https://www.linkedin.com/in/aleksandra-adamska/",
    website: "",
  },
  {
    id: "jesper",
    name: "Jesper Lindvall",
    role: "Product Lead",
    bio: "Product Manager at EUIS. Translating complex environmental data into actionable solutions.",
    expertise: ["Product Management", "Data Products", "Strategy"],
    imagePath: "/team/jesper.jpeg",
    color: "--ld-bio",
    linkedin: "https://www.linkedin.com/in/jesperlindvall/",
    website: "",
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
  },
];

export default function TeamMembersSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  return (
    <section
      ref={sectionRef}
      className="ld-section relative"
      style={{ background: "var(--ld-navy-dark)", minHeight: "auto", paddingTop: "4rem", paddingBottom: "6rem" }}
    >
      <div className="ld-section-content relative z-10">
        {/* Team Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              onMouseEnter={() => setHoveredMember(member.id)}
              onMouseLeave={() => setHoveredMember(null)}
              className="group h-full"
            >
              {/* Card */}
              <div
                className="relative rounded-2xl overflow-hidden transition-all duration-500 h-full flex flex-col"
                style={{
                  background: "var(--ld-navy-deep)",
                  border: hoveredMember === member.id
                    ? `1px solid color-mix(in srgb, var(${member.color}) 50%, transparent)`
                    : "1px solid var(--ld-white-10)",
                  transform: hoveredMember === member.id ? "translateY(-8px)" : "none",
                  boxShadow: hoveredMember === member.id
                    ? `0 20px 40px rgba(0,0,0,0.4), 0 0 40px color-mix(in srgb, var(${member.color}) 10%, transparent)`
                    : "0 4px 20px rgba(0,0,0,0.2)",
                }}
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={member.imagePath}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(to top, var(--ld-navy-deep) 0%, transparent 50%)`,
                    }}
                  />

                  {/* Color accent on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 mix-blend-color"
                    style={{ background: `var(${member.color})` }}
                  />
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Role badge */}
                  <div
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                    style={{
                      background: `color-mix(in srgb, var(${member.color}) 15%, transparent)`,
                      color: `var(${member.color})`,
                    }}
                  >
                    {member.role}
                  </div>

                  {/* Name */}
                  <h3
                    className="text-xl font-semibold mb-2 transition-colors duration-300"
                    style={{ color: hoveredMember === member.id ? "var(--ld-white)" : "var(--ld-white-90)" }}
                  >
                    {member.name}
                  </h3>

                  {/* Bio */}
                  <p
                    className="text-sm mb-4 transition-colors duration-300"
                    style={{ color: hoveredMember === member.id ? "var(--ld-white-70)" : "var(--ld-white-50)" }}
                  >
                    {member.bio}
                  </p>

                  {/* Expertise tags */}
                  <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                    {member.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          background: "var(--ld-white-5)",
                          color: "var(--ld-white-50)",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Social links */}
                  <div className="flex gap-3">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                        style={{
                          background: "var(--ld-white-5)",
                          color: "var(--ld-white-50)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `color-mix(in srgb, var(${member.color}) 20%, transparent)`;
                          e.currentTarget.style.color = `var(${member.color})`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--ld-white-5)";
                          e.currentTarget.style.color = "var(--ld-white-50)";
                        }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    )}
                    {member.website && (
                      <a
                        href={member.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                        style={{
                          background: "var(--ld-white-5)",
                          color: "var(--ld-white-50)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `color-mix(in srgb, var(${member.color}) 20%, transparent)`;
                          e.currentTarget.style.color = `var(${member.color})`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--ld-white-5)";
                          e.currentTarget.style.color = "var(--ld-white-50)";
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Built at Fixathon badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div
            className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl"
            style={{
              background: "var(--ld-navy-deep)",
              border: "1px solid var(--ld-white-10)",
            }}
          >
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ background: "var(--ld-teal)" }}
            />
            <div className="text-left">
              <p className="text-sm font-medium" style={{ color: "var(--ld-white-90)" }}>
                Built at Norrsken Fixathon Barcelona
              </p>
              <p className="text-xs" style={{ color: "var(--ld-white-50)" }}>
                December 1-2, 2025 • World's Largest Fixathon
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
