/**
 * Shared Modal Animation Variants
 *
 * Provides consistent animation patterns across all modal components.
 * Uses Framer Motion variants for overlay and modal content.
 */

import type { Variants, Transition } from "framer-motion";

// =============================================================================
// TRANSITIONS
// =============================================================================

/** Standard spring transition for modal appearances */
export const MODAL_SPRING_TRANSITION: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
};

/** Quick exit transition for modal dismissals */
export const MODAL_EXIT_TRANSITION: Transition = {
  duration: 0.2,
};

// =============================================================================
// OVERLAY VARIANTS
// =============================================================================

/** Standard overlay fade animation */
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// =============================================================================
// MODAL CONTENT VARIANTS
// =============================================================================

/** Standard modal scale + fade animation */
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: MODAL_SPRING_TRANSITION,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: MODAL_EXIT_TRANSITION,
  },
};

/** Slide-up modal animation (for bottom sheets) */
export const slideUpModalVariants: Variants = {
  hidden: { opacity: 0, y: "100%" },
  visible: {
    opacity: 1,
    y: 0,
    transition: MODAL_SPRING_TRANSITION,
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: MODAL_EXIT_TRANSITION,
  },
};

/** Drawer animation (slides in from right) */
export const drawerVariants: Variants = {
  hidden: { opacity: 0, x: "100%" },
  visible: {
    opacity: 1,
    x: 0,
    transition: MODAL_SPRING_TRANSITION,
  },
  exit: {
    opacity: 0,
    x: "100%",
    transition: MODAL_EXIT_TRANSITION,
  },
};

// =============================================================================
// CONTENT ANIMATION VARIANTS
// =============================================================================

/** Staggered children animation for modal content */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/** Individual item animation for staggered lists */
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
};
