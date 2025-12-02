"use client";

import { useState, useEffect, useCallback } from "react";
import { usePreferencesStore, type TemperatureUnit } from "@/stores/usePreferencesStore";

/**
 * Hook for temperature formatting based on user preferences
 */
export function useTemperature() {
  const { temperatureUnit } = usePreferencesStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Default to celsius during SSR
  const unit = isHydrated ? temperatureUnit : "celsius";

  /**
   * Convert Celsius to Fahrenheit
   */
  const celsiusToFahrenheit = useCallback((celsius: number): number => {
    return (celsius * 9) / 5 + 32;
  }, []);

  /**
   * Format a temperature value (input assumed to be Celsius)
   * Returns formatted string with unit symbol
   */
  const formatTemperature = useCallback(
    (celsiusValue: number, decimals: number = 1): string => {
      if (unit === "fahrenheit") {
        const fahrenheit = celsiusToFahrenheit(celsiusValue);
        return `${fahrenheit.toFixed(decimals)}°F`;
      }
      return `${celsiusValue.toFixed(decimals)}°C`;
    },
    [unit, celsiusToFahrenheit]
  );

  /**
   * Format just the value (no unit symbol)
   */
  const formatValue = useCallback(
    (celsiusValue: number, decimals: number = 1): string => {
      if (unit === "fahrenheit") {
        const fahrenheit = celsiusToFahrenheit(celsiusValue);
        return fahrenheit.toFixed(decimals);
      }
      return celsiusValue.toFixed(decimals);
    },
    [unit, celsiusToFahrenheit]
  );

  /**
   * Get the current unit symbol
   */
  const unitSymbol = unit === "fahrenheit" ? "°F" : "°C";

  return {
    unit,
    unitSymbol,
    formatTemperature,
    formatValue,
    celsiusToFahrenheit,
    isHydrated,
  };
}
