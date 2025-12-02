"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { modules } from "@/data/modules";
import { Icon, IconName } from "@/components/ui/icons";

interface ModuleHealth {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  health: number; // 0-100
  alerts: number;
}

// Static health data for each module
const moduleHealthData: Record<string, { health: number; alerts: number }> = {
  "urban-heat": { health: 78, alerts: 2 },
  "coastal-plastic": { health: 85, alerts: 1 },
  "ocean-plastic": { health: 92, alerts: 0 },
  "port-emissions": { health: 71, alerts: 3 },
  "biodiversity": { health: 89, alerts: 1 },
  "restoration": { health: 95, alerts: 0 },
};

function generateModuleHealth(): ModuleHealth[] {
  return modules.map((module) => {
    const data = moduleHealthData[module.id] || { health: 80, alerts: 0 };
    return {
      id: module.id,
      name: module.title.split(" ")[0], // Just first word
      icon: module.icon as IconName,
      color: module.color,
      health: data.health,
      alerts: data.alerts,
    };
  });
}

interface ImpactRadarProps {
  className?: string;
}

export function ImpactRadar({ className = "" }: ImpactRadarProps) {
  const moduleHealth = useMemo(() => generateModuleHealth(), []);
  const totalAlerts = moduleHealth.reduce((acc, m) => acc + m.alerts, 0);
  const avgHealth = Math.round(
    moduleHealth.reduce((acc, m) => acc + m.health, 0) / moduleHealth.length
  );

  return (
    <div className={className}>
      {/* Summary stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-[var(--foreground)]">{avgHealth}%</span>
          <span className="text-xs text-[var(--foreground-muted)]">avg health</span>
        </div>
        {totalAlerts > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-medium text-red-500">{totalAlerts} alerts</span>
          </div>
        )}
      </div>

      {/* Module bars */}
      <div className="space-y-3">
        {moduleHealth.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${module.color}15` }}
              >
                <Icon
                  name={module.icon}
                  className="w-4 h-4"
                  style={{ color: module.color }}
                />
              </div>

              {/* Bar container */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[var(--foreground)] truncate">
                    {module.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {module.alerts > 0 && (
                      <span className="text-[10px] font-medium text-red-500">
                        {module.alerts}
                      </span>
                    )}
                    <span className="text-xs text-[var(--foreground-muted)]">
                      {module.health}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-[var(--background)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: module.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${module.health}%` }}
                    transition={{
                      delay: 0.2 + index * 0.05,
                      duration: 0.6,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
