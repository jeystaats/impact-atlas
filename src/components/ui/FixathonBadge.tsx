"use client";

import { motion } from "framer-motion";

interface FixathonBadgeProps {
  variant?: "default" | "compact";
  className?: string;
}

export function FixathonBadge({
  variant = "default",
  className = "",
}: FixathonBadgeProps) {
  if (variant === "compact") {
    return (
      <a
        href="https://www.norrsken.org/fixathon"
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 text-xs text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors ${className}`}
      >
        Built at{" "}
        <span className="font-semibold text-[var(--foreground)]">
          Norrsken Fixathon
        </span>
      </a>
    );
  }

  return (
    <motion.a
      href="https://www.norrsken.org/fixathon"
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--background-tertiary)] border border-[var(--border)] hover:border-[var(--accent)] transition-all group ${className}`}
    >
      <span className="text-xs text-[var(--foreground-muted)] group-hover:text-[var(--foreground-secondary)] transition-colors">
        Built at
      </span>
      <span className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
        Norrsken Fixathon
      </span>
      <svg
        className="w-3.5 h-3.5 text-[var(--foreground-muted)] group-hover:text-[var(--accent)] transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </motion.a>
  );
}
