"use client";

import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
}

/**
 * Hook to register and handle keyboard shortcuts for navigation
 *
 * Default shortcuts:
 * - g h: Go to Home (landing page)
 * - g d: Go to Dashboard
 * - g p: Go to Plans
 * - g q: Go to Quick Wins
 * - g s: Go to Settings
 * - g a: Go to About
 * - g t: Go to Team
 * - ?: Show keyboard shortcuts help (when implemented)
 *
 * The "g" key acts as a leader key (like vim) - press g then another key
 */
export function useKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  // Navigation shortcuts using "g" as leader key
  const handleKeySequence = useCallback(
    (firstKey: string, secondKey: string) => {
      if (firstKey !== "g") return false;

      const routes: Record<string, string> = {
        h: "/", // Home
        d: "/dashboard", // Dashboard
        p: "/dashboard/plans", // Plans
        q: "/dashboard/quick-wins", // Quick Wins
        s: "/dashboard/settings", // Settings
        a: "/about", // About
        t: "/team", // Team
      };

      const route = routes[secondKey.toLowerCase()];
      if (route && route !== pathname) {
        router.push(route);
        return true;
      }
      return false;
    },
    [router, pathname]
  );

  useEffect(() => {
    let leaderKey: string | null = null;
    let leaderTimeout: NodeJS.Timeout | null = null;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      // If we have a leader key waiting, try to complete the sequence
      if (leaderKey) {
        const handled = handleKeySequence(leaderKey, key);
        leaderKey = null;
        if (leaderTimeout) {
          clearTimeout(leaderTimeout);
          leaderTimeout = null;
        }
        if (handled) {
          event.preventDefault();
        }
        return;
      }

      // Check for leader key "g"
      if (key === "g" && !event.ctrlKey && !event.altKey && !event.metaKey) {
        leaderKey = "g";
        // Reset leader key after 1 second if no follow-up
        leaderTimeout = setTimeout(() => {
          leaderKey = null;
        }, 1000);
        return;
      }

      // Single key shortcuts
      if (key === "/" && !event.ctrlKey && !event.altKey && !event.metaKey) {
        // Focus search if available (for future implementation)
        const searchInput = document.querySelector<HTMLInputElement>(
          '[data-search-input]'
        );
        if (searchInput) {
          event.preventDefault();
          searchInput.focus();
        }
        return;
      }

      // Escape to close modals or blur focus
      if (key === "escape") {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement !== document.body) {
          activeElement.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (leaderTimeout) {
        clearTimeout(leaderTimeout);
      }
    };
  }, [handleKeySequence]);
}

/**
 * Get list of available keyboard shortcuts for display
 */
export function getKeyboardShortcuts(): { keys: string; description: string }[] {
  return [
    { keys: "g h", description: "Go to Home" },
    { keys: "g d", description: "Go to Dashboard" },
    { keys: "g p", description: "Go to Plans" },
    { keys: "g q", description: "Go to Quick Wins" },
    { keys: "g s", description: "Go to Settings" },
    { keys: "g a", description: "Go to About" },
    { keys: "g t", description: "Go to Team" },
    { keys: "/", description: "Focus search" },
    { keys: "Esc", description: "Close / unfocus" },
  ];
}
