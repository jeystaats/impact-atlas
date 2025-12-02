"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CitySelector } from "@/components/dashboard/CitySelector";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { QuickWinsSummary } from "@/components/dashboard/QuickWinsSummary";
import { Icon } from "@/components/ui/icons";
import { modules, cities } from "@/data/modules";

export default function DashboardPage() {
  const [selectedCity, setSelectedCity] = useState(cities[0].id);
  const currentCity = cities.find((c) => c.id === selectedCity) || cities[0];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]"
          >
            Welcome back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--foreground-secondary)] mt-1"
          >
            Here's what's happening in {currentCity.name}
          </motion.p>
        </div>
        <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
      </div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: "Active Modules", value: "6", icon: "dashboard" as const, color: "var(--accent)" },
          { label: "Quick Wins", value: "57", icon: "zap" as const, color: "#10B981" },
          { label: "Hotspots", value: "142", icon: "target" as const, color: "#F59E0B" },
          { label: "AI Insights", value: "28", icon: "sparkles" as const, color: "#8B5CF6" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="p-4 lg:p-6 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)]"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: stat.color + "15" }}
              >
                <Icon name={stat.icon} className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xs text-[var(--foreground-muted)]">{stat.label}</p>
                <p className="text-xl lg:text-2xl font-bold text-[var(--foreground)] tabular-nums">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Modules grid - takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Modules</h2>
            <button className="text-sm text-[var(--accent)] hover:underline">
              View all
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {modules.map((module, index) => (
              <ModuleCard key={module.id} module={module} index={index} />
            ))}
          </div>
        </div>

        {/* Sidebar - Quick Wins Summary */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Quick Wins</h2>
          <QuickWinsSummary />

          {/* Recent activity */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-wider mb-3">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                { action: "New heat island detected", module: "Urban Heat", time: "2 min ago" },
                { action: "Plastic forecast updated", module: "Coastal Plastic", time: "15 min ago" },
                { action: "Port emissions spike", module: "Port Emissions", time: "1 hr ago" },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)]"
                >
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--foreground)]">{activity.action}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {activity.module} • {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
