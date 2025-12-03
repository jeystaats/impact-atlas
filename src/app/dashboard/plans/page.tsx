"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Plus, Sparkles } from "lucide-react";
import { useMyActionPlans, useUpdateActionPlanStatus } from "@/hooks/useConvex";
import { useSelectedCity } from "@/hooks/useSelectedCity";
import { useUIStore } from "@/stores/useUIStore";
import { useHydration } from "@/hooks/useHydration";
import { ActionPlanModal } from "@/components/dashboard/ActionPlanModal";
import {
  AISuggestionModal,
  defaultAISuggestion,
} from "@/components/modals/AISuggestionModal";
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";
import {
  ActionPlanCard,
  CreatePlanCard,
  EmptyState,
  StatsSummary,
  FilterTabs,
  containerVariants,
  moduleColorMap,
  mockActionPlans,
} from "@/components/plans";
import type {
  PlanStatus,
  NormalizedActionPlan,
  LinkedModule,
  EditPlanData,
} from "@/components/plans";
import { Id } from "../../../../convex/_generated/dataModel";

export default function ActionPlansPage() {
  const { selectedCityId } = useSelectedCity();
  const { actionPlansFilters, setActionPlansFilter } = useUIStore();
  const isHydrated = useHydration();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<EditPlanData | undefined>(undefined);

  // AI Suggestion banner state
  const [showAISuggestion, setShowAISuggestion] = useState(true);
  const [isAISuggestionModalOpen, setIsAISuggestionModalOpen] = useState(false);

  // Use persisted filter after hydration, default to "all" during SSR
  const activeFilter = isHydrated ? actionPlansFilters.statusFilter : "all";

  // Fetch action plans from Convex
  const convexPlans = useMyActionPlans({ cityId: selectedCityId });
  const updateStatus = useUpdateActionPlanStatus();

  // Local state for optimistic updates (when using mock data)
  const [localPlans, setLocalPlans] =
    useState<NormalizedActionPlan[]>(mockActionPlans);

  // Open modal for creating new plan
  const handleCreatePlan = () => {
    setEditPlan(undefined);
    setIsModalOpen(true);
  };

  // Open modal for editing existing plan
  const handleEditPlan = (plan: NormalizedActionPlan) => {
    if (plan.convexId) {
      setEditPlan({
        id: plan.convexId,
        title: plan.title,
        description: plan.description,
        priority: plan.priority,
        targetDate: plan.dueDate ? new Date(plan.dueDate).getTime() : undefined,
        quickWinIds: [], // Will be loaded in modal
        notes: undefined,
      });
      setIsModalOpen(true);
    }
  };

  // Default due date (30 days from now) - use state to compute once on mount
  const [defaultDueDate] = useState(() => {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
  });

  // Normalize Convex plans to component format
  const plans: NormalizedActionPlan[] = useMemo(() => {
    if (convexPlans && convexPlans.length > 0) {
      return convexPlans.map(
        (plan: {
          _id: Id<"actionPlans">;
          title: string;
          description?: string;
          status: string;
          progress: number;
          targetDate?: number;
          moduleIds?: string[];
          quickWinIds?: string[];
          createdAt: number;
          priority: "low" | "medium" | "high";
        }) => {
          // Map moduleIds to linked modules with colors
          const linkedModules: LinkedModule[] = (plan.moduleIds || []).map(
            (moduleId: string) => {
              const moduleInfo = moduleColorMap[moduleId];
              return {
                id: moduleId,
                title:
                  moduleInfo?.title ||
                  moduleId
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l: string) => l.toUpperCase()),
                color: moduleInfo?.color || "#6B7280",
              };
            }
          );

          // Handle status - archived maps to completed for display
          const displayStatus: PlanStatus =
            plan.status === "archived"
              ? "completed"
              : (plan.status as PlanStatus);

          return {
            id: plan._id,
            convexId: plan._id,
            title: plan.title,
            description: plan.description || "",
            status: displayStatus,
            progress: plan.progress,
            dueDate: plan.targetDate
              ? new Date(plan.targetDate).toISOString().split("T")[0]
              : defaultDueDate,
            linkedModules,
            quickWinsCount: plan.quickWinIds?.length || 0,
            createdAt: new Date(plan.createdAt).toISOString().split("T")[0],
            priority: plan.priority,
          };
        }
      );
    }
    return localPlans;
  }, [convexPlans, localPlans, defaultDueDate]);

  const handleStatusChange = async (
    id: string,
    newStatus: PlanStatus,
    convexId?: Id<"actionPlans">
  ) => {
    const plan = plans.find((p) => p.id === id);
    const statusLabels: Record<PlanStatus, string> = {
      draft: "Draft",
      active: "Active",
      completed: "Completed",
    };

    // Track analytics
    if (newStatus === "completed") {
      trackEvent(AnalyticsEvents.PLAN_COMPLETE, {
        planId: id,
        title: plan?.title,
      });
    } else {
      trackEvent(AnalyticsEvents.PLAN_UPDATE, {
        planId: id,
        newStatus,
      });
    }

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
          onClick={handleCreatePlan}
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
        <EmptyState onCreatePlan={handleCreatePlan} />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <CreatePlanCard onClick={handleCreatePlan} />
          <AnimatePresence mode="popLayout">
            {filteredPlans.map((plan, index) => (
              <ActionPlanCard
                key={plan.id}
                plan={plan}
                onStatusChange={handleStatusChange}
                onEdit={handleEditPlan}
                index={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* AI Suggestion Banner */}
      <AnimatePresence>
        {showAISuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, height: 0, marginTop: 0, padding: 0 }}
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
                    Based on your quick wins, we suggest creating a &quot;Green
                    Corridor Initiative&quot; combining biodiversity and heat
                    mitigation.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 lg:ml-auto">
                <button
                  onClick={() => {
                    setShowAISuggestion(false);
                    toast.success("Suggestion dismissed", {
                      description:
                        "You can find more suggestions in the AI insights panel.",
                    });
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-colors"
                >
                  Dismiss
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    trackEvent(AnalyticsEvents.COPILOT_SUGGESTION, {
                      suggestionType: "ai_plan_recommendation",
                      action: "view",
                    });
                    setIsAISuggestionModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-white"
                >
                  View Suggestion
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Plan Modal */}
      <ActionPlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditPlan(undefined);
        }}
        editPlan={editPlan}
      />

      {/* AI Suggestion Modal */}
      <AISuggestionModal
        isOpen={isAISuggestionModalOpen}
        onClose={() => setIsAISuggestionModalOpen(false)}
        suggestion={defaultAISuggestion}
        onCreatePlan={() => {
          // Close the AI suggestion modal and open the create plan modal pre-filled
          setIsAISuggestionModalOpen(false);
          setShowAISuggestion(false);
          setEditPlan(undefined);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
}
