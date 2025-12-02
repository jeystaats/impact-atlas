"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Icon, ModuleIcon } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Module } from "@/types";

interface ModuleLayoutProps {
  module: Module;
  children: ReactNode;
}

export function ModuleLayout({ module, children }: ModuleLayoutProps) {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mb-4">
          <Link href="/dashboard" className="hover:text-[var(--foreground)] transition-colors">
            Dashboard
          </Link>
          <Icon name="chevronRight" className="w-4 h-4" />
          <span className="text-[var(--foreground)]">{module.title}</span>
        </div>

        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: module.color + "15" }}
          >
            <ModuleIcon
              moduleId={module.id}
              className="w-7 h-7"
              style={{ color: module.color }}
            />
          </motion.div>
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-[var(--foreground)]"
            >
              {module.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[var(--foreground-secondary)] text-sm max-w-xl"
            >
              {module.description}
            </motion.p>
          </div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-4 mt-6 p-4 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)]"
        >
          {module.metrics.map((metric, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-[var(--foreground-muted)]">{metric.label}</p>
                <p className="text-lg font-bold text-[var(--foreground)] tabular-nums">
                  {metric.value}
                  {metric.unit && (
                    <span className="text-sm font-normal text-[var(--foreground-muted)] ml-1">
                      {metric.unit}
                    </span>
                  )}
                </p>
              </div>
              {metric.trend && (
                <Badge variant={metric.trend === "up" ? "success" : metric.trend === "down" ? "danger" : "secondary"}>
                  {metric.trend === "up" && <Icon name="trendingUp" className="w-3 h-3 mr-1" />}
                  {metric.trend === "down" && <Icon name="trendingDown" className="w-3 h-3 mr-1" />}
                  {metric.trendValue}
                </Badge>
              )}
              {index < module.metrics.length - 1 && (
                <div className="h-8 w-px bg-[var(--border)] ml-4" />
              )}
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Icon name="zap" className="w-5 h-5 text-[var(--accent)]" />
            <span className="text-sm text-[var(--foreground)]">
              <span className="font-semibold text-[var(--accent)]">{module.quickWinsCount}</span> quick wins available
            </span>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
