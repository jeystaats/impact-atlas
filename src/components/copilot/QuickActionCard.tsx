"use client";

import { useState, useRef } from "react";
import { motion, useSpring, AnimatePresence } from "framer-motion";
import { Icon, IconName } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export type EffortLevel = "low" | "medium" | "high";
export type ActionSource = "ai" | "hotspot" | "module";

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  impactValue: string;
  impactUnit: string;
  impactLabel?: string;
  effortLevel: EffortLevel;
  timeframe?: string;
  location?: {
    name: string;
    lat?: number;
    lng?: number;
  };
  moduleId?: string;
  source: ActionSource;
  confidence?: number;
  trend?: "up" | "down" | "stable";
  recommendations?: string[];
}

interface QuickActionCardProps {
  action: QuickAction;
  index?: number;
  onAddToPlan: (action: QuickAction) => void;
  onViewOnMap?: (action: QuickAction) => void;
  onDismiss?: (action: QuickAction) => void;
  isCompact?: boolean;
}

// Simple animated display - keeps the value display clean without complex animations
// that conflict with React's rules of hooks
function AnimatedValue({
  value,
}: {
  value: string;
  delay?: number;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
    >
      {value}
    </motion.span>
  );
}

// Effort indicator with segmented visualization
function EffortIndicator({ level }: { level: EffortLevel }) {
  const segments = level === "low" ? 1 : level === "medium" ? 2 : 3;
  const colors = {
    low: "bg-emerald-500",
    medium: "bg-amber-500",
    high: "bg-rose-500",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3].map((seg) => (
          <motion.div
            key={seg}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.3 + seg * 0.1, type: "spring", stiffness: 500 }}
            className={cn(
              "w-1.5 rounded-full origin-bottom",
              seg === 1 ? "h-2" : seg === 2 ? "h-3" : "h-4",
              seg <= segments ? colors[level] : "bg-[var(--border)]"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-[var(--foreground-muted)] capitalize">{level} effort</span>
    </div>
  );
}

// Source badge with distinct styling
function SourceBadge({ source }: { source: ActionSource }) {
  const config: Record<ActionSource, { icon: IconName; label: string; className: string }> = {
    ai: {
      icon: "sparkles",
      label: "AI Suggested",
      className: "bg-violet-500/10 text-violet-600 border-violet-200"
    },
    hotspot: {
      icon: "target",
      label: "From Hotspot",
      className: "bg-amber-500/10 text-amber-600 border-amber-200"
    },
    module: {
      icon: "layers",
      label: "Module Insight",
      className: "bg-blue-500/10 text-blue-600 border-blue-200"
    },
  };

  const { icon, label, className } = config[source];

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        className
      )}
    >
      <Icon name={icon} className="w-3 h-3" />
      {label}
    </motion.span>
  );
}

// Magnetic button component
function MagneticButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useSpring(0, { stiffness: 300, damping: 20 });
  const y = useSpring(0, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.2;
    const deltaY = (e.clientY - centerY) * 0.2;
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const variants = {
    primary: "bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] shadow-sm",
    secondary: "bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent-dark)] border border-[var(--border)]",
    ghost: "text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)]",
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
        variants[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
      {isHovered && variant === "primary" && (
        <motion.div
          layoutId="button-glow"
          className="absolute inset-0 rounded-lg bg-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.button>
  );
}

export function QuickActionCard({
  action,
  index = 0,
  onAddToPlan,
  onViewOnMap,
  onDismiss,
  // isCompact can be used for future compact mode rendering
}: QuickActionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToPlan = async () => {
    if (isAdded || isAdding) return;
    setIsAdding(true);

    try {
      await onAddToPlan(action);
      setIsAdded(true);
    } catch (error) {
      console.error("Failed to add to plan:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // Trend indicator icon
  const trendConfig = {
    up: { icon: "trendUp" as IconName, color: "text-emerald-500", label: "Improving" },
    down: { icon: "trendDown" as IconName, color: "text-rose-500", label: "Worsening" },
    stable: { icon: "minus" as IconName, color: "text-amber-500", label: "Stable" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{
        delay: index * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      layout
      className={cn(
        "relative rounded-xl border border-[var(--border)] overflow-hidden",
        "bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-tertiary)]",
        "hover:border-[var(--accent-muted)] transition-colors duration-300"
      )}
    >
      {/* Subtle gradient accent based on source */}
      <div className={cn(
        "absolute inset-0 opacity-30 pointer-events-none",
        action.source === "ai" && "bg-gradient-to-br from-violet-500/10 to-transparent",
        action.source === "hotspot" && "bg-gradient-to-br from-amber-500/10 to-transparent",
        action.source === "module" && "bg-gradient-to-br from-blue-500/10 to-transparent"
      )} />

      <div className="relative p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <SourceBadge source={action.source} />
              {action.confidence && (
                <span className="text-xs text-[var(--foreground-muted)]">
                  {action.confidence}% confidence
                </span>
              )}
            </div>
            <h3 className="font-semibold text-[var(--foreground)] text-sm leading-snug">
              {action.title}
            </h3>
          </div>

          {onDismiss && (
            <button
              onClick={() => onDismiss(action)}
              className="p-1 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors"
            >
              <Icon name="x" className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Impact metric - the hero element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
          className="flex items-baseline gap-2 mb-3"
        >
          <span className="text-3xl font-bold text-[var(--accent)]">
            <AnimatedValue value={action.impactValue} delay={index * 100} />
          </span>
          <span className="text-sm text-[var(--foreground-secondary)]">
            {action.impactUnit}
          </span>
          {action.trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className={cn("flex items-center gap-1", trendConfig[action.trend].color)}
            >
              <Icon name={trendConfig[action.trend].icon} className="w-4 h-4" />
              <span className="text-xs">{trendConfig[action.trend].label}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Description */}
        <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed mb-3">
          {action.description}
        </p>

        {/* Metadata row */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <EffortIndicator level={action.effortLevel} />

          {action.timeframe && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
              <Icon name="clock" className="w-3.5 h-3.5" />
              {action.timeframe}
            </div>
          )}

          {action.location && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
              <Icon name="mapPin" className="w-3.5 h-3.5" />
              {action.location.name}
            </div>
          )}
        </div>

        {/* Expandable recommendations */}
        {action.recommendations && action.recommendations.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icon name="chevronRight" className="w-3.5 h-3.5" />
              </motion.div>
              {isExpanded ? "Hide details" : `${action.recommendations.length} recommended actions`}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="overflow-hidden"
                >
                  <ul className="mt-2 space-y-1.5 pl-1">
                    {action.recommendations.map((rec, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-2 text-xs text-[var(--foreground-secondary)]"
                      >
                        <span className="text-[var(--accent)] mt-0.5">-</span>
                        {rec}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]/50">
          <MagneticButton
            onClick={handleAddToPlan}
            variant="primary"
            disabled={isAdding || isAdded}
          >
            {isAdding ? (
              <>
                <Icon name="loader" className="w-3.5 h-3.5 animate-spin" />
                Adding...
              </>
            ) : isAdded ? (
              <>
                <Icon name="check" className="w-3.5 h-3.5" />
                Added to Plan
              </>
            ) : (
              <>
                <Icon name="plus" className="w-3.5 h-3.5" />
                Add to Plan
              </>
            )}
          </MagneticButton>

          {action.location && onViewOnMap && (
            <MagneticButton
              onClick={() => onViewOnMap(action)}
              variant="secondary"
            >
              <Icon name="mapPin" className="w-3.5 h-3.5" />
              View on Map
            </MagneticButton>
          )}

          {action.moduleId && (
            <MagneticButton
              onClick={() => {
                // Navigate to module - could be handled via callback
              }}
              variant="ghost"
            >
              <Icon name="arrowRight" className="w-3.5 h-3.5" />
              Open Module
            </MagneticButton>
          )}
        </div>
      </div>

      {/* Success state overlay */}
      <AnimatePresence>
        {isAdded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
          >
            {/* Subtle success particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  scale: 0,
                  x: 0,
                  y: 0
                }}
                animate={{
                  opacity: 0,
                  scale: 1,
                  x: Math.cos((i / 6) * Math.PI * 2) * 40,
                  y: Math.sin((i / 6) * Math.PI * 2) * 40
                }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="absolute w-2 h-2 rounded-full bg-[var(--accent)]"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Container component for multiple action cards
interface QuickActionListProps {
  actions: QuickAction[];
  onAddToPlan: (action: QuickAction) => void;
  onViewOnMap?: (action: QuickAction) => void;
  onDismiss?: (action: QuickAction) => void;
  emptyMessage?: string;
}

export function QuickActionList({
  actions,
  onAddToPlan,
  onViewOnMap,
  onDismiss,
  emptyMessage = "No quick actions available",
}: QuickActionListProps) {
  if (actions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8 text-sm text-[var(--foreground-muted)]"
      >
        {emptyMessage}
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {actions.map((action, index) => (
          <QuickActionCard
            key={action.id}
            action={action}
            index={index}
            onAddToPlan={onAddToPlan}
            onViewOnMap={onViewOnMap}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
