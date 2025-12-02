"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Icon, ModuleIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type ModuleStatus = "pending" | "loading" | "processing" | "completed" | "failed";

interface ModuleLoadingCardProps {
  moduleId: string;
  moduleName: string;
  color: string;
  status: ModuleStatus;
  hotspotsFound?: number;
  quickWinsFound?: number;
  estimatedTime?: string;
}

export function ModuleLoadingCard({
  moduleId,
  moduleName,
  color,
  status,
  hotspotsFound = 0,
  quickWinsFound = 0,
  estimatedTime,
}: ModuleLoadingCardProps) {
  const isActive = status === "loading" || status === "processing";
  const isDone = status === "completed";
  const isFailed = status === "failed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative p-3 rounded-xl border transition-all overflow-hidden",
        isDone && "bg-[var(--accent-bg)] border-[var(--accent)]",
        isActive && "border-[var(--accent-muted)]",
        isFailed && "bg-red-500/10 border-red-500/30",
        !isDone &&
          !isActive &&
          !isFailed &&
          "bg-[var(--background-secondary)] border-[var(--border)]"
      )}
    >
      {/* Active shimmer effect */}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Pulse glow when active */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            boxShadow: `0 0 20px ${color}30`,
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="relative flex flex-col items-center text-center gap-2">
        {/* Icon container */}
        <div className="relative">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
              isDone ? "bg-[var(--accent)]" : ""
            )}
            style={{
              backgroundColor: isDone ? undefined : `${color}20`,
            }}
          >
            <AnimatePresence mode="wait">
              {isDone ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15, stiffness: 300 }}
                >
                  <Icon name="check" className="w-5 h-5 text-white" />
                </motion.div>
              ) : isFailed ? (
                <Icon name="warning" className="w-5 h-5 text-red-500" />
              ) : isActive ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                  <Icon name="loader" className="w-5 h-5" style={{ color }} />
                </motion.div>
              ) : (
                <ModuleIcon
                  moduleId={moduleId}
                  className="w-5 h-5"
                  style={{ color }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Mini progress ring when active */}
          {isActive && (
            <motion.div
              className="absolute -inset-1 rounded-xl border-2 border-dashed"
              style={{ borderColor: `${color}50` }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>

        {/* Module name */}
        <p
          className={cn(
            "text-xs font-medium truncate w-full",
            isDone ? "text-[var(--accent-dark)]" : "text-[var(--foreground)]"
          )}
        >
          {moduleName}
        </p>

        {/* Status text */}
        <AnimatePresence mode="wait">
          {isDone && hotspotsFound > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-[10px] text-[var(--foreground-muted)]"
            >
              <span>{hotspotsFound} hotspots</span>
              {quickWinsFound > 0 && (
                <>
                  <span>-</span>
                  <span>{quickWinsFound} wins</span>
                </>
              )}
            </motion.div>
          ) : isActive && estimatedTime ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-[var(--foreground-muted)]"
            >
              ~{estimatedTime}
            </motion.span>
          ) : isFailed ? (
            <span className="text-[10px] text-red-400">Failed</span>
          ) : (
            <span className="text-[10px] text-[var(--foreground-muted)]">
              Waiting...
            </span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
