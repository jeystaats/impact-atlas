"use client";

import { useState, useEffect } from "react";
import { usePreferencesStore, type MapStyle } from "@/stores/usePreferencesStore";

// Mapbox style URLs
const MAPBOX_STYLES: Record<MapStyle, string> = {
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
};

/**
 * Hook to get the current Mapbox style URL based on user preferences
 */
export function useMapStyle() {
  const { mapStyle } = usePreferencesStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Default to dark during SSR/before hydration
  const currentStyle = isHydrated ? mapStyle : "dark";
  const mapStyleUrl = MAPBOX_STYLES[currentStyle];

  return {
    mapStyle: currentStyle,
    mapStyleUrl,
    isHydrated,
  };
}
