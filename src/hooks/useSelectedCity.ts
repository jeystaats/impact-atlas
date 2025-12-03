"use client";

import { useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { usePreferencesStore, type City } from "@/stores/usePreferencesStore";
import { useHydration } from "./useHydration";

/**
 * Hook to manage the selected city
 * Uses Zustand preferences store for persistence
 * Falls back to Convex data for city details
 */
export function useSelectedCity() {
  const { defaultCity, setDefaultCity } = usePreferencesStore();
  const isHydrated = useHydration();

  // Try to get cities from Convex (include all, not just active, so newly created cities show up)
  const cities = useQuery(api.cities.list, {});

  // Determine the selected city slug from preferences store
  const selectedCitySlug = isHydrated ? defaultCity : "barcelona";

  // Find the city object - match by slug
  const selectedCity = cities?.find((c: { slug: string }) => c.slug === selectedCitySlug) ?? null;

  // Set city function - updates preferences store
  const setCity = useCallback((slug: string) => {
    setDefaultCity(slug as City);
  }, [setDefaultCity]);

  // If the selected city isn't found but we have cities, default to first available
  const effectiveCity = selectedCity ?? (cities && cities.length > 0 ? cities[0] : null);

  return {
    // The selected city slug (string)
    selectedCitySlug: effectiveCity?.slug ?? selectedCitySlug,
    // The full city document (or null if not loaded)
    selectedCity: effectiveCity,
    // The city ID (or undefined if not loaded)
    selectedCityId: effectiveCity?._id,
    // All available cities
    cities: cities ?? [],
    // Loading state - true if we're still waiting for Convex data
    isLoading: cities === undefined,
    // Hydration state
    isHydrated,
    // Function to change the selected city
    setCity,
  };
}

/**
 * Type for the selected city return value
 */
export type SelectedCityState = ReturnType<typeof useSelectedCity>;
