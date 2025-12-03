"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { statusConfig } from "./constants";
import type { PlanStatus } from "./types";

interface StatusDropdownProps {
  status: PlanStatus;
  onStatusChange: (status: PlanStatus) => void;
}

export function StatusDropdown({ status, onStatusChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors"
        style={{
          backgroundColor: config.bgColor,
          color: config.color,
        }}
      >
        <StatusIcon className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">{config.label}</span>
        <ChevronRight
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute right-0 top-full mt-2 z-50 w-36 py-1 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] shadow-xl overflow-hidden"
            >
              {(Object.keys(statusConfig) as PlanStatus[]).map((s) => {
                const cfg = statusConfig[s];
                const IconComponent = cfg.icon;
                return (
                  <motion.button
                    key={s}
                    whileHover={{ backgroundColor: "var(--background-tertiary)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(s);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                      s === status ? "bg-[var(--background-tertiary)]" : ""
                    }`}
                  >
                    <IconComponent
                      className="w-3.5 h-3.5"
                      style={{ color: cfg.color }}
                    />
                    <span className="text-sm text-[var(--foreground)]">
                      {cfg.label}
                    </span>
                    {s === status && (
                      <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-[var(--accent)]" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
