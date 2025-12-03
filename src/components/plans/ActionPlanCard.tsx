"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, Layers } from "lucide-react";
import { Icon, ModuleIcon } from "@/components/ui/icons";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StatusDropdown } from "./StatusDropdown";
import { statusConfig, priorityColors, itemVariants } from "./constants";
import type { NormalizedActionPlan, PlanStatus } from "./types";
import { Id } from "../../../convex/_generated/dataModel";

interface ActionPlanCardProps {
  plan: NormalizedActionPlan;
  onStatusChange: (
    id: string,
    status: PlanStatus,
    convexId?: Id<"actionPlans">
  ) => void;
  onEdit: (plan: NormalizedActionPlan) => void;
  index: number;
}

export function ActionPlanCard({
  plan,
  onStatusChange,
  onEdit,
  index,
}: ActionPlanCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = statusConfig[plan.status];

  const formattedDueDate = new Date(plan.dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isOverdue =
    plan.status !== "completed" && new Date(plan.dueDate) < new Date();

  return (
    <motion.div
      variants={itemVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${config.color}20, transparent 50%)`,
        }}
      />

      <div
        onClick={() => onEdit(plan)}
        className="relative p-6 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] hover:border-[var(--stone)] transition-all duration-300 cursor-pointer"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {/* Priority indicator */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05, type: "spring" }}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: priorityColors[plan.priority] }}
              />
              <h3 className="text-lg font-semibold text-[var(--foreground)] truncate">
                {plan.title}
              </h3>
            </div>
            <p className="text-sm text-[var(--foreground-secondary)] line-clamp-2">
              {plan.description}
            </p>
          </div>

          <ProgressRing
            progress={plan.progress}
            color={plan.status === "completed" ? "#10B981" : "var(--accent)"}
          />
        </div>

        {/* Linked Modules */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Layers className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
          {plan.linkedModules.map((module) => (
            <motion.div
              key={module.id}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs"
              style={{ backgroundColor: `${module.color}15` }}
            >
              <ModuleIcon
                moduleId={module.id}
                className="w-3 h-3"
                style={{ color: module.color }}
              />
              <span style={{ color: module.color }}>{module.title}</span>
            </motion.div>
          ))}
        </div>

        {/* Quick Wins Badge */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + index * 0.05 }}
          className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-[var(--background-secondary)]"
        >
          <div className="flex items-center gap-1.5">
            <Icon name="zap" className="w-4 h-4 text-[#10B981]" />
            <span className="text-sm font-medium text-[var(--foreground)]">
              {plan.quickWinsCount} Quick Wins
            </span>
          </div>
          <div className="flex-1" />
          <motion.div
            animate={isHovered ? { x: 4 } : { x: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)]" />
          </motion.div>
        </motion.div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Calendar
                className={`w-3.5 h-3.5 ${isOverdue ? "text-[#EF4444]" : "text-[var(--foreground-muted)]"}`}
              />
              <span
                className={`text-xs ${isOverdue ? "text-[#EF4444] font-medium" : "text-[var(--foreground-muted)]"}`}
              >
                {isOverdue ? "Overdue: " : "Due "}
                {formattedDueDate}
              </span>
            </div>
          </div>

          <StatusDropdown
            status={plan.status}
            onStatusChange={(status) =>
              onStatusChange(plan.id, status, plan.convexId)
            }
          />
        </div>
      </div>
    </motion.div>
  );
}
