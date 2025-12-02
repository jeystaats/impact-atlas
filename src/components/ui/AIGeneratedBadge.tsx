"use client";

import { motion } from "framer-motion";
import { Icon } from "./icons";
import { cn } from "@/lib/utils";

interface AIGeneratedBadgeProps {
  className?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function AIGeneratedBadge({
  className,
  size = "sm",
  showLabel = true,
}: AIGeneratedBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full",
        "bg-gradient-to-r from-purple-500/10 to-blue-500/10",
        "border border-purple-500/20",
        size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1",
        className
      )}
    >
      <Icon
        name="sparkles"
        className={cn(
          "text-purple-500",
          size === "sm" ? "w-3 h-3" : "w-4 h-4"
        )}
      />
      {showLabel && (
        <span
          className={cn(
            "font-medium text-purple-600",
            size === "sm" ? "text-[10px]" : "text-xs"
          )}
        >
          AI
        </span>
      )}
    </motion.div>
  );
}

// Utility to check if an item is AI-generated
export function isAIGenerated(tags?: string[]): boolean {
  return tags?.includes("ai-generated") ?? false;
}
