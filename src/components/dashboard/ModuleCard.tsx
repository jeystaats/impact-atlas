"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon, ModuleIcon } from "@/components/ui/icons";
import { Module } from "@/types";

interface ModuleCardProps {
  module: Module;
  index: number;
}

export function ModuleCard({ module, index }: ModuleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/dashboard/modules/${module.id}`}>
        <Card interactive className="h-full group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: module.color + "15" }}
              >
                <ModuleIcon
                  moduleId={module.id}
                  className="w-5 h-5"
                  style={{ color: module.color }}
                />
              </div>
              {module.quickWinsCount > 0 && (
                <Badge className="tabular-nums">
                  <Icon name="zap" className="w-3 h-3 mr-1" />
                  {module.quickWinsCount} wins
                </Badge>
              )}
            </div>
            <CardTitle className="text-base mt-3">{module.title}</CardTitle>
            <CardDescription className="text-xs line-clamp-2">
              {module.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {module.metrics.slice(0, 2).map((metric, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-[var(--foreground-secondary)]">
                    {metric.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[var(--foreground)] tabular-nums">
                      {metric.value}
                      {metric.unit && (
                        <span className="text-xs text-[var(--foreground-muted)] ml-0.5">
                          {metric.unit}
                        </span>
                      )}
                    </span>
                    {metric.trend && metric.trendValue && (
                      <span className={`flex items-center text-xs ${
                        metric.trend === "up" ? "text-emerald-600" :
                        metric.trend === "down" ? "text-red-600" :
                        "text-[var(--foreground-muted)]"
                      }`}>
                        {metric.trend === "up" && <Icon name="trendingUp" className="w-3 h-3" />}
                        {metric.trend === "down" && <Icon name="trendingDown" className="w-3 h-3" />}
                        <span className="ml-0.5">{metric.trendValue}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
              <span className="text-xs text-[var(--foreground-muted)]">View details</span>
              <Icon
                name="chevronRight"
                className="w-4 h-4 text-[var(--foreground-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all"
              />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
