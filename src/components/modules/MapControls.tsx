"use client";

import { motion, AnimatePresence, type Transition } from "framer-motion";
import { Icon, IconName } from "@/components/ui/icons";

export interface LayerConfig {
  id: string;
  label: string;
  icon: IconName;
  enabled: boolean;
  color?: string;
}

export interface MapControlsProps {
  layers: LayerConfig[];
  onLayerToggle: (layerId: string) => void;
  onZoomToFit: () => void;
  onLocateUser?: () => void;
  isLocating?: boolean;
  showLayerPanel?: boolean;
  onToggleLayerPanel?: () => void;
  className?: string;
}

// Subtle spring animation for smooth, professional feel
const springTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

export function MapControls({
  layers,
  onLayerToggle,
  onZoomToFit,
  onLocateUser,
  isLocating = false,
  showLayerPanel = false,
  onToggleLayerPanel,
  className = "",
}: MapControlsProps) {
  return (
    <div className={`absolute top-4 right-4 flex flex-col gap-2 z-10 ${className}`}>
      {/* Main Control Bar */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...springTransition, delay: 0.1 }}
        className="flex items-center gap-1 p-1 rounded-xl bg-white/95 backdrop-blur-md border border-[var(--border)] shadow-lg"
      >
        {/* Layer Toggle Button */}
        <ControlButton
          icon="layers"
          label="Toggle Layers"
          isActive={showLayerPanel}
          onClick={onToggleLayerPanel}
        />

        <div className="w-px h-6 bg-[var(--border)]" />

        {/* Zoom to Fit Button */}
        <ControlButton
          icon="maximize"
          label="Zoom to Fit"
          onClick={onZoomToFit}
        />

        {/* Locate User Button */}
        {onLocateUser && (
          <ControlButton
            icon="locate"
            label="My Location"
            onClick={onLocateUser}
            isLoading={isLocating}
          />
        )}
      </motion.div>

      {/* Layer Panel - Expandable */}
      <AnimatePresence>
        {showLayerPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={springTransition}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-white/95 backdrop-blur-md border border-[var(--border)] shadow-lg">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border)]">
                <Icon name="layers" className="w-4 h-4 text-[var(--foreground-muted)]" />
                <span className="text-xs font-semibold text-[var(--foreground)]">
                  Data Layers
                </span>
              </div>

              <div className="space-y-1">
                {layers.map((layer, index) => (
                  <LayerToggle
                    key={layer.id}
                    layer={layer}
                    onToggle={() => onLayerToggle(layer.id)}
                    delay={index * 0.05}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Individual Control Button Component
interface ControlButtonProps {
  icon: IconName;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  isLoading?: boolean;
}

function ControlButton({
  icon,
  label,
  onClick,
  isActive = false,
  isLoading = false,
}: ControlButtonProps) {
  return (
    <motion.button
      variants={buttonVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      transition={springTransition}
      onClick={onClick}
      className={`
        relative p-2 rounded-lg transition-colors duration-200
        ${isActive
          ? "bg-[var(--accent)] text-white"
          : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
        }
      `}
      title={label}
      aria-label={label}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Icon name="loader" className="w-4 h-4" />
        </motion.div>
      ) : (
        <Icon name={icon} className="w-4 h-4" />
      )}

      {/* Active indicator glow */}
      {isActive && (
        <motion.div
          layoutId="activeGlow"
          className="absolute inset-0 rounded-lg bg-[var(--accent)] opacity-20 blur-sm -z-10"
          transition={springTransition}
        />
      )}
    </motion.button>
  );
}

// Layer Toggle Component
interface LayerToggleProps {
  layer: LayerConfig;
  onToggle: () => void;
  delay?: number;
}

function LayerToggle({ layer, onToggle, delay = 0 }: LayerToggleProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...springTransition, delay }}
      onClick={onToggle}
      className={`
        w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200
        ${layer.enabled
          ? "bg-[var(--accent-bg)] text-[var(--accent-dark)]"
          : "text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)]"
        }
      `}
    >
      {/* Layer Icon */}
      <div
        className={`
          w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-200
          ${layer.enabled
            ? "bg-[var(--accent)] text-white"
            : "bg-[var(--background-secondary)] text-[var(--foreground-muted)]"
          }
        `}
        style={layer.enabled && layer.color ? { backgroundColor: layer.color } : undefined}
      >
        <Icon name={layer.icon} className="w-3.5 h-3.5" />
      </div>

      {/* Label */}
      <span className="flex-1 text-left text-sm font-medium">
        {layer.label}
      </span>

      {/* Toggle Indicator */}
      <motion.div
        className={`
          w-8 h-5 rounded-full p-0.5 transition-colors duration-200
          ${layer.enabled ? "bg-[var(--accent)]" : "bg-[var(--border)]"}
        `}
      >
        <motion.div
          animate={{ x: layer.enabled ? 12 : 0 }}
          transition={springTransition}
          className="w-4 h-4 rounded-full bg-white shadow-sm"
        />
      </motion.div>
    </motion.button>
  );
}

// Compact Legend Component (can be used separately)
export interface LegendItem {
  color: string;
  label: string;
}

interface MapLegendProps {
  title: string;
  items: LegendItem[];
  className?: string;
}

export function MapLegend({ title, items, className = "" }: MapLegendProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className={`
        p-3 rounded-xl bg-white/95 backdrop-blur-md border border-[var(--border)] shadow-lg
        ${className}
      `}
    >
      <p className="text-xs font-semibold text-[var(--foreground)] mb-2">{title}</p>
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full shadow-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-[var(--foreground-secondary)] capitalize">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Hotspot Count Badge Component
interface HotspotCountBadgeProps {
  count: number;
  label?: string;
  className?: string;
}

export function HotspotCountBadge({
  count,
  label = "hotspots",
  className = "",
}: HotspotCountBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springTransition}
      className={`
        px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[var(--border)] shadow-lg
        ${className}
      `}
    >
      <span className="text-xs font-medium text-[var(--foreground)]">
        <span className="tabular-nums">{count}</span> {label}
      </span>
    </motion.div>
  );
}
