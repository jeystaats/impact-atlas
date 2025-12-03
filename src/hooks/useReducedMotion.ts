"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect user's reduced motion preference
 *
 * Returns true if user prefers reduced motion (accessibility setting)
 * Use this to disable or simplify animations for users who have enabled
 * the "Reduce motion" setting in their OS preferences.
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 *
 * const variants = prefersReducedMotion
 *   ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
 *   : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
 * ```
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === "undefined") return;

    // Get initial preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Get animation variants that respect reduced motion preference
 *
 * @param normalVariants - The full animation variants
 * @param reducedVariants - Simplified variants for reduced motion (defaults to opacity only)
 * @param prefersReducedMotion - Whether user prefers reduced motion
 */
export function getMotionVariants<T extends Record<string, unknown>>(
  normalVariants: T,
  reducedVariants: Partial<T> | undefined,
  prefersReducedMotion: boolean
): T {
  if (!prefersReducedMotion) return normalVariants;

  // If reduced variants provided, merge with normal
  if (reducedVariants) {
    return { ...normalVariants, ...reducedVariants } as T;
  }

  // Default: strip out transform properties, keep opacity
  const simplified: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(normalVariants)) {
    if (typeof value === "object" && value !== null) {
      const { y, x, scale, rotate, ...rest } = value as Record<string, unknown>;
      simplified[key] = rest;
    } else {
      simplified[key] = value;
    }
  }
  return simplified as T;
}

/**
 * Get a simplified transition for reduced motion
 */
export function getReducedMotionTransition(
  normalTransition: Record<string, unknown>,
  prefersReducedMotion: boolean
): Record<string, unknown> {
  if (!prefersReducedMotion) return normalTransition;

  return {
    duration: 0.01,
    ease: "linear",
  };
}
