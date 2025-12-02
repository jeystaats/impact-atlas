"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface NewCityData {
  slug: string;
  name: string;
  country: string;
  coordinates: { lat: number; lng: number };
  population: number;
}

interface OnboardingState {
  isOnboarding: boolean;
  cityId: Id<"cities"> | null;
  cityName: string;
  country: string;
}

export function useCityOnboarding() {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isOnboarding: false,
    cityId: null,
    cityName: "",
    country: "",
  });

  // Convex mutations and actions
  const createCity = useMutation(api.cities.create);
  const generateCityData = useAction(api.aiDirector.generateCityData);

  // Subscribe to onboarding progress (reactive)
  const onboardingProgress = useQuery(
    api.cityOnboarding.getByCity,
    onboardingState.cityId ? { cityId: onboardingState.cityId } : "skip"
  );

  // Start onboarding a new city
  const startOnboarding = useCallback(
    async (cityData: NewCityData) => {
      try {
        // Create the city first
        const cityId = await createCity({
          slug: cityData.slug,
          name: cityData.name,
          country: cityData.country,
          coordinates: cityData.coordinates,
          population: cityData.population || 500000, // Default population if unknown
        });

        // Update state to start showing modal
        setOnboardingState({
          isOnboarding: true,
          cityId,
          cityName: cityData.name,
          country: cityData.country,
        });

        // Trigger AI data generation (runs in background)
        generateCityData({
          cityId,
          cityName: cityData.name,
          country: cityData.country,
          coordinates: cityData.coordinates,
          population: cityData.population || 500000,
        }).catch((error) => {
          console.error("Error generating city data:", error);
        });

        return cityId;
      } catch (error) {
        console.error("Error creating city:", error);
        throw error;
      }
    },
    [createCity, generateCityData]
  );

  // Close the onboarding modal
  const closeOnboarding = useCallback(() => {
    setOnboardingState({
      isOnboarding: false,
      cityId: null,
      cityName: "",
      country: "",
    });
  }, []);

  // Format progress for the modal
  const formattedProgress = onboardingProgress
    ? {
        status: onboardingProgress.status,
        currentStage: onboardingProgress.currentStage,
        currentStageLabel: onboardingProgress.currentStageLabel,
        progress: onboardingProgress.progress,
        moduleProgress: onboardingProgress.moduleProgress,
        error: onboardingProgress.error,
      }
    : null;

  return {
    // State
    isOnboarding: onboardingState.isOnboarding,
    cityId: onboardingState.cityId,
    cityName: onboardingState.cityName,
    country: onboardingState.country,
    progress: formattedProgress,

    // Actions
    startOnboarding,
    closeOnboarding,

    // Computed
    isComplete: onboardingProgress?.status === "completed",
    isFailed: onboardingProgress?.status === "failed",
    canEnterEarly:
      (onboardingProgress?.moduleProgress.filter((m: { status: string }) => m.status === "completed")
        .length || 0) >= 2,
  };
}
