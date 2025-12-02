"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon, ModuleIcon } from "@/components/ui/icons";
import { modules } from "@/data/modules";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export function ModulesGrid() {
  return (
    <section className="py-24 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4"
          >
            Six modules, one mission
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-[var(--foreground-secondary)]"
          >
            Each module targets a specific climate challenge with AI-powered insights and actionable recommendations.
          </motion.p>
        </div>

        {/* Bento grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              variants={itemVariants}
              className={index === 0 || index === 5 ? "md:col-span-2 lg:col-span-1" : ""}
            >
              <Link href={`/dashboard/modules/${module.id}`}>
                <Card interactive className="h-full group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: module.color + "15" }}
                      >
                        <ModuleIcon
                          moduleId={module.id}
                          className="w-6 h-6"
                          style={{ color: module.color }}
                        />
                      </div>
                      {module.status === "beta" && (
                        <Badge variant="secondary">Beta</Badge>
                      )}
                      {module.status === "coming-soon" && (
                        <Badge variant="outline">Coming Soon</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Metrics */}
                    <div className="space-y-3 mb-4">
                      {module.metrics.slice(0, 2).map((metric, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-[var(--foreground-secondary)]">
                            {metric.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[var(--foreground)] tabular-nums">
                              {metric.value}
                              {metric.unit && (
                                <span className="text-xs text-[var(--foreground-muted)] ml-1">
                                  {metric.unit}
                                </span>
                              )}
                            </span>
                            {metric.trend && (
                              <span className={`flex items-center text-xs ${
                                metric.trend === "up" ? "text-emerald-600" :
                                metric.trend === "down" ? "text-red-600" :
                                "text-[var(--foreground-muted)]"
                              }`}>
                                {metric.trend === "up" && <Icon name="trendingUp" className="w-3 h-3" />}
                                {metric.trend === "down" && <Icon name="trendingDown" className="w-3 h-3" />}
                                {metric.trendValue && (
                                  <span className="ml-0.5">{metric.trendValue}</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick wins count */}
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        <Icon name="zap" className="w-4 h-4 text-[var(--accent)]" />
                        <span className="text-sm text-[var(--foreground-secondary)]">
                          <span className="font-semibold text-[var(--accent)]">{module.quickWinsCount}</span> quick wins
                        </span>
                      </div>
                      <Icon
                        name="chevronRight"
                        className="w-4 h-4 text-[var(--foreground-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
