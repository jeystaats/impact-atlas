"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultsCount?: number;
  totalCount?: number;
  debounceMs?: number;
  className?: string;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const iconVariants: Variants = {
  idle: { scale: 1, rotate: 0 },
  searching: {
    scale: [1, 1.1, 1],
    transition: { duration: 0.3 },
  },
};

const clearButtonVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
    rotate: -90,
  },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    rotate: 90,
    transition: {
      duration: 0.15,
    },
  },
};

const resultsVariants: Variants = {
  hidden: { opacity: 0, y: -5, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    y: -5,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function SearchBar({
  value,
  onChange,
  placeholder = "Search hotspots...",
  resultsCount,
  totalCount,
  debounceMs = 300,
  className,
  autoFocus = false,
  onFocus,
  onBlur,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange handler
  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);
      setIsSearching(true);

      // Clear existing timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set new debounced callback
      debounceRef.current = setTimeout(() => {
        onChange(newValue);
        setIsSearching(false);
      }, debounceMs);
    },
    [onChange, debounceMs]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleClear = useCallback(() => {
    setLocalValue("");
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && localValue) {
        handleClear();
      }
    },
    [localValue, handleClear]
  );

  const hasValue = localValue.length > 0;
  const showResults = hasValue && resultsCount !== undefined;

  return (
    <div className={cn("relative", className)}>
      {/* Search input container */}
      <motion.div
        className={cn(
          "relative flex items-center rounded-xl border transition-all duration-200",
          "bg-[var(--background-secondary)]",
          isFocused
            ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/20"
            : "border-[var(--border)] hover:border-[var(--foreground-muted)]"
        )}
        animate={{
          scale: isFocused ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Search icon */}
        <motion.div
          className="absolute left-3 pointer-events-none"
          variants={iconVariants}
          animate={isSearching ? "searching" : "idle"}
        >
          <Icon
            name={isSearching ? "loader" : "search"}
            className={cn(
              "w-4 h-4 transition-colors duration-200",
              isSearching && "animate-spin",
              isFocused || hasValue
                ? "text-[var(--accent)]"
                : "text-[var(--foreground-muted)]"
            )}
          />
        </motion.div>

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            "w-full py-2.5 pl-10 pr-10 bg-transparent text-sm",
            "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
            "outline-none"
          )}
          aria-label="Search"
        />

        {/* Clear button */}
        <AnimatePresence mode="wait">
          {hasValue && (
            <motion.button
              variants={clearButtonVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={handleClear}
              className={cn(
                "absolute right-3 p-1 rounded-full",
                "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
                "hover:bg-[var(--background)] transition-colors"
              )}
              aria-label="Clear search"
              type="button"
            >
              <Icon name="x" className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results count badge */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            variants={resultsVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full left-0 mt-2"
          >
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium",
                "bg-[var(--background-secondary)] border border-[var(--border)]",
                resultsCount === 0
                  ? "text-red-500"
                  : "text-[var(--foreground-secondary)]"
              )}
            >
              {resultsCount === 0 ? (
                <>
                  <Icon name="x" className="w-3 h-3" />
                  No results found
                </>
              ) : (
                <>
                  <motion.span
                    key={resultsCount}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="tabular-nums font-semibold text-[var(--accent)]"
                  >
                    {resultsCount}
                  </motion.span>
                  <span>
                    of {totalCount} {totalCount === 1 ? "result" : "results"}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard hint */}
      <AnimatePresence>
        {isFocused && hasValue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-full right-0 mt-2"
          >
            <span className="text-[10px] text-[var(--foreground-muted)]">
              Press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--background-secondary)] border border-[var(--border)] font-mono">
                ESC
              </kbd>{" "}
              to clear
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchBar;
