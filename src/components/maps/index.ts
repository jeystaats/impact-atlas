/**
 * Maps Module
 *
 * Provides reusable map components for Impact Atlas visualizations.
 *
 * @module maps
 */

// Base map component
export { BaseMap, calculateBounds, isPointInBounds } from "./BaseMap";
export type {
  BaseMapProps,
  BaseMapRef,
  Coordinates,
  BoundingBox,
} from "./BaseMap";

// Re-export react-map-gl components for convenience
export {
  Source,
  Layer,
  Marker,
  Popup,
  NavigationControl,
  ScaleControl,
  GeolocateControl,
  FullscreenControl,
} from "./BaseMap";

export type { MapRef, ViewStateChangeEvent } from "./BaseMap";
