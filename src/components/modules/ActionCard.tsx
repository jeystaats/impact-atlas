"use client";

import { motion } from "framer-motion";
import { Icon, IconName } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  type: "hotspot" | "insight" | "recommendation" | "warning";
  title: string;
  description: string;
  severity?: "low" | "medium" | "high" | "critical";
  impact?: "low" | "medium" | "high";
  effort?: "low" | "medium" | "high";
  confidence?: number;
  location?: string;
  isSelected?: boolean;
  onClick?: () => void;
  actions?: Array<{ label: string; onClick: () => void }>;
}

const typeConfig: Record<string, { icon: IconName; color: string; bg: string }> = {
  hotspot: { icon: "target", color: "text-red-600", bg: "bg-red-50" },
  insight: { icon: "info", color: "text-blue-600", bg: "bg-blue-50" },
  recommendation: { icon: "zap", color: "text-emerald-600", bg: "bg-emerald-50" },
  warning: { icon: "warning", color: "text-amber-600", bg: "bg-amber-50" },
};

const severityConfig = {
  low: { color: "text-emerald-700", bg: "bg-emerald-50" },
  medium: { color: "text-amber-700", bg: "bg-amber-50" },
  high: { color: "text-orange-700", bg: "bg-orange-50" },
  critical: { color: "text-red-700", bg: "bg-red-50" },
};

export function ActionCard({
  type,
  title,
  description,
  severity,
  impact,
  effort,
  confidence,
  location,
  isSelected,
  onClick,
  actions,
}: ActionCardProps) {
  const config = typeConfig[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: onClick ? 1.01 : 1 }}
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border transition-all",
        isSelected
          ? "bg-[var(--accent-bg)] border-[var(--accent)] shadow-md"
          : "bg-[var(--background-tertiary)] border-[var(--border)] hover:border-[var(--accent-muted)]",
        onClick && "cursor-pointer"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", config.bg)}>
          <Icon name={config.icon} className={cn("w-4 h-4", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[var(--foreground)] text-sm">{title}</h3>
            {severity && (
              <Badge className={cn("text-xs", severityConfig[severity].bg, severityConfig[severity].color)}>
                {severity}
              </Badge>
            )}
          </div>
          {location && (
            <p className="text-xs text-[var(--foreground-muted)] flex items-center gap-1 mt-0.5">
              <Icon name="mapPin" className="w-3 h-3" />
              {location}
            </p>
          )}
        </div>
        {confidence && (
          <span className="text-xs text-[var(--foreground-muted)] tabular-nums">
            {confidence}%
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--foreground-secondary)] mb-3 line-clamp-3">
        {description}
      </p>

      {/* Impact/Effort badges */}
      {(impact || effort) && (
        <div className="flex gap-2 mb-3">
          {impact && (
            <Badge variant={impact === "high" ? "success" : impact === "medium" ? "warning" : "secondary"}>
              <Icon name="trendingUp" className="w-3 h-3 mr-1" />
              {impact} impact
            </Badge>
          )}
          {effort && (
            <Badge variant="outline">
              {effort} effort
            </Badge>
          )}
        </div>
      )}

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={index === 0 ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
