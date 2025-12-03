"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Icon, ModuleIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import {
  useCreateActionPlan,
  useUpdateActionPlan,
  useDeleteActionPlan,
  useQuickWins,
  useModules,
} from "@/hooks/useConvex";
import { useSelectedCity } from "@/hooks/useSelectedCity";
import { Id } from "../../../convex/_generated/dataModel";

// Types
type Priority = "low" | "medium" | "high";

interface ActionPlanFormData {
  title: string;
  description: string;
  priority: Priority;
  targetDate: string;
  selectedQuickWinIds: Id<"quickWins">[];
  notes: string;
}

interface ActionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  editPlan?: {
    id: Id<"actionPlans">;
    title: string;
    description?: string;
    priority: Priority;
    targetDate?: number;
    quickWinIds: Id<"quickWins">[];
    notes?: string;
  };
}

// Priority config
const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string }> = {
  low: { label: "Low", color: "#6B7280", bgColor: "rgba(107, 114, 128, 0.15)" },
  medium: { label: "Medium", color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.15)" },
  high: { label: "High", color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.15)" },
};

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

export function ActionPlanModal({ isOpen, onClose, editPlan }: ActionPlanModalProps) {
  const { selectedCityId } = useSelectedCity();
  const createPlan = useCreateActionPlan();
  const updatePlan = useUpdateActionPlan();
  const deletePlan = useDeleteActionPlan();

  // Fetch available quick wins and modules
  const quickWins = useQuickWins({ cityId: selectedCityId });
  const modules = useModules();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "quickwins">("details");

  // Form state
  const [formData, setFormData] = useState<ActionPlanFormData>({
    title: "",
    description: "",
    priority: "medium",
    targetDate: "",
    selectedQuickWinIds: [],
    notes: "",
  });

  // Reset form when modal opens/closes or edit plan changes
  useEffect(() => {
    if (isOpen) {
      if (editPlan) {
        setFormData({
          title: editPlan.title,
          description: editPlan.description || "",
          priority: editPlan.priority,
          targetDate: editPlan.targetDate
            ? new Date(editPlan.targetDate).toISOString().split("T")[0]
            : "",
          selectedQuickWinIds: editPlan.quickWinIds,
          notes: editPlan.notes || "",
        });
      } else {
        setFormData({
          title: "",
          description: "",
          priority: "medium",
          targetDate: "",
          selectedQuickWinIds: [],
          notes: "",
        });
      }
      setActiveTab("details");
      setShowDeleteConfirm(false);
    }
  }, [isOpen, editPlan]);

  // Group quick wins by module
  const quickWinsByModule = useMemo(() => {
    if (!quickWins || !modules) return {};

    const grouped: Record<string, { module: { slug: string; name: string; color: string }; wins: typeof quickWins }> = {};

    for (const win of quickWins) {
      const module = modules.find((m: { _id: Id<"modules"> }) => m._id === win.moduleId);
      if (!module) continue;

      if (!grouped[module.slug]) {
        grouped[module.slug] = {
          module: { slug: module.slug, name: module.name, color: module.color },
          wins: [],
        };
      }
      grouped[module.slug].wins.push(win);
    }

    return grouped;
  }, [quickWins, modules]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!selectedCityId) {
      toast.error("Please select a city first");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editPlan) {
        // Update existing plan
        await updatePlan({
          planId: editPlan.id,
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          targetDate: formData.targetDate ? new Date(formData.targetDate).getTime() : undefined,
          notes: formData.notes || undefined,
        });
        toast.success("Action plan updated!", {
          description: formData.title,
        });
      } else {
        // Create new plan
        await createPlan({
          cityId: selectedCityId,
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          quickWinIds: formData.selectedQuickWinIds.length > 0 ? formData.selectedQuickWinIds : undefined,
          targetDate: formData.targetDate ? new Date(formData.targetDate).getTime() : undefined,
          notes: formData.notes || undefined,
        });
        toast.success("Action plan created!", {
          description: formData.title,
          icon: "🎯",
        });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save action plan:", error);
      toast.error(editPlan ? "Failed to update plan" : "Failed to create plan", {
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!editPlan) return;

    setIsDeleting(true);
    try {
      await deletePlan({ planId: editPlan.id });
      toast.success("Action plan deleted", {
        description: editPlan.title,
      });
      onClose();
    } catch (error) {
      console.error("Failed to delete action plan:", error);
      toast.error("Failed to delete plan", {
        description: "Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Toggle quick win selection
  const toggleQuickWin = (winId: Id<"quickWins">) => {
    setFormData((prev) => ({
      ...prev,
      selectedQuickWinIds: prev.selectedQuickWinIds.includes(winId)
        ? prev.selectedQuickWinIds.filter((id) => id !== winId)
        : [...prev.selectedQuickWinIds, winId],
    }));
  };

  const isEditing = !!editPlan;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-4 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-2xl lg:max-h-[85vh] z-50 flex flex-col rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center">
                  <Icon name="target" className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">
                    {isEditing ? "Edit Action Plan" : "Create Action Plan"}
                  </h2>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {isEditing ? "Update your plan details" : "Combine quick wins into a strategic plan"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Icon name="x" className="w-5 h-5 text-[var(--foreground-muted)]" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--border)]">
              <button
                onClick={() => setActiveTab("details")}
                className={cn(
                  "flex-1 px-4 py-3 text-sm font-medium transition-colors relative",
                  activeTab === "details"
                    ? "text-[var(--accent)]"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                )}
              >
                Plan Details
                {activeTab === "details" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("quickwins")}
                className={cn(
                  "flex-1 px-4 py-3 text-sm font-medium transition-colors relative",
                  activeTab === "quickwins"
                    ? "text-[var(--accent)]"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                )}
              >
                Quick Wins ({formData.selectedQuickWinIds.length})
                {activeTab === "quickwins" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]"
                  />
                )}
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === "details" ? (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-5"
                  >
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                        Plan Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Downtown Heat Mitigation Strategy"
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the goals and scope of this action plan..."
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none"
                      />
                    </div>

                    {/* Priority & Target Date row */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Priority */}
                      <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                          Priority
                        </label>
                        <div className="flex gap-2">
                          {(["low", "medium", "high"] as Priority[]).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, priority: p }))}
                              className={cn(
                                "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                                formData.priority === p
                                  ? "text-white"
                                  : "bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] hover:bg-[var(--border)] border border-[var(--border)]"
                              )}
                              style={
                                formData.priority === p
                                  ? { backgroundColor: priorityConfig[p].color }
                                  : {}
                              }
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Target Date */}
                      <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                          Target Date
                        </label>
                        <input
                          type="date"
                          value={formData.targetDate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, targetDate: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                        Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any additional notes or considerations..."
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none"
                      />
                    </div>

                    {/* Delete section for edit mode */}
                    {isEditing && (
                      <div className="pt-4 border-t border-[var(--border)]">
                        {showDeleteConfirm ? (
                          <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                            <p className="text-sm text-red-400">Are you sure you want to delete this plan?</p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                              >
                                {isDeleting ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Icon name="trash" className="w-4 h-4" />
                            Delete this plan
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="quickwins"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-6"
                  >
                    <p className="text-sm text-[var(--foreground-muted)] mb-4">
                      Select quick wins to include in this action plan
                    </p>

                    {Object.keys(quickWinsByModule).length === 0 ? (
                      <div className="text-center py-8">
                        <Icon name="zap" className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-3" />
                        <p className="text-[var(--foreground-muted)]">No quick wins available</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(quickWinsByModule).map(([, { module, wins }]) => (
                          <div key={module.slug}>
                            <div className="flex items-center gap-2 mb-2">
                              <ModuleIcon
                                moduleId={module.slug}
                                className="w-4 h-4"
                                style={{ color: module.color }}
                              />
                              <span className="text-sm font-medium text-[var(--foreground)]">
                                {module.name}
                              </span>
                              <span className="text-xs text-[var(--foreground-muted)]">
                                ({wins.length})
                              </span>
                            </div>
                            <div className="space-y-2 pl-6">
                              {wins.map((win: { _id: Id<"quickWins">; title: string; impact: string }) => {
                                const isSelected = formData.selectedQuickWinIds.includes(win._id);
                                return (
                                  <button
                                    key={win._id}
                                    type="button"
                                    onClick={() => toggleQuickWin(win._id)}
                                    className={cn(
                                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all",
                                      isSelected
                                        ? "bg-[var(--accent-bg)] border border-[var(--accent)]"
                                        : "bg-[var(--background-tertiary)] border border-[var(--border)] hover:border-[var(--foreground-muted)]"
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all",
                                        isSelected
                                          ? "bg-[var(--accent)] border-[var(--accent)]"
                                          : "border-[var(--border)]"
                                      )}
                                    >
                                      {isSelected && (
                                        <Icon name="success" className="w-3 h-3 text-white" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-[var(--foreground)] truncate">
                                        {win.title}
                                      </p>
                                    </div>
                                    <span
                                      className="text-xs px-2 py-0.5 rounded capitalize"
                                      style={{
                                        backgroundColor:
                                          win.impact === "high"
                                            ? "rgba(16, 185, 129, 0.15)"
                                            : win.impact === "medium"
                                            ? "rgba(245, 158, 11, 0.15)"
                                            : "rgba(107, 114, 128, 0.15)",
                                        color:
                                          win.impact === "high"
                                            ? "#10B981"
                                            : win.impact === "medium"
                                            ? "#F59E0B"
                                            : "#6B7280",
                                      }}
                                    >
                                      {win.impact}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--background-tertiary)]">
              <div className="text-sm text-[var(--foreground-muted)]">
                {formData.selectedQuickWinIds.length > 0 && (
                  <span>{formData.selectedQuickWinIds.length} quick wins selected</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.title.trim()}
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-[var(--accent)] text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      {isEditing ? "Saving..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Icon name={isEditing ? "success" : "plus"} className="w-4 h-4" />
                      {isEditing ? "Save Changes" : "Create Plan"}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
