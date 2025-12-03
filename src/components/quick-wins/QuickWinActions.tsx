"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Icon, IconName } from "@/components/ui/icons";
import type { NormalizedQuickWin, NormalizedModule } from "./types";

interface QuickWinActionsProps {
  win: NormalizedQuickWin;
  module: NormalizedModule | undefined;
}

export function QuickWinActions({ win, module }: QuickWinActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const actions = [
    {
      icon: "eye" as IconName,
      label: "View Details",
      onClick: () => {
        toast.info(win.title, {
          description: win.description,
          duration: 5000,
        });
        setIsOpen(false);
      },
    },
    {
      icon: "plus" as IconName,
      label: "Add to Plan",
      onClick: () => {
        toast.success("Added to Action Plan", {
          description: `"${win.title}" has been added to your action plan.`,
          action: {
            label: "View Plans",
            onClick: () => (window.location.href = "/dashboard/plans"),
          },
        });
        setIsOpen(false);
      },
    },
    {
      icon: "share" as IconName,
      label: "Share",
      onClick: async () => {
        const shareText = `Quick Win: ${win.title}\n\n${win.description}\n\nModule: ${module?.title || "Impact Atlas"}\nImpact: ${win.impact}\nEffort: ${win.effort}`;
        try {
          await navigator.clipboard.writeText(shareText);
          toast.success("Copied to clipboard", {
            description: "Quick win details copied for sharing",
          });
        } catch {
          toast.error("Failed to copy");
        }
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="flex-shrink-0 relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-lg bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors opacity-0 group-hover:opacity-100"
      >
        <Icon name="more" className="w-4 h-4" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 w-44 py-1 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] shadow-xl overflow-hidden"
          >
            {actions.map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ backgroundColor: "var(--background-tertiary)" }}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
              >
                <Icon name={action.icon} className="w-4 h-4" />
                {action.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
