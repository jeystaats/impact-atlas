// Re-export all hooks for convenient importing
export { useSelectedCity } from "./useSelectedCity";
export { useMapStyle } from "./useMapStyle";
export { useTemperature } from "./useTemperature";
export {
  useReducedMotion,
  getMotionVariants,
  getReducedMotionTransition,
} from "./useReducedMotion";
export * from "./useConvex";
export {
  useAnalytics,
  useScrollDepthTracking,
  useVisibilityTracking,
  useTrackedClick,
} from "./useAnalytics";
