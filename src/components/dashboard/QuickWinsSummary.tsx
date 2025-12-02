"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Icon, ModuleIcon } from "@/components/ui/icons";
import { modules as fallbackModules } from "@/data/modules";
import { useModulesForCity } from "@/hooks/useConvex";
import { Id } from "../../../convex/_generated/dataModel";

interface QuickWinsSummaryProps {
  cityId?: Id<"cities">;
}

export function QuickWinsSummary({ cityId }: QuickWinsSummaryProps) {
  // Fetch modules with city-specific stats from Convex
  const modulesData = useModulesForCity(cityId);

  // Normalize modules to a common format
  const modules = modulesData
    ? modulesData.map((m) => ({
        id: m.slug,
        title: m.name,
        color: m.color,
        quickWinsCount: m.cityStats?.totalQuickWins ?? 0,
      }))
    : fallbackModules.map((m) => ({
        id: m.id,
        title: m.title,
        color: m.color,
        quickWinsCount: m.quickWinsCount,
      }));

  const totalWins = modules.reduce((sum, m) => sum + m.quickWinsCount, 0);
  const topModules = [...modules].sort((a, b) => b.quickWinsCount - a.quickWinsCount).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon name="zap" className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/80">Total Quick Wins</p>
              <p className="text-3xl font-bold text-white tabular-nums">{totalWins}</p>
            </div>
          </div>
          <p className="text-sm text-white/80">
            AI-identified opportunities for immediate climate action
          </p>
        </div>
        <CardContent className="p-4">
          <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider mb-3">
            Top Opportunities
          </p>
          <div className="space-y-2">
            {topModules.map((module, index) => (
              <div
                key={module.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--background-secondary)] transition-colors"
              >
                <span className="text-xs font-medium text-[var(--foreground-muted)] w-4">
                  {index + 1}
                </span>
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: module.color + "15" }}
                >
                  <ModuleIcon
                    moduleId={module.id}
                    className="w-3.5 h-3.5"
                    style={{ color: module.color }}
                  />
                </div>
                <span className="flex-1 text-sm text-[var(--foreground)] truncate">
                  {module.title.split(" ").slice(0, 2).join(" ")}
                </span>
                <span className="text-sm font-semibold text-[var(--accent)] tabular-nums">
                  {module.quickWinsCount}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
