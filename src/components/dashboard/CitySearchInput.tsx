"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import { Doc } from "../../../convex/_generated/dataModel";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
  properties?: {
    population?: number;
  };
}

interface MapboxResponse {
  features: MapboxFeature[];
}

interface NormalizedCity {
  slug: string;
  name: string;
  country: string;
  population: number;
  coordinates?: { lat: number; lng: number };
  isNew?: boolean;
}

interface CitySearchInputProps {
  selectedCity: string;
  onCitySelect: (city: NormalizedCity) => void;
  onNewCitySelect: (city: NormalizedCity) => void;
  existingCities: Doc<"cities">[];
  className?: string;
}

export function CitySearchInput({
  selectedCity,
  onCitySelect,
  onNewCitySelect,
  existingCities,
  className,
}: CitySearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mapboxResults, setMapboxResults] = useState<NormalizedCity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Normalize existing cities - memoized to prevent infinite re-renders
  const normalizedExisting: NormalizedCity[] = useMemo(
    () =>
      existingCities.map((c) => ({
        slug: c.slug,
        name: c.name,
        country: c.country,
        population: c.population,
        coordinates: c.coordinates,
        isNew: false,
      })),
    [existingCities]
  );

  const currentCity = normalizedExisting.find((c) => c.slug === selectedCity) || normalizedExisting[0];

  // Filter existing cities by search
  const filteredExisting = search
    ? normalizedExisting.filter(
        (city) =>
          city.name.toLowerCase().includes(search.toLowerCase()) ||
          city.country.toLowerCase().includes(search.toLowerCase())
      )
    : normalizedExisting;

  // Search Mapbox for new cities
  const searchMapbox = useCallback(async (query: string) => {
    if (!MAPBOX_TOKEN || query.length < 2) {
      setMapboxResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?types=place&limit=5&access_token=${MAPBOX_TOKEN}`
      );
      const data: MapboxResponse = await response.json();

      // Convert to normalized format
      const results: NormalizedCity[] = data.features.map((feature) => {
        // Extract country from context
        const countryContext = feature.context?.find((c) => c.id.startsWith("country"));
        const country = countryContext?.text || "Unknown";

        // Create slug from name
        const slug = feature.text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        return {
          slug,
          name: feature.text,
          country,
          population: feature.properties?.population || 0,
          coordinates: {
            lat: feature.center[1],
            lng: feature.center[0],
          },
          isNew: true,
        };
      });

      // Filter out cities that already exist
      const existingSlugs = new Set(normalizedExisting.map((c) => c.slug));
      const newResults = results.filter((r) => !existingSlugs.has(r.slug));

      setMapboxResults(newResults);
    } catch (error) {
      console.error("Mapbox search error:", error);
      setMapboxResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [normalizedExisting]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (search.length >= 2) {
      debounceRef.current = setTimeout(() => {
        searchMapbox(search);
      }, 300);
    } else {
      setMapboxResults([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, searchMapbox]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (city: NormalizedCity) => {
    if (city.isNew) {
      onNewCitySelect(city);
    } else {
      onCitySelect(city);
    }
    setIsOpen(false);
    setSearch("");
    setMapboxResults([]);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] hover:border-[var(--accent-muted)] transition-colors w-full sm:w-auto"
      >
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center">
          <Icon name="mapPin" className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div className="text-left">
          <p className="text-xs text-[var(--foreground-muted)]">Current City</p>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {currentCity?.name || "Select a city"}, {currentCity?.country || ""}
          </p>
        </div>
        <Icon
          name="chevronDown"
          className={cn(
            "w-4 h-4 text-[var(--foreground-muted)] transition-transform ml-2",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => {
                setIsOpen(false);
                setSearch("");
                setMapboxResults([]);
              }}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-96 p-3 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] shadow-xl z-50"
            >
              {/* Search input */}
              <div className="relative mb-3">
                <Icon
                  name="search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]"
                />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search any city worldwide..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-muted)]"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <motion.div
                      className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {/* Existing cities section */}
                {filteredExisting.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider px-2 mb-2">
                      Your Cities
                    </p>
                    <div className="space-y-1">
                      {filteredExisting.map((city) => (
                        <button
                          key={city.slug}
                          onClick={() => handleSelect(city)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                            city.slug === selectedCity
                              ? "bg-[var(--accent-bg)] text-[var(--accent-dark)]"
                              : "hover:bg-[var(--background-secondary)] text-[var(--foreground)]"
                          )}
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                              city.slug === selectedCity
                                ? "bg-[var(--accent)] text-white"
                                : "bg-[var(--background-secondary)]"
                            )}
                          >
                            <Icon name="mapPin" className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{city.name}</p>
                            <p className="text-xs text-[var(--foreground-muted)]">{city.country}</p>
                          </div>
                          {city.population > 0 && (
                            <div className="text-right shrink-0">
                              <p className="text-xs font-medium tabular-nums">
                                {formatNumber(city.population)}
                              </p>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* New cities from Mapbox */}
                {mapboxResults.length > 0 && (
                  <div className="pt-2 border-t border-[var(--border)]">
                    <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider px-2 mb-2 flex items-center gap-2">
                      <Icon name="plus" className="w-3 h-3" />
                      Add New City
                    </p>
                    <div className="space-y-1">
                      {mapboxResults.map((city) => (
                        <button
                          key={`${city.slug}-${city.country}`}
                          onClick={() => handleSelect(city)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left hover:bg-[var(--accent-bg)] group"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[var(--accent-muted)] group-hover:bg-[var(--accent)] transition-colors">
                            <Icon name="plus" className="w-4 h-4 text-[var(--accent-dark)] group-hover:text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-[var(--foreground)]">
                              {city.name}
                            </p>
                            <p className="text-xs text-[var(--foreground-muted)]">{city.country}</p>
                          </div>
                          <div className="shrink-0">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] font-medium">
                              Load data
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {search.length >= 2 && !isSearching && filteredExisting.length === 0 && mapboxResults.length === 0 && (
                  <div className="text-center py-8">
                    <Icon name="mapPin" className="w-8 h-8 text-[var(--foreground-muted)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--foreground-muted)]">No cities found</p>
                    <p className="text-xs text-[var(--foreground-muted)] mt-1">
                      Try a different search term
                    </p>
                  </div>
                )}

                {/* Hint when not searching */}
                {search.length < 2 && filteredExisting.length === 0 && (
                  <div className="text-center py-8">
                    <Icon name="search" className="w-8 h-8 text-[var(--foreground-muted)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--foreground-muted)]">
                      Type at least 2 characters to search
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
