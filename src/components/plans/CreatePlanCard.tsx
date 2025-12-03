"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { itemVariants } from "./constants";

interface CreatePlanCardProps {
  onClick: () => void;
}

export function CreatePlanCard({ onClick }: CreatePlanCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className="relative cursor-pointer"
    >
      <motion.div
        className="absolute -inset-px rounded-xl"
        animate={{
          background: isHovered
            ? "linear-gradient(135deg, var(--teal) 0%, var(--teal-light) 100%)"
            : "linear-gradient(135deg, var(--slate) 0%, var(--graphite) 100%)",
        }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        className="relative h-full min-h-[280px] p-6 rounded-xl border border-transparent flex flex-col items-center justify-center gap-4 text-center"
        style={{
          background: "var(--background-tertiary)",
        }}
        animate={{
          background: isHovered
            ? "linear-gradient(135deg, var(--graphite) 0%, var(--charcoal) 100%)"
            : "var(--background-tertiary)",
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          animate={{
            backgroundColor: isHovered
              ? "var(--teal-glow-strong)"
              : "var(--background-secondary)",
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 90 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Plus
            className="w-8 h-8 transition-colors duration-300"
            style={{
              color: isHovered ? "var(--accent)" : "var(--foreground-muted)",
            }}
          />
        </motion.div>

        <div>
          <motion.h3
            className="text-lg font-semibold mb-1"
            animate={{
              color: isHovered
                ? "var(--foreground)"
                : "var(--foreground-secondary)",
            }}
            transition={{ duration: 0.2 }}
          >
            Create New Plan
          </motion.h3>
          <motion.p
            className="text-sm"
            animate={{
              color: isHovered
                ? "var(--foreground-secondary)"
                : "var(--foreground-muted)",
            }}
            transition={{ duration: 0.2 }}
          >
            Combine quick wins into a strategic action plan
          </motion.p>
        </div>

        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          animate={{
            backgroundColor: isHovered
              ? "var(--accent)"
              : "var(--background-secondary)",
            color: isHovered ? "white" : "var(--foreground-secondary)",
          }}
          transition={{ duration: 0.2 }}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI-Assisted</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
