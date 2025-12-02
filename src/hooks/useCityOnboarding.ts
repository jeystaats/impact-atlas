"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useNotificationStore } from "@/stores/useNotificationStore";

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
  // Track if modal was closed while generating (show notifications instead)
  showNotifications: boolean;
}

// Module display names for notifications
const MODULE_NAMES: Record<string, string> = {
  "urban-heat": "Urban Heat",
  "coastal-plastic": "Coastal Plastic",
  "ocean-plastic": "Ocean Plastic",
  "port-emissions": "Port Emissions",
  biodiversity: "Biodiversity",
  restoration: "Restoration",
};

export function useCityOnboarding() {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isOnboarding: false,
    cityId: null,
    cityName: "",
    country: "",
    showNotifications: false,
  });

  // Notification store for background progress toasts
  const { addNotification, updateNotification, dismissToast } = useNotificationStore();
  const progressToastId = useRef<string | null>(null);
  const lastModuleStatus = useRef<Record<string, string>>({});

  // Convex mutations and actions
  const createCity = useMutation(api.cities.create);
  const generateCityData = useAction(api.aiDirector.generateCityData);

  // Subscribe to onboarding progress (reactive)
  const onboardingProgress = useQuery(
    api.cityOnboarding.getByCity,
    onboardingState.cityId ? { cityId: onboardingState.cityId } : "skip"
  );

  // Show notifications when modal is closed but still generating
  useEffect(() => {
    if (!onboardingState.showNotifications || !onboardingProgress) return;

    // Update or create progress toast
    if (onboardingProgress.status === "generating") {
      if (!progressToastId.current) {
        // Create initial progress toast
        progressToastId.current = addNotification({
          type: "progress",
          title: `Loading ${onboardingState.cityName}`,
          message: onboardingProgress.currentStageLabel || "Initializing...",
          progress: onboardingProgress.progress || 0,
          persistent: false,
          duration: 0, // Don't auto-dismiss
          meta: {
            cityName: onboardingState.cityName,
            aiGenerated: true,
          },
        });
      } else {
        // Update existing progress toast
        updateNotification(progressToastId.current, {
          message: onboardingProgress.currentStageLabel || "Processing...",
          progress: onboardingProgress.progress || 0,
        });
      }

      // Show individual module completion notifications
      for (const module of onboardingProgress.moduleProgress) {
        const prevStatus = lastModuleStatus.current[module.moduleSlug];
        if (module.status === "completed" && prevStatus !== "completed") {
          addNotification({
            type: "success",
            title: `${MODULE_NAMES[module.moduleSlug] || module.moduleSlug} ready`,
            message: `${module.hotspotsCreated} hotspots, ${module.quickWinsCreated} quick wins`,
            persistent: false,
            duration: 4000,
            meta: {
              moduleSlug: module.moduleSlug,
              cityName: onboardingState.cityName,
              aiGenerated: true,
            },
          });
        }
        lastModuleStatus.current[module.moduleSlug] = module.status;
      }
    }

    // Handle completion
    if (onboardingProgress.status === "completed") {
      if (progressToastId.current) {
        dismissToast(progressToastId.current);
        progressToastId.current = null;
      }

      addNotification({
        type: "success",
        title: `${onboardingState.cityName} is ready!`,
        message: "All modules have been loaded successfully.",
        persistent: true,
        duration: 6000,
        meta: {
          cityName: onboardingState.cityName,
          aiGenerated: true,
        },
      });

      // Reset state
      setOnboardingState({
        isOnboarding: false,
        cityId: null,
        cityName: "",
        country: "",
        showNotifications: false,
      });
      lastModuleStatus.current = {};
    }

    // Handle failure
    if (onboardingProgress.status === "failed") {
      if (progressToastId.current) {
        dismissToast(progressToastId.current);
        progressToastId.current = null;
      }

      addNotification({
        type: "error",
        title: `Failed to load ${onboardingState.cityName}`,
        message: onboardingProgress.error || "An error occurred.",
        persistent: true,
        duration: 8000,
        meta: {
          cityName: onboardingState.cityName,
        },
      });

      // Reset state
      setOnboardingState({
        isOnboarding: false,
        cityId: null,
        cityName: "",
        country: "",
        showNotifications: false,
      });
      lastModuleStatus.current = {};
    }
  }, [
    onboardingState.showNotifications,
    onboardingState.cityName,
    onboardingProgress,
    addNotification,
    updateNotification,
    dismissToast,
  ]);

  // Start onboarding a new city
  const startOnboarding = useCallback(
    async (cityData: NewCityData) => {
      // Reset previous tracking state
      lastModuleStatus.current = {};
      progressToastId.current = null;

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
          showNotifications: false,
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
    // If still generating, switch to showing notifications
    const stillGenerating = onboardingProgress?.status === "generating";

    if (stillGenerating) {
      // Keep tracking but show notifications instead of modal
      setOnboardingState((prev) => ({
        ...prev,
        isOnboarding: false,
        showNotifications: true,
      }));

      // Show initial notification
      addNotification({
        type: "info",
        title: `Generating ${onboardingState.cityName} in background`,
        message: "You'll see notifications as each module completes.",
        persistent: false,
        duration: 4000,
        meta: {
          cityName: onboardingState.cityName,
          aiGenerated: true,
        },
      });
    } else {
      // Fully reset state
      setOnboardingState({
        isOnboarding: false,
        cityId: null,
        cityName: "",
        country: "",
        showNotifications: false,
      });
      lastModuleStatus.current = {};
      progressToastId.current = null;
    }
  }, [onboardingProgress?.status, onboardingState.cityName, addNotification]);

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
