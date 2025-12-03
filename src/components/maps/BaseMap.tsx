"use client";

/**
 * BaseMap Component
 *
 * A reusable foundation for all map visualizations in Impact Atlas.
 * Provides:
 * - Mapbox initialization with token handling
 * - Navigation controls
 * - Style management (dark/light/satellite)
 * - Auto-fit bounds to markers
 * - Common props interface
 *
 * Usage:
 * ```tsx
 * <BaseMap center={{ lat: 41.38, lng: 2.17 }} zoom={12}>
 *   <Marker lat={41.38} lng={2.17}>
 *     <MarkerContent />
 *   </Marker>
 *   <Source id="heatmap" type="geojson" data={heatmapData}>
 *     <Layer {...heatmapLayerStyle} />
 *   </Source>
 * </BaseMap>
 * ```
 */

import {
  ReactNode,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import Map, {
  NavigationControl,
  MapRef,
  ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import type { Map as MapboxMap, MapMouseEvent, MapboxEvent } from "mapbox-gl";
import { motion } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapStyle } from "@/hooks/useMapStyle";

// =============================================================================
// TYPES
// =============================================================================

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface BaseMapProps {
  /** Map center coordinates */
  center?: Coordinates;
  /** Initial zoom level (0-22) */
  zoom?: number;
  /** Min/max zoom constraints */
  minZoom?: number;
  maxZoom?: number;
  /** Map height in pixels or CSS value */
  height?: number | string;
  /** Additional CSS classes */
  className?: string;
  /** Show navigation controls */
  showNavigation?: boolean;
  /** Position of navigation controls */
  navigationPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /** Enable interactive features */
  interactive?: boolean;
  /** Enable scroll zoom */
  scrollZoom?: boolean;
  /** Enable drag pan */
  dragPan?: boolean;
  /** Enable cooperative gestures (mobile-friendly) */
  cooperativeGestures?: boolean;
  /** Custom map padding */
  padding?: { top: number; right: number; bottom: number; left: number };
  /** Child components (Markers, Layers, Sources, etc.) */
  children?: ReactNode;
  /** Called when map loads */
  onLoad?: (map: MapboxMap) => void;
  /** Called when map moves */
  onMove?: (event: ViewStateChangeEvent) => void;
  /** Called when map click */
  onClick?: (event: MapMouseEvent) => void;
  /** Points to auto-fit bounds to */
  fitBoundsPoints?: Coordinates[];
  /** Padding for fit bounds */
  fitBoundsPadding?: number;
}

export interface BaseMapRef {
  /** Get the underlying Mapbox map instance */
  getMap: () => MapboxMap | null;
  /** Fly to a specific location */
  flyTo: (center: Coordinates, zoom?: number) => void;
  /** Fit the map to show all provided points */
  fitBounds: (points: Coordinates[], padding?: number) => void;
  /** Reset to initial view */
  resetView: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_CENTER: Coordinates = { lat: 41.3851, lng: 2.1734 }; // Barcelona
const DEFAULT_ZOOM = 12;
const DEFAULT_FIT_BOUNDS_PADDING = 60;

// =============================================================================
// COMPONENT
// =============================================================================

export const BaseMap = forwardRef<BaseMapRef, BaseMapProps>(
  (
    {
      center = DEFAULT_CENTER,
      zoom = DEFAULT_ZOOM,
      minZoom = 2,
      maxZoom = 18,
      height = 500,
      className = "",
      showNavigation = true,
      navigationPosition = "top-right",
      interactive = true,
      scrollZoom = true,
      dragPan = true,
      cooperativeGestures = false,
      padding: _padding,
      children,
      onLoad,
      onMove,
      onClick,
      fitBoundsPoints,
      fitBoundsPadding = DEFAULT_FIT_BOUNDS_PADDING,
    },
    ref
  ) => {
    const mapRef = useRef<MapRef>(null);
    const { mapStyleUrl } = useMapStyle();
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    // Store initial view for reset
    const initialViewRef = useRef({ center, zoom });

    // Memoize view state
    const viewState = useMemo(
      () => ({
        longitude: center.lng,
        latitude: center.lat,
        zoom,
      }),
      [center.lat, center.lng, zoom]
    );

    // Expose map methods via ref
    useImperativeHandle(
      ref,
      () => ({
        getMap: () => mapRef.current?.getMap() ?? null,
        flyTo: (coords: Coordinates, targetZoom?: number) => {
          mapRef.current?.flyTo({
            center: [coords.lng, coords.lat],
            zoom: targetZoom ?? zoom,
            duration: 1500,
          });
        },
        fitBounds: (points: Coordinates[], boundsPadding?: number) => {
          if (points.length === 0) return;

          const bounds = calculateBounds(points);
          mapRef.current?.fitBounds(
            [
              [bounds.west, bounds.south],
              [bounds.east, bounds.north],
            ],
            {
              padding: boundsPadding ?? fitBoundsPadding,
              duration: 1000,
            }
          );
        },
        resetView: () => {
          const { center: initialCenter, zoom: initialZoom } = initialViewRef.current;
          mapRef.current?.flyTo({
            center: [initialCenter.lng, initialCenter.lat],
            zoom: initialZoom,
            duration: 1000,
          });
        },
      }),
      [zoom, fitBoundsPadding]
    );

    // Auto-fit bounds when points change
    useEffect(() => {
      if (fitBoundsPoints && fitBoundsPoints.length > 0 && mapRef.current) {
        const bounds = calculateBounds(fitBoundsPoints);
        mapRef.current.fitBounds(
          [
            [bounds.west, bounds.south],
            [bounds.east, bounds.north],
          ],
          {
            padding: fitBoundsPadding,
            duration: 1000,
          }
        );
      }
    }, [fitBoundsPoints, fitBoundsPadding]);

    // Handle map load
    const handleLoad = useCallback(
      (event: MapboxEvent) => {
        onLoad?.(event.target as MapboxMap);
      },
      [onLoad]
    );

    // Error state if no token
    if (!mapboxToken) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex items-center justify-center bg-[var(--background-tertiary)] rounded-xl border border-[var(--border)] ${className}`}
          style={{ height }}
        >
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-red-500 text-2xl">!</span>
            </div>
            <p className="text-[var(--foreground-secondary)] text-sm">
              Map configuration error
            </p>
            <p className="text-[var(--foreground-muted)] text-xs mt-1">
              Mapbox token not found
            </p>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`relative rounded-xl overflow-hidden ${className}`}
        style={{ height }}
      >
        <Map
          ref={mapRef}
          initialViewState={viewState}
          mapboxAccessToken={mapboxToken}
          mapStyle={mapStyleUrl}
          minZoom={minZoom}
          maxZoom={maxZoom}
          interactive={interactive}
          scrollZoom={scrollZoom}
          dragPan={dragPan}
          cooperativeGestures={cooperativeGestures}
          onLoad={handleLoad}
          onMove={onMove}
          onClick={onClick}
          attributionControl={false}
          style={{ width: "100%", height: "100%" }}
        >
          {/* Navigation Controls */}
          {showNavigation && (
            <NavigationControl
              position={navigationPosition}
              showCompass={true}
              showZoom={true}
            />
          )}

          {/* Render children (Markers, Layers, Sources, etc.) */}
          {children}
        </Map>
      </motion.div>
    );
  }
);

BaseMap.displayName = "BaseMap";

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate bounding box from an array of coordinates
 */
export function calculateBounds(points: Coordinates[]): BoundingBox {
  if (points.length === 0) {
    return { north: 0, south: 0, east: 0, west: 0 };
  }

  let north = -90;
  let south = 90;
  let east = -180;
  let west = 180;

  for (const point of points) {
    if (point.lat > north) north = point.lat;
    if (point.lat < south) south = point.lat;
    if (point.lng > east) east = point.lng;
    if (point.lng < west) west = point.lng;
  }

  // Add some padding to the bounds
  const latPadding = (north - south) * 0.1 || 0.01;
  const lngPadding = (east - west) * 0.1 || 0.01;

  return {
    north: north + latPadding,
    south: south - latPadding,
    east: east + lngPadding,
    west: west - lngPadding,
  };
}

/**
 * Check if a point is within a bounding box
 */
export function isPointInBounds(point: Coordinates, bounds: BoundingBox): boolean {
  return (
    point.lat >= bounds.south &&
    point.lat <= bounds.north &&
    point.lng >= bounds.west &&
    point.lng <= bounds.east
  );
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

// Re-export commonly used react-map-gl components for convenience
export {
  Source,
  Layer,
  Marker,
  Popup,
  NavigationControl,
  ScaleControl,
  GeolocateControl,
  FullscreenControl,
} from "react-map-gl/mapbox";

export type { MapRef, ViewStateChangeEvent };
