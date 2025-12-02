"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CitySelector } from "@/components/dashboard/CitySelector";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { QuickWinsSummary } from "@/components/dashboard/QuickWinsSummary";
import { StatCard } from "@/components/dashboard/StatCard";
import { modules, cities } from "@/data/modules";
import { dashboardStats, cityStats } from "@/data/dashboard";

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {(cityStats[selectedCity] || dashboardStats).map((stat, index) => (
          <StatCard key={stat.label} stat={stat} index={index} />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Modules grid - takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Modules</h2>
            <Link href="/dashboard/quick-wins" className="text-sm text-[var(--accent)] hover:underline">
              View all
            </Link>
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
