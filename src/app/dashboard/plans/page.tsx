"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Icon, ModuleIcon } from "@/components/ui/icons";
import {
  Plus,
  Calendar,
  ChevronRight,
  Layers,
  CheckCircle2,
  FileEdit,
  Play,
  Sparkles,
} from "lucide-react";
import { useMyActionPlans, useUpdateActionPlanStatus } from "@/hooks/useConvex";
import { useSelectedCity } from "@/hooks/useSelectedCity";
import { modules as fallbackModules } from "@/data/modules";
import { Id } from "../../../../convex/_generated/dataModel";
import { useUIStore } from "@/stores/useUIStore";

// Types
type PlanStatus = "draft" | "active" | "completed";

interface LinkedModule {
  id: string;
  title: string;
  color: string;
}

interface NormalizedActionPlan {
  id: string;
  convexId?: Id<"actionPlans">;
  title: string;
  description: string;
  status: PlanStatus;
  progress: number;
  dueDate: string;
  linkedModules: LinkedModule[];
  quickWinsCount: number;
  createdAt: string;
  priority: "low" | "medium" | "high";
}

// Mock data for fallback
const mockActionPlans: NormalizedActionPlan[] = [
  {
    id: "plan-1",
    title: "Downtown Heat Mitigation Strategy",
    description:
      "Comprehensive plan to reduce urban heat island effect in the central business district through strategic tree planting and cool roof initiatives.",
    status: "active",
    progress: 68,
    dueDate: "2024-03-15",
    linkedModules: [
      { id: "urban-heat", title: "Urban Heat", color: "#EF4444" },
      { id: "biodiversity", title: "Biodiversity", color: "#10B981" },
    ],
    quickWinsCount: 12,
    createdAt: "2024-01-10",
    priority: "high",
  },
  {
    id: "plan-2",
    title: "Harbor Plastic Prevention Initiative",
    description:
      "Multi-phase approach to intercept plastic waste before it reaches open waters, including boom deployment and community engagement.",
    status: "active",
    progress: 42,
    dueDate: "2024-04-30",
    linkedModules: [
      { id: "coastal-plastic", title: "Coastal Plastic", color: "#3B82F6" },
      { id: "ocean-plastic", title: "Ocean Classifier", color: "#8B5CF6" },
    ],
    quickWinsCount: 8,
    createdAt: "2024-01-15",
    priority: "medium",
  },
  {
    id: "plan-3",
    title: "Port Decarbonization Roadmap",
    description:
      "Strategic transition plan for reducing port emissions by 50% through electrification and operational efficiency improvements.",
    status: "draft",
    progress: 15,
    dueDate: "2024-06-01",
    linkedModules: [{ id: "port-emissions", title: "Port Emissions", color: "#F59E0B" }],
    quickWinsCount: 5,
    createdAt: "2024-02-01",
    priority: "high",
  },
  {
    id: "plan-4",
    title: "Wetland Restoration Project",
    description:
      "Ecological restoration of coastal wetlands to enhance biodiversity, improve water quality, and create natural carbon sinks.",
    status: "completed",
    progress: 100,
    dueDate: "2024-01-30",
    linkedModules: [
      { id: "restoration", title: "Restoration", color: "#84CC16" },
      { id: "biodiversity", title: "Biodiversity", color: "#10B981" },
    ],
    quickWinsCount: 11,
    createdAt: "2023-10-15",
    priority: "medium",
  },
];

// Module color lookup from fallback data
const moduleColorMap = fallbackModules.reduce((acc, m) => {
  acc[m.id] = { title: m.title, color: m.color };
  return acc;
}, {} as Record<string, { title: string; color: string }>);

// Status configuration
const statusConfig: Record<
  PlanStatus,
  { label: string; color: string; bgColor: string; icon: typeof FileEdit }
> = {
  draft: {
    label: "Draft",
    color: "var(--foreground-muted)",
    bgColor: "var(--background-secondary)",
    icon: FileEdit,
  },
  active: {
    label: "Active",
    color: "var(--accent)",
    bgColor: "var(--teal-glow)",
    icon: Play,
  },
  completed: {
    label: "Completed",
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.15)",
    icon: CheckCircle2,
  },
};

// Priority colors
const priorityColors = {
  low: "#6B7280",
  medium: "#F59E0B",
  high: "#EF4444",
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

// Progress Ring Component
function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 4,
  color = "var(--accent)",
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-[var(--foreground)] tabular-nums">
          {progress}%
        </span>
      </div>
    </div>
  );
}

// Status Dropdown Component
function StatusDropdown({
  status,
  onStatusChange,
}: {
  status: PlanStatus;
  onStatusChange: (status: PlanStatus) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors"
        style={{
          backgroundColor: config.bgColor,
          color: config.color,
        }}
      >
        <StatusIcon className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">{config.label}</span>
        <ChevronRight
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute right-0 top-full mt-2 z-50 w-36 py-1 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] shadow-xl overflow-hidden"
            >
              {(Object.keys(statusConfig) as PlanStatus[]).map((s) => {
                const cfg = statusConfig[s];
                const IconComponent = cfg.icon;
                return (
                  <motion.button
                    key={s}
                    whileHover={{ backgroundColor: "var(--background-tertiary)" }}
                    onClick={() => {
                      onStatusChange(s);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                      s === status ? "bg-[var(--background-tertiary)]" : ""
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                    <span className="text-sm text-[var(--foreground)]">{cfg.label}</span>
                    {s === status && (
                      <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-[var(--accent)]" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Action Plan Card Component
function ActionPlanCard({
  plan,
  onStatusChange,
  index,
}: {
  plan: NormalizedActionPlan;
  onStatusChange: (id: string, status: PlanStatus, convexId?: Id<"actionPlans">) => void;
  index: number;
}) {
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

      <div className="relative p-6 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] hover:border-[var(--stone)] transition-all duration-300">
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
            onStatusChange={(status) => onStatusChange(plan.id, status, plan.convexId)}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Create New Plan Card
function CreatePlanCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative cursor-pointer"
    >
      <motion.div
        className="absolute -inset-px rounded-xl"
        animate={{
          background: isHovered
            ? "linear-gradient(135deg, var(--teal) 0%, var(--teal-light) 100%)"
            : "linear-gradient(135deg, var(--slate) 0%, var(--graphite) 100%)",
        }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        className="relative h-full min-h-[280px] p-6 rounded-xl border border-transparent flex flex-col items-center justify-center gap-4 text-center"
        style={{
          background: "var(--background-tertiary)",
        }}
        animate={{
          background: isHovered
            ? "linear-gradient(135deg, var(--graphite) 0%, var(--charcoal) 100%)"
            : "var(--background-tertiary)",
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          animate={{
            backgroundColor: isHovered ? "var(--teal-glow-strong)" : "var(--background-secondary)",
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 90 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Plus
            className="w-8 h-8 transition-colors duration-300"
            style={{ color: isHovered ? "var(--accent)" : "var(--foreground-muted)" }}
          />
        </motion.div>

        <div>
          <motion.h3
            className="text-lg font-semibold mb-1"
            animate={{
              color: isHovered ? "var(--foreground)" : "var(--foreground-secondary)",
            }}
            transition={{ duration: 0.2 }}
          >
            Create New Plan
          </motion.h3>
          <motion.p
            className="text-sm"
            animate={{
              color: isHovered ? "var(--foreground-secondary)" : "var(--foreground-muted)",
            }}
            transition={{ duration: 0.2 }}
          >
            Combine quick wins into a strategic action plan
          </motion.p>
        </div>

        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          animate={{
            backgroundColor: isHovered ? "var(--accent)" : "var(--background-secondary)",
            color: isHovered ? "white" : "var(--foreground-secondary)",
          }}
          transition={{ duration: 0.2 }}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI-Assisted</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
        className="w-24 h-24 rounded-3xl bg-[var(--background-tertiary)] border border-[var(--border)] flex items-center justify-center mb-6"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          <Layers className="w-12 h-12 text-[var(--foreground-muted)]" />
        </motion.div>
      </motion.div>

      <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
        No Action Plans Yet
      </h2>
      <p className="text-[var(--foreground-secondary)] max-w-md mb-8">
        Action plans help you organize quick wins into comprehensive strategies.
        Create your first plan to start making measurable climate impact.
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-medium shadow-lg"
        style={{
          boxShadow: "0 8px 32px var(--teal-glow)",
        }}
      >
        <Plus className="w-5 h-5" />
        Create Your First Plan
      </motion.button>
    </motion.div>
  );
}

// Stats Summary Component
function StatsSummary({ plans }: { plans: NormalizedActionPlan[] }) {
  const stats = [
    {
      label: "Total Plans",
      value: plans.length,
      icon: Layers,
      color: "var(--accent)",
    },
    {
      label: "Active",
      value: plans.filter((p) => p.status === "active").length,
      icon: Play,
      color: "var(--accent-light)",
    },
    {
      label: "Completed",
      value: plans.filter((p) => p.status === "completed").length,
      icon: CheckCircle2,
      color: "#10B981",
    },
    {
      label: "Quick Wins",
      value: plans.reduce((sum, p) => sum + p.quickWinsCount, 0),
      icon: Icon,
      iconName: "zap" as const,
      color: "#F59E0B",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + index * 0.05 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="p-4 lg:p-5 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] transition-colors hover:border-[var(--stone)]"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              {stat.iconName ? (
                <Icon name={stat.iconName} className="w-5 h-5" style={{ color: stat.color }} />
              ) : (
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              )}
            </div>
            <div>
              <p className="text-xs text-[var(--foreground-muted)]">{stat.label}</p>
              <motion.p
                className="text-xl lg:text-2xl font-bold text-[var(--foreground)] tabular-nums"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                {stat.value}
              </motion.p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Filter Tabs Component
function FilterTabs({
  activeFilter,
  onFilterChange,
  counts,
}: {
  activeFilter: "all" | PlanStatus;
  onFilterChange: (filter: "all" | PlanStatus) => void;
  counts: Record<"all" | PlanStatus, number>;
}) {
  const filters: { key: "all" | PlanStatus; label: string }[] = [
    { key: "all", label: "All Plans" },
    { key: "active", label: "Active" },
    { key: "draft", label: "Drafts" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <motion.button
          key={filter.key}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onFilterChange(filter.key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeFilter === filter.key
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
          }`}
        >
          {filter.label}
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              activeFilter === filter.key
                ? "bg-white/20"
                : "bg-[var(--background-secondary)]"
            }`}
          >
            {counts[filter.key]}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

// Main Page Component
export default function ActionPlansPage() {
  const { selectedCityId } = useSelectedCity();
  const { actionPlansFilters, setActionPlansFilter } = useUIStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Use persisted filter after hydration, default to "all" during SSR
  const activeFilter = isHydrated ? actionPlansFilters.statusFilter : "all";

  // Fetch action plans from Convex
  const convexPlans = useMyActionPlans({ cityId: selectedCityId });
  const updateStatus = useUpdateActionPlanStatus();

  // Local state for optimistic updates (when using mock data)
  const [localPlans, setLocalPlans] = useState<NormalizedActionPlan[]>(mockActionPlans);

  // Normalize Convex plans to component format
  const plans: NormalizedActionPlan[] = useMemo(() => {
    if (convexPlans && convexPlans.length > 0) {
      return convexPlans.map((plan: { _id: Id<"actionPlans">; title: string; description?: string; status: string; progress: number; targetDate?: number; moduleIds?: string[]; quickWinIds?: string[]; createdAt: number; priority: "low" | "medium" | "high" }) => {
        // Map moduleIds to linked modules with colors
        const linkedModules: LinkedModule[] = (plan.moduleIds || []).map((moduleId: string) => {
          const moduleInfo = moduleColorMap[moduleId];
          return {
            id: moduleId,
            title: moduleInfo?.title || moduleId.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
            color: moduleInfo?.color || "#6B7280",
          };
        });

        // Handle status - archived maps to completed for display
        const displayStatus: PlanStatus = plan.status === "archived" ? "completed" : plan.status as PlanStatus;

        return {
          id: plan._id,
          convexId: plan._id,
          title: plan.title,
          description: plan.description || "",
          status: displayStatus,
          progress: plan.progress,
          dueDate: plan.targetDate
            ? new Date(plan.targetDate).toISOString().split("T")[0]
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          linkedModules,
          quickWinsCount: plan.quickWinIds?.length || 0,
          createdAt: new Date(plan.createdAt).toISOString().split("T")[0],
          priority: plan.priority,
        };
      });
    }
    return localPlans;
  }, [convexPlans, localPlans]);

  const handleStatusChange = async (id: string, newStatus: PlanStatus, convexId?: Id<"actionPlans">) => {
    const plan = plans.find(p => p.id === id);
    const statusLabels: Record<PlanStatus, string> = {
      draft: "Draft",
      active: "Active",
      completed: "Completed",
    };

    // If we have a Convex ID, update via Convex
    if (convexId) {
      try {
        await updateStatus({ planId: convexId, status: newStatus });
        if (newStatus === "completed") {
          toast.success("Plan completed!", {
            description: plan?.title,
            icon: "🎉",
          });
        } else {
          toast.success(`Status updated to ${statusLabels[newStatus]}`, {
            description: plan?.title,
          });
        }
      } catch (error) {
        console.error("Failed to update plan status:", error);
        toast.error("Failed to update plan status", {
          description: "Please try again.",
        });
      }
    } else {
      // Fallback: update local state
      setLocalPlans((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status: newStatus,
                progress: newStatus === "completed" ? 100 : p.progress,
              }
            : p
        )
      );
      if (newStatus === "completed") {
        toast.success("Plan completed!", {
          description: plan?.title,
          icon: "🎉",
        });
      } else {
        toast.success(`Status updated to ${statusLabels[newStatus]}`, {
          description: plan?.title,
        });
      }
    }
  };

  const filteredPlans =
    activeFilter === "all"
      ? plans
      : plans.filter((p) => p.status === activeFilter);

  const counts = {
    all: plans.length,
    draft: plans.filter((p) => p.status === "draft").length,
    active: plans.filter((p) => p.status === "active").length,
    completed: plans.filter((p) => p.status === "completed").length,
  };

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
            Action Plans
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--foreground-secondary)] mt-1"
          >
            Strategic initiatives combining quick wins for maximum impact
          </motion.p>
        </div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white font-medium shadow-lg self-start lg:self-auto"
          style={{
            boxShadow: "0 4px 20px var(--teal-glow)",
          }}
        >
          <Plus className="w-5 h-5" />
          New Plan
        </motion.button>
      </div>

      {/* Stats Summary */}
      <StatsSummary plans={plans} />

      {/* Filter Tabs */}
      <FilterTabs
        activeFilter={activeFilter}
        onFilterChange={setActionPlansFilter}
        counts={counts}
      />

      {/* Plans Grid or Empty State */}
      {plans.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <CreatePlanCard />
          <AnimatePresence mode="popLayout">
            {filteredPlans.map((plan, index) => (
              <ActionPlanCard
                key={plan.id}
                plan={plan}
                onStatusChange={handleStatusChange}
                index={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* AI Suggestion Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 p-6 rounded-xl border border-[var(--border)] bg-gradient-to-r from-[var(--background-tertiary)] to-[var(--background-secondary)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px var(--teal-glow)",
                  "0 0 40px var(--teal-glow-strong)",
                  "0 0 20px var(--teal-glow)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 rounded-xl bg-[var(--teal-glow-strong)] flex items-center justify-center"
            >
              <Sparkles className="w-6 h-6 text-[var(--accent)]" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">
                AI Recommendation Available
              </h3>
              <p className="text-sm text-[var(--foreground-secondary)]">
                Based on your quick wins, we suggest creating a "Green Corridor
                Initiative" combining biodiversity and heat mitigation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 lg:ml-auto">
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-colors">
              Dismiss
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-white"
            >
              View Suggestion
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
