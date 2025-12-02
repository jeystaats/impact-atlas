"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, LayoutDashboard, Search } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function NotFound() {
  return (
    <div className="landing-dark min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(var(--ld-white-10) 1px, transparent 1px),
            linear-gradient(90deg, var(--ld-white-10) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Gradient orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20"
        style={{ background: "var(--ld-teal)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10"
        style={{ background: "var(--ld-silver)" }}
      />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center px-6 max-w-2xl mx-auto"
      >
        {/* Floating 404 */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <motion.h1
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-[12rem] md:text-[16rem] font-bold leading-none select-none"
            style={{
              fontFamily: "var(--font-display)",
              background: "linear-gradient(135deg, var(--ld-silver) 0%, var(--ld-teal) 50%, var(--ld-silver) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 80px rgba(45, 212, 191, 0.3)",
            }}
          >
            404
          </motion.h1>
        </motion.div>

        {/* Headline */}
        <motion.h2
          variants={itemVariants}
          className="ld-display-md mb-4"
        >
          Page not found
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="ld-body-lg mb-8 max-w-md mx-auto"
          style={{ color: "var(--ld-white-60)" }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved to a new location.
        </motion.p>

        {/* Actions */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/" className="ld-btn-primary group">
            <Home className="w-4 h-4 mr-2 transition-transform group-hover:-translate-y-0.5" />
            Go Home
          </Link>
          <Link href="/dashboard" className="ld-btn-secondary group">
            <LayoutDashboard className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
            Go to Dashboard
          </Link>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          variants={itemVariants}
          className="mt-12 pt-8 border-t"
          style={{ borderColor: "var(--ld-white-10)" }}
        >
          <p
            className="text-sm mb-4 flex items-center justify-center gap-2"
            style={{ color: "var(--ld-white-40)" }}
          >
            <Search className="w-4 h-4" />
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Urban Heat", href: "/dashboard/modules/heat" },
              { label: "Air Quality", href: "/dashboard/modules/air" },
              { label: "Quick Wins", href: "/dashboard/quick-wins" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm rounded-full transition-all hover:scale-105"
                style={{
                  background: "var(--ld-white-05)",
                  color: "var(--ld-white-60)",
                  border: "1px solid var(--ld-white-10)",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
