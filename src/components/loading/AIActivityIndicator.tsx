"use client";

import { motion } from "framer-motion";

interface AIActivityIndicatorProps {
  stage: "thinking" | "processing" | "streaming" | "complete";
  color?: string;
  text?: string;
}

export function AIActivityIndicator({
  stage,
  color = "var(--accent)",
  text,
}: AIActivityIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Neural network visualization */}
      <div className="relative w-10 h-10">
        {stage === "thinking" && (
          <div className="flex items-center justify-center gap-1 h-full">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
                animate={{
                  y: [0, -6, 0],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}

        {stage === "processing" && (
          <div className="relative w-full h-full">
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: `${color}30` }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{ borderTopColor: color }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full"
              style={{ backgroundColor: `${color}20` }}
              animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        )}

        {stage === "streaming" && (
          <svg viewBox="0 0 40 40" className="w-full h-full">
            {/* Data stream lines */}
            {[0, 1, 2, 3].map((i) => (
              <motion.line
                key={i}
                x1={5 + i * 10}
                y1={0}
                x2={5 + i * 10}
                y2={40}
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: [0, 0.3, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.15,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </svg>
        )}

        {stage === "complete" && (
          <motion.div
            className="w-full h-full rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
          >
            <motion.svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <motion.path
                d="M5 12l5 5L19 7"
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4 }}
              />
            </motion.svg>
          </motion.div>
        )}
      </div>

      {/* Text */}
      {text && (
        <motion.span
          key={text}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm text-[var(--foreground-secondary)]"
        >
          {text}
        </motion.span>
      )}
    </div>
  );
}
