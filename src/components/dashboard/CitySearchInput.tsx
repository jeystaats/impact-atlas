"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
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

// City card with magnetic hover effect
function CityCard({
  city,
  isSelected,
  isNew,
  index,
  isFocused,
  onSelect,
  onMouseEnter,
}: {
  city: NormalizedCity;
  isSelected: boolean;
  isNew?: boolean;
  index: number;
  isFocused: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation for the hover effect
  const springConfig = { damping: 25, stiffness: 400 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.button
      ref={cardRef}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      className={cn(
        "group relative flex items-start gap-4 p-5 rounded-2xl text-left transition-all duration-300",
        "border backdrop-blur-sm",
        // Base styles
        isNew
          ? "border-dashed border-[var(--border)] bg-[var(--background-tertiary)]/50"
          : "border-[var(--border)] bg-[var(--background-tertiary)]",
        // Selected state
        isSelected && !isNew && [
          "border-[var(--accent)] bg-gradient-to-br from-[var(--accent-bg)] to-[var(--background-tertiary)]",
          "shadow-[0_0_0_1px_var(--accent),0_8px_30px_-10px_rgba(13,148,136,0.3)]",
        ],
        // Focused state (keyboard navigation)
        isFocused && !isSelected && [
          "border-[var(--accent-muted)] bg-[var(--accent-bg)]/30",
          "ring-2 ring-[var(--accent-muted)] ring-offset-2 ring-offset-[var(--background-secondary)]",
        ],
        // Hover state
        !isSelected && !isFocused && [
          "hover:border-[var(--accent-muted)] hover:bg-[var(--background-tertiary)]",
          "hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)]",
        ]
      )}
    >
      {/* Gradient overlay on hover */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300",
          "bg-gradient-to-br from-[var(--accent-bg)]/50 via-transparent to-transparent",
          "group-hover:opacity-100",
          isSelected && "opacity-100"
        )}
      />

      {/* Icon container */}
      <div className="relative z-10">
        <motion.div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
            isNew
              ? "bg-gradient-to-br from-[var(--accent-muted)]/50 to-[var(--accent-bg)] group-hover:from-[var(--accent)] group-hover:to-[var(--accent-light)]"
              : isSelected
              ? "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] shadow-lg shadow-[var(--accent)]/20"
              : "bg-[var(--background-secondary)] group-hover:bg-gradient-to-br group-hover:from-[var(--accent-muted)]/30 group-hover:to-[var(--accent-bg)]"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon
            name={isNew ? "plus" : "mapPin"}
            className={cn(
              "w-5 h-5 transition-colors duration-300",
              isNew
                ? "text-[var(--accent-dark)] group-hover:text-white"
                : isSelected
                ? "text-white"
                : "text-[var(--foreground-muted)] group-hover:text-[var(--accent)]"
            )}
          />
        </motion.div>
      </div>

      {/* City info */}
      <div className="relative z-10 flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={cn(
                "font-semibold text-base truncate transition-colors duration-300",
                isSelected ? "text-[var(--accent-dark)]" : "text-[var(--foreground)]"
              )}
            >
              {city.name}
            </p>
            <p className="text-sm text-[var(--foreground-muted)] mt-0.5 truncate">
              {city.country}
            </p>
          </div>

          {/* Selection indicator or "Load data" badge */}
          <AnimatePresence mode="wait">
            {isSelected && !isNew ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/30"
              >
                <Icon name="check" className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </motion.div>
            ) : isNew ? (
              <motion.span
                key="badge"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full font-medium shrink-0 transition-all duration-300",
                  "bg-[var(--accent-bg)] text-[var(--accent-dark)] border border-[var(--accent-muted)]/30",
                  "group-hover:bg-[var(--accent)] group-hover:text-white group-hover:border-transparent"
                )}
              >
                Load data
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Coordinates display for existing cities */}
        {!isNew && city.coordinates && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-[var(--foreground-muted)]/60 mt-2 font-mono"
          >
            {city.coordinates.lat.toFixed(2)}°N, {city.coordinates.lng.toFixed(2)}°E
          </motion.p>
        )}
      </div>
    </motion.button>
  );
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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
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

  // Combined list for keyboard navigation
  const allCities = useMemo(() => {
    return [...filteredExisting, ...mapboxResults];
  }, [filteredExisting, mapboxResults]);

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
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset focus index when results change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [allCities.length]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => (prev < allCities.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : allCities.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < allCities.length) {
          handleSelect(allCities[focusedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        closeModal();
        break;
    }
  };

  const handleSelect = (city: NormalizedCity) => {
    if (city.isNew) {
      onNewCitySelect(city);
    } else {
      onCitySelect(city);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsOpen(false);
    setSearch("");
    setMapboxResults([]);
    setFocusedIndex(-1);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trigger button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "group flex items-center gap-3 px-4 py-3 rounded-xl w-full sm:w-auto",
          "bg-[var(--background-tertiary)] border border-[var(--border)]",
          "hover:border-[var(--accent-muted)] hover:shadow-md",
          "transition-all duration-300"
        )}
      >
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-bg)] to-[var(--accent-muted)]/30 flex items-center justify-center group-hover:from-[var(--accent-muted)]/50 group-hover:to-[var(--accent-bg)] transition-all duration-300">
          <Icon name="mapPin" className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div className="text-left">
          <p className="text-xs text-[var(--foreground-muted)] font-medium">Current City</p>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {currentCity?.name || "Select a city"}, {currentCity?.country || ""}
          </p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="ml-2"
        >
          <Icon name="chevronDown" className="w-4 h-4 text-[var(--foreground-muted)]" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
              onClick={closeModal}
            />

            {/* Modal */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              onKeyDown={handleKeyDown}
              className={cn(
                "fixed inset-4 sm:inset-6 md:inset-10 lg:inset-16 z-50",
                "flex flex-col rounded-3xl overflow-hidden",
                "bg-[var(--background-secondary)] border border-[var(--border)]",
                "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_var(--border)]"
              )}
            >
              {/* Decorative background elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `
                      linear-gradient(var(--foreground) 1px, transparent 1px),
                      linear-gradient(90deg, var(--foreground) 1px, transparent 1px)
                    `,
                    backgroundSize: "60px 60px",
                  }}
                />
                {/* Gradient orbs */}
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-[var(--accent-muted)]/20 to-transparent blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-[var(--accent-bg)] to-transparent blur-3xl" />
              </div>

              {/* Header */}
              <div className="relative flex items-center justify-between p-6 sm:p-8 border-b border-[var(--border)]">
                <div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl sm:text-2xl font-bold text-[var(--foreground)]"
                  >
                    Select City
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-sm text-[var(--foreground-muted)] mt-1"
                  >
                    Choose from your cities or search worldwide
                  </motion.p>
                </div>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeModal}
                  className={cn(
                    "p-2.5 rounded-xl transition-all duration-200",
                    "bg-[var(--background-tertiary)] hover:bg-[var(--border)]",
                    "border border-transparent hover:border-[var(--border)]"
                  )}
                >
                  <Icon name="x" className="w-5 h-5 text-[var(--foreground-muted)]" />
                </motion.button>
              </div>

              {/* Search input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative px-6 sm:px-8 py-4"
              >
                <div className="relative group">
                  {/* Glow effect on focus */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent)]/0 via-[var(--accent)]/0 to-[var(--accent)]/0 rounded-2xl opacity-0 group-focus-within:opacity-100 group-focus-within:from-[var(--accent)]/20 group-focus-within:via-[var(--accent-light)]/20 group-focus-within:to-[var(--accent-muted)]/20 transition-all duration-500 blur-sm" />

                  <div className="relative flex items-center">
                    <motion.div
                      animate={isSearching ? { rotate: 360 } : { rotate: 0 }}
                      transition={isSearching ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                    >
                      <Icon
                        name={isSearching ? "loader" : "search"}
                        className={cn(
                          "absolute left-4 w-5 h-5 transition-colors duration-200",
                          "text-[var(--foreground-muted)] group-focus-within:text-[var(--accent)]"
                        )}
                      />
                    </motion.div>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search any city worldwide..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className={cn(
                        "w-full pl-12 pr-4 py-4 rounded-xl",
                        "bg-[var(--background-tertiary)] border border-[var(--border)]",
                        "text-base text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                        "focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20",
                        "transition-all duration-300"
                      )}
                    />
                    {search && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSearch("")}
                        className="absolute right-3 p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors"
                      >
                        <Icon name="x" className="w-4 h-4 text-[var(--foreground-muted)]" />
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Keyboard hint */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-4 mt-3 text-xs text-[var(--foreground-muted)]"
                >
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--background-tertiary)] border border-[var(--border)] font-mono text-[10px]">
                      up
                    </kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--background-tertiary)] border border-[var(--border)] font-mono text-[10px]">
                      dn
                    </kbd>
                    <span className="ml-1">navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--background-tertiary)] border border-[var(--border)] font-mono text-[10px]">
                      enter
                    </kbd>
                    <span className="ml-1">select</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--background-tertiary)] border border-[var(--border)] font-mono text-[10px]">
                      esc
                    </kbd>
                    <span className="ml-1">close</span>
                  </span>
                </motion.div>
              </motion.div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-6 sm:pb-8">
                {/* Your Cities section */}
                {filteredExisting.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="mb-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                      <p className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                        Your Cities
                      </p>
                      <div className="flex-1 h-px bg-gradient-to-r from-[var(--border)] to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <AnimatePresence mode="popLayout">
                        {filteredExisting.map((city, index) => (
                          <CityCard
                            key={city.slug}
                            city={city}
                            isSelected={city.slug === selectedCity}
                            index={index}
                            isFocused={focusedIndex === index}
                            onSelect={() => handleSelect(city)}
                            onMouseEnter={() => setFocusedIndex(index)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {/* New Cities from Mapbox */}
                {mapboxResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="pt-6 border-t border-[var(--border)]"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                      />
                      <p className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider flex items-center gap-2">
                        <Icon name="plus" className="w-3 h-3" />
                        Add New City
                      </p>
                      <div className="flex-1 h-px bg-gradient-to-r from-[var(--border)] to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <AnimatePresence mode="popLayout">
                        {mapboxResults.map((city, index) => {
                          const globalIndex = filteredExisting.length + index;
                          return (
                            <CityCard
                              key={`${city.slug}-${city.country}`}
                              city={city}
                              isSelected={false}
                              isNew
                              index={index}
                              isFocused={focusedIndex === globalIndex}
                              onSelect={() => handleSelect(city)}
                              onMouseEnter={() => setFocusedIndex(globalIndex)}
                            />
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {/* Empty state - no results found */}
                {search.length >= 2 && !isSearching && filteredExisting.length === 0 && mapboxResults.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20"
                  >
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-bg)] to-[var(--background-tertiary)] flex items-center justify-center mb-6"
                    >
                      <Icon name="mapPin" className="w-10 h-10 text-[var(--accent-muted)]" />
                    </motion.div>
                    <p className="text-lg font-semibold text-[var(--foreground)]">No cities found</p>
                    <p className="text-sm text-[var(--foreground-muted)] mt-2 text-center max-w-xs">
                      We could not find any cities matching &quot;{search}&quot;. Try a different search term.
                    </p>
                  </motion.div>
                )}

                {/* Initial state - prompt to search */}
                {search.length < 2 && filteredExisting.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-bg)] to-[var(--background-tertiary)] flex items-center justify-center mb-6"
                    >
                      <Icon name="globe" className="w-10 h-10 text-[var(--accent)]" />
                    </motion.div>
                    <p className="text-lg font-semibold text-[var(--foreground)]">Search for a city</p>
                    <p className="text-sm text-[var(--foreground-muted)] mt-2 text-center max-w-xs">
                      Type at least 2 characters to search cities worldwide
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
