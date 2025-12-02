import { create } from "zustand";
import { persist } from "zustand/middleware";

export type City = "amsterdam" | "copenhagen" | "singapore" | "barcelona" | "melbourne";
export type TemperatureUnit = "celsius" | "fahrenheit";
export type MapStyle = "light" | "dark" | "satellite";

export interface NotificationSettings {
  hotspotAlerts: boolean;
  weeklyReports: boolean;
  quickWinUpdates: boolean;
  aiInsights: boolean;
}

interface PreferencesState {
  // App preferences
  defaultCity: City;
  temperatureUnit: TemperatureUnit;
  mapStyle: MapStyle;

  // Notification settings
  notifications: NotificationSettings;

  // Actions
  setDefaultCity: (city: City) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setMapStyle: (style: MapStyle) => void;
  setNotification: (key: keyof NotificationSettings, value: boolean) => void;
  setAllNotifications: (settings: NotificationSettings) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      // Default values
      defaultCity: "amsterdam",
      temperatureUnit: "celsius",
      mapStyle: "light",
      notifications: {
        hotspotAlerts: true,
        weeklyReports: true,
        quickWinUpdates: false,
        aiInsights: true,
      },

      // Actions
      setDefaultCity: (city) => set({ defaultCity: city }),
      setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),
      setMapStyle: (style) => set({ mapStyle: style }),
      setNotification: (key, value) =>
        set((state) => ({
          notifications: { ...state.notifications, [key]: value },
        })),
      setAllNotifications: (settings) => set({ notifications: settings }),
    }),
    {
      name: "impact-atlas-preferences",
    }
  )
);

// City display names for UI
export const cityDisplayNames: Record<City, string> = {
  amsterdam: "Amsterdam",
  copenhagen: "Copenhagen",
  singapore: "Singapore",
  barcelona: "Barcelona",
  melbourne: "Melbourne",
};

// All available cities
export const availableCities: City[] = [
  "amsterdam",
  "copenhagen",
  "singapore",
  "barcelona",
  "melbourne",
];
