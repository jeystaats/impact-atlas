"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const shortcuts = getKeyboardShortcuts();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }

    // Open with "?" key (shift + /)
    if (event.key === "?" && event.shiftKey) {
      event.preventDefault();
      setIsOpen(true);
      return;
    }

    // Close with Escape
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      setIsOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0.01 } : { duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.7)" }}
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }}
            transition={prefersReducedMotion ? { duration: 0.01 } : { duration: 0.2 }}
            className="w-full max-w-md rounded-2xl p-6"
            style={{
              background: "var(--ld-navy-dark)",
              border: "1px solid var(--ld-white-10)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--ld-white)" }}
              >
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg transition-colors"
                style={{ color: "var(--ld-white-50)" }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Shortcuts list */}
            <div className="space-y-3">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.keys}
                  className="flex items-center justify-between py-2"
                >
                  <span
                    className="text-sm"
                    style={{ color: "var(--ld-white-70)" }}
                  >
                    {shortcut.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.split(" ").map((key, i) => (
                      <span key={i}>
                        {i > 0 && (
                          <span
                            className="mx-1 text-xs"
                            style={{ color: "var(--ld-white-30)" }}
                          >
                            then
                          </span>
                        )}
                        <kbd
                          className="px-2 py-1 rounded text-xs font-mono"
                          style={{
                            background: "var(--ld-white-10)",
                            color: "var(--ld-white)",
                            border: "1px solid var(--ld-white-10)",
                          }}
                        >
                          {key}
                        </kbd>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div
              className="mt-6 pt-4 text-center text-xs"
              style={{
                borderTop: "1px solid var(--ld-white-10)",
                color: "var(--ld-white-30)",
              }}
            >
              Press <kbd className="px-1.5 py-0.5 rounded font-mono" style={{ background: "var(--ld-white-5)" }}>?</kbd> to toggle this menu
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
