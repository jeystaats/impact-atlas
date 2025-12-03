import { FileEdit, Play, CheckCircle2 } from "lucide-react";
import { modules as fallbackModules } from "@/data/modules";
import type { PlanStatus, NormalizedActionPlan } from "./types";

// Status configuration
export const statusConfig: Record<
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
export const priorityColors = {
  low: "#6B7280",
  medium: "#F59E0B",
  high: "#EF4444",
};

// Module color lookup from fallback data
export const moduleColorMap = fallbackModules.reduce(
  (acc, m) => {
    acc[m.id] = { title: m.title, color: m.color };
    return acc;
  },
  {} as Record<string, { title: string; color: string }>
);

// Animation variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants = {
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

// Mock data for fallback
export const mockActionPlans: NormalizedActionPlan[] = [
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
    linkedModules: [
      { id: "port-emissions", title: "Port Emissions", color: "#F59E0B" },
    ],
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
