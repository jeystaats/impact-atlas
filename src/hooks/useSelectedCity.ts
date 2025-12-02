"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { usePreferencesStore, type City } from "@/stores/usePreferencesStore";

/**
 * Hook to manage the selected city
 * Uses Zustand preferences store for persistence
 * Falls back to Convex data for city details
 */
export function useSelectedCity() {
  const { defaultCity, setDefaultCity } = usePreferencesStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Try to get cities from Convex
  const cities = useQuery(api.cities.list, { activeOnly: true });

  // Hydrate on mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Determine the selected city slug from preferences store
  const selectedCitySlug = isHydrated ? defaultCity : "amsterdam";

  // Find the city object
  const selectedCity = cities?.find((c: { slug: string }) => c.slug === selectedCitySlug) ?? null;

  // Set city function - updates preferences store
  const setCity = useCallback((slug: string) => {
    setDefaultCity(slug as City);
  }, [setDefaultCity]);

  return {
    // The selected city slug (string)
    selectedCitySlug,
    // The full city document (or null if not loaded)
    selectedCity,
    // The city ID (or undefined if not loaded)
    selectedCityId: selectedCity?._id,
    // All available cities
    cities: cities ?? [],
    // Loading state
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
