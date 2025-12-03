"use client";

import * as React from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/ui/icons";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export type CardVariant = "default" | "elevated" | "outlined" | "glass" | "accent";
export type CardSize = "sm" | "md" | "lg";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual style variant */
  variant?: CardVariant;
  /** Card size affecting padding */
  size?: CardSize;
  /** Enable hover interactions */
  interactive?: boolean;
  /** Accent color for accent variant */
  accentColor?: string;
  /** Animation stagger index */
  index?: number;
  /** Enable entrance animation */
  animated?: boolean;
  /** As child to support Link wrapping */
  asChild?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const variantClasses: Record<CardVariant, string> = {
  default:
    "bg-[var(--background-tertiary)] border border-[var(--border)] shadow-[var(--shadow-sm)]",
  elevated:
    "bg-[var(--background-tertiary)] border border-[var(--border)] shadow-[var(--shadow-lg)]",
  outlined:
    "bg-transparent border-2 border-[var(--border)]",
  glass:
    "bg-white/5 backdrop-blur-md border border-white/10",
  accent:
    "bg-[var(--background-tertiary)] border border-[var(--border)]",
};

const sizeClasses: Record<CardSize, string> = {
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

const interactiveClasses =
  "cursor-pointer hover:shadow-[var(--shadow-lg)] hover:border-[var(--accent-muted)] hover:-translate-y-0.5 transition-all duration-200";

// Animation variants
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.1 + index * 0.05,
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

// =============================================================================
// ENHANCED CARD COMPONENT
// =============================================================================

/**
 * Enhanced Card with variants, animations, and interactive states
 */
const EnhancedCard = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      interactive = false,
      accentColor,
      index = 0,
      animated = false,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const accentStyle =
      variant === "accent" && accentColor
        ? {
            ...style,
            borderLeftWidth: "3px",
            borderLeftColor: accentColor,
          }
        : style;

    const cardClassName = cn(
      "rounded-[var(--radius-lg)]",
      variantClasses[variant],
      sizeClasses[size],
      interactive && interactiveClasses,
      className
    );

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={cardClassName}
          style={accentStyle}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={index}
          whileHover={interactive ? { y: -2, transition: { duration: 0.2 } } : undefined}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cardClassName}
        style={accentStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);
EnhancedCard.displayName = "EnhancedCard";

// =============================================================================
// CARD HEADER WITH ICON
// =============================================================================

interface CardHeaderWithIconProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon name from the icon system */
  icon?: IconName;
  /** Icon background color */
  iconColor?: string;
  /** Title text */
  title?: string;
  /** Subtitle text */
  subtitle?: string;
  /** Actions to render on the right side */
  actions?: React.ReactNode;
}

const CardHeaderWithIcon = React.forwardRef<HTMLDivElement, CardHeaderWithIconProps>(
  ({ className, icon, iconColor, title, subtitle, actions, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex items-start gap-3", className)} {...props}>
        {icon && (
          <motion.div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: iconColor ? `${iconColor}15` : "var(--accent-bg)" }}
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Icon
              name={icon}
              className="w-5 h-5"
              style={{ color: iconColor || "var(--accent)" }}
            />
          </motion.div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="font-semibold text-[var(--foreground)] truncate">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-[var(--foreground-secondary)] line-clamp-2">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    );
  }
);
CardHeaderWithIcon.displayName = "CardHeaderWithIcon";

// =============================================================================
// CARD STAT ROW
// =============================================================================

interface CardStatRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stat label */
  label: string;
  /** Stat value */
  value: string | number;
  /** Value unit suffix */
  unit?: string;
  /** Trend direction */
  trend?: "up" | "down" | "neutral";
  /** Trend value text */
  trendValue?: string;
}

const CardStatRow = React.forwardRef<HTMLDivElement, CardStatRowProps>(
  ({ className, label, value, unit, trend, trendValue, ...props }, ref) => {
    const trendColors = {
      up: "text-emerald-600",
      down: "text-red-600",
      neutral: "text-[var(--foreground-muted)]",
    };

    const trendIcons: Record<string, IconName> = {
      up: "trendingUp",
      down: "trendingDown",
      neutral: "minus",
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between", className)}
        {...props}
      >
        <span className="text-sm text-[var(--foreground-secondary)]">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-[var(--foreground)] tabular-nums">
            {value}
            {unit && (
              <span className="text-xs text-[var(--foreground-muted)] ml-0.5">
                {unit}
              </span>
            )}
          </span>
          {trend && trendValue && (
            <span className={cn("flex items-center text-xs", trendColors[trend])}>
              <Icon name={trendIcons[trend]} className="w-3 h-3" />
              <span className="ml-0.5">{trendValue}</span>
            </span>
          )}
        </div>
      </div>
    );
  }
);
CardStatRow.displayName = "CardStatRow";

// =============================================================================
// CARD ACTION ROW
// =============================================================================

interface CardActionRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Left side text/content */
  label?: string;
  /** Show arrow indicator */
  showArrow?: boolean;
}

const CardActionRow = React.forwardRef<HTMLDivElement, CardActionRowProps>(
  ({ className, label, showArrow = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between pt-3 border-t border-[var(--border)]",
          className
        )}
        {...props}
      >
        {label && (
          <span className="text-xs text-[var(--foreground-muted)]">{label}</span>
        )}
        {children}
        {showArrow && (
          <Icon
            name="chevronRight"
            className="w-4 h-4 text-[var(--foreground-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all"
          />
        )}
      </div>
    );
  }
);
CardActionRow.displayName = "CardActionRow";

// =============================================================================
// CARD BADGE GROUP
// =============================================================================

interface CardBadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Badges to render */
  badges?: Array<{
    label: string;
    color?: string;
    icon?: IconName;
  }>;
}

const CardBadgeGroup = React.forwardRef<HTMLDivElement, CardBadgeGroupProps>(
  ({ className, badges = [], children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2 flex-wrap", className)}
        {...props}
      >
        {badges.map((badge, i) => (
          <span
            key={i}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
            style={{
              backgroundColor: badge.color ? `${badge.color}15` : "var(--background-secondary)",
              color: badge.color || "var(--foreground-secondary)",
            }}
          >
            {badge.icon && <Icon name={badge.icon} className="w-3 h-3" />}
            {badge.label}
          </span>
        ))}
        {children}
      </div>
    );
  }
);
CardBadgeGroup.displayName = "CardBadgeGroup";

// =============================================================================
// CARD GLOW EFFECT
// =============================================================================

interface CardGlowProps {
  /** Glow color */
  color?: string;
  /** Whether glow is visible */
  visible?: boolean;
}

function CardGlow({ color = "var(--accent)", visible = false }: CardGlowProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute -inset-px rounded-xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${color}20, transparent 50%)`,
          }}
        />
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  EnhancedCard,
  CardHeaderWithIcon,
  CardStatRow,
  CardActionRow,
  CardBadgeGroup,
  CardGlow,
};
