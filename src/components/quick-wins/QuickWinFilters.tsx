"use client";

import { motion } from "framer-motion";
import { ModuleIcon } from "@/components/ui/icons";
import { impactConfig } from "./constants";
import type { ImpactLevel, NormalizedModule } from "./types";

interface QuickWinFiltersProps {
  modules: NormalizedModule[];
  selectedModule: string;
  selectedImpact: ImpactLevel | "all";
  onModuleChange: (module: string) => void;
  onImpactChange: (impact: ImpactLevel | "all") => void;
}

export function QuickWinFilters({
  modules,
  selectedModule,
  selectedImpact,
  onModuleChange,
  onImpactChange,
}: QuickWinFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-col lg:flex-row gap-4 mb-6"
    >
      {/* Module Filter */}
      <div className="flex-1">
        <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider mb-2">
          Filter by Module
        </p>
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onModuleChange("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedModule === "all"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] hover:bg-[var(--border)] border border-[var(--border)]"
            }`}
          >
            All Modules
          </motion.button>
          {modules.map((module) => (
            <motion.button
              key={module.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onModuleChange(module.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedModule === module.id
                  ? "text-white"
                  : "bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] hover:bg-[var(--border)] border border-[var(--border)]"
              }`}
              style={
                selectedModule === module.id
                  ? { backgroundColor: module.color }
                  : {}
              }
            >
              <ModuleIcon
                moduleId={module.id}
                className="w-3.5 h-3.5"
                style={selectedModule !== module.id ? { color: module.color } : {}}
              />
              <span className="hidden sm:inline">
                {module.title.split(" ").slice(0, 2).join(" ")}
              </span>
              <span className="sm:hidden">{module.title.split(" ")[0]}</span>
              <span className="text-xs opacity-70">({module.quickWinsCount})</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Impact Filter */}
      <div className="lg:w-64">
        <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider mb-2">
          Filter by Impact
        </p>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onImpactChange("all")}
            className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedImpact === "all"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] hover:bg-[var(--border)] border border-[var(--border)]"
            }`}
          >
            All
          </motion.button>
          {(["high", "medium", "low"] as ImpactLevel[]).map((impact) => (
            <motion.button
              key={impact}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onImpactChange(impact)}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                selectedImpact === impact
                  ? "text-white"
                  : "bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] hover:bg-[var(--border)] border border-[var(--border)]"
              }`}
              style={
                selectedImpact === impact
                  ? { backgroundColor: impactConfig[impact].color }
                  : {}
              }
            >
              {impact}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
