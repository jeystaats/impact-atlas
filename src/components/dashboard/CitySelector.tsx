"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icons";
import { cities as fallbackCities } from "@/data/modules";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import { Doc } from "../../../convex/_generated/dataModel";

interface CitySelectorProps {
  selectedCity: string;
  onCityChange: (citySlug: string) => void;
  // Optional: Convex cities data
  cities?: Doc<"cities">[];
}

// Type for normalized city data
interface NormalizedCity {
  slug: string;
  name: string;
  country: string;
  population: number;
}

export function CitySelector({ selectedCity, onCityChange, cities: convexCities }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Normalize cities to a common format
  const cities: NormalizedCity[] = convexCities
    ? convexCities.map((c) => ({
        slug: c.slug,
        name: c.name,
        country: c.country,
        population: c.population,
      }))
    : fallbackCities.map((c) => ({
        slug: c.id,
        name: c.name,
        country: c.country,
        population: c.population,
      }));

  const currentCity = cities.find((c) => c.slug === selectedCity) || cities[0];
  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(search.toLowerCase()) ||
    city.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
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
            {currentCity.name}, {currentCity.country}
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
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-80 p-2 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] shadow-xl z-50"
            >
              {/* Search */}
              <div className="relative mb-2">
                <Icon
                  name="search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]"
                />
                <input
                  type="text"
                  placeholder="Search cities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* City list */}
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredCities.map((city) => (
                  <button
                    key={city.slug}
                    onClick={() => {
                      onCityChange(city.slug);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                      city.slug === selectedCity
                        ? "bg-[var(--accent-bg)] text-[var(--accent-dark)]"
                        : "hover:bg-[var(--background-secondary)] text-[var(--foreground)]"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
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
                    <div className="text-right">
                      <p className="text-xs text-[var(--foreground-muted)]">Population</p>
                      <p className="text-xs font-medium tabular-nums">{formatNumber(city.population)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
