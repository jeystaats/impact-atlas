"use client";

import { useRef, useLayoutEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface TooltipData {
  label?: string;
  value: string | number;
  color?: string;
  subtitle?: string;
  items?: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
}

export interface ChartTooltipProps {
  visible: boolean;
  x: number;
  y: number;
  data: TooltipData | null;
  containerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  variant?: "default" | "minimal" | "detailed";
}

export interface TooltipPosition {
  x: number;
  y: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TOOLTIP_OFFSET = 12;
const TOOLTIP_PADDING = 8;

// Smooth spring transition for tooltip movement
const tooltipTransition = {
  type: "spring" as const,
  stiffness: 500,
  damping: 35,
  mass: 0.5,
};

// =============================================================================
// HELPER HOOK: useTooltipPosition
// =============================================================================

export function useTooltipPosition(containerRef?: React.RefObject<HTMLElement | null>) {
  const [position, setPosition] = useState<TooltipPosition>({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(
    (x: number, y: number) => {
      if (!tooltipRef.current) {
        setPosition({ x, y });
        return;
      }

      const tooltip = tooltipRef.current;
      const tooltipRect = tooltip.getBoundingClientRect();
      const container = containerRef?.current;
      const containerRect = container?.getBoundingClientRect();

      let adjustedX = x;
      let adjustedY = y - TOOLTIP_OFFSET;

      // Prevent tooltip from going off the right edge
      if (containerRect) {
        const rightEdge = containerRect.width;
        if (adjustedX + tooltipRect.width / 2 > rightEdge - TOOLTIP_PADDING) {
          adjustedX = rightEdge - tooltipRect.width / 2 - TOOLTIP_PADDING;
        }
        // Prevent tooltip from going off the left edge
        if (adjustedX - tooltipRect.width / 2 < TOOLTIP_PADDING) {
          adjustedX = tooltipRect.width / 2 + TOOLTIP_PADDING;
        }
        // Prevent tooltip from going off the top edge
        if (adjustedY - tooltipRect.height < TOOLTIP_PADDING) {
          adjustedY = y + tooltipRect.height + TOOLTIP_OFFSET;
        }
      }

      setPosition({ x: adjustedX, y: adjustedY });
    },
    [containerRef]
  );

  return { position, updatePosition, tooltipRef };
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChartTooltip({
  visible,
  x,
  y,
  data,
  containerRef,
  className,
  variant = "default",
}: ChartTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState({ x, y });

  // Adjust position to keep tooltip within bounds
  // Using useLayoutEffect to measure DOM synchronously before paint
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: sync position when visibility changes
  useLayoutEffect(() => {
    if (!visible || !tooltipRef.current) {
      setAdjustedPosition({ x, y });
      return;
    }

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const container = containerRef?.current;
    const containerRect = container?.getBoundingClientRect();

    let adjustedX = x;
    let adjustedY = y - tooltipRect.height - TOOLTIP_OFFSET;

    if (containerRect) {
      // Prevent going off right edge
      if (adjustedX + tooltipRect.width / 2 > containerRect.width - TOOLTIP_PADDING) {
        adjustedX = containerRect.width - tooltipRect.width / 2 - TOOLTIP_PADDING;
      }
      // Prevent going off left edge
      if (adjustedX - tooltipRect.width / 2 < TOOLTIP_PADDING) {
        adjustedX = tooltipRect.width / 2 + TOOLTIP_PADDING;
      }
      // If tooltip would go above container, show it below the point instead
      if (adjustedY < TOOLTIP_PADDING) {
        adjustedY = y + TOOLTIP_OFFSET;
      }
    }

    setAdjustedPosition({ x: adjustedX, y: adjustedY });
  }, [visible, x, y, containerRef]);

  if (!data) return null;

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.98 }}
          transition={tooltipTransition}
          className={cn(
            "absolute pointer-events-none z-50",
            className
          )}
          style={{
            left: adjustedPosition.x,
            top: adjustedPosition.y,
            transform: "translateX(-50%)",
          }}
        >
          {variant === "minimal" && (
            <MinimalTooltip data={data} />
          )}
          {variant === "default" && (
            <DefaultTooltip data={data} />
          )}
          {variant === "detailed" && (
            <DetailedTooltip data={data} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// TOOLTIP VARIANTS
// =============================================================================

function MinimalTooltip({ data }: { data: TooltipData }) {
  return (
    <div className="bg-[var(--foreground)] text-white px-2.5 py-1.5 rounded-lg shadow-xl text-sm font-medium whitespace-nowrap">
      <span style={{ color: data.color }}>{data.value}</span>
      <TooltipArrow />
    </div>
  );
}

function DefaultTooltip({ data }: { data: TooltipData }) {
  return (
    <div className="bg-[var(--foreground)] text-white px-3 py-2 rounded-lg shadow-xl min-w-[100px]">
      {data.label && (
        <p className="text-xs text-white/60 mb-1 font-medium">{data.label}</p>
      )}
      <p className="text-sm font-semibold tabular-nums" style={{ color: data.color || "#fff" }}>
        {data.value}
      </p>
      {data.subtitle && (
        <p className="text-xs text-white/50 mt-0.5">{data.subtitle}</p>
      )}
      <TooltipArrow />
    </div>
  );
}

function DetailedTooltip({ data }: { data: TooltipData }) {
  return (
    <div className="bg-[var(--foreground)] text-white px-3 py-2.5 rounded-lg shadow-xl min-w-[140px]">
      {data.label && (
        <p className="text-xs text-white/60 mb-2 font-medium border-b border-white/10 pb-1.5">
          {data.label}
        </p>
      )}

      {data.items && data.items.length > 0 ? (
        <div className="space-y-1.5">
          {data.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {item.color && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                <span className="text-xs text-white/70">{item.label}</span>
              </div>
              <span className="text-xs font-semibold tabular-nums">{item.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm font-semibold tabular-nums" style={{ color: data.color || "#fff" }}>
          {data.value}
        </p>
      )}

      {data.subtitle && (
        <p className="text-xs text-white/50 mt-2 pt-1.5 border-t border-white/10">
          {data.subtitle}
        </p>
      )}
      <TooltipArrow />
    </div>
  );
}

function TooltipArrow() {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 bg-[var(--foreground)]"
      style={{ clipPath: "polygon(0 0, 100% 100%, 0 100%)" }}
    />
  );
}

// =============================================================================
// EXPORT HOOK FOR EXTERNAL USE
// =============================================================================

export function useChartTooltip<T extends TooltipData>() {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    data: T | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    data: null,
  });

  const showTooltip = useCallback((x: number, y: number, data: T) => {
    setTooltip({ visible: true, x, y, data });
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  const updatePosition = useCallback((x: number, y: number) => {
    setTooltip((prev) => ({ ...prev, x, y }));
  }, []);

  return {
    tooltip,
    showTooltip,
    hideTooltip,
    updatePosition,
  };
}
