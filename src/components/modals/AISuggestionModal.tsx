"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Icon, ModuleIcon } from "@/components/ui/icons";
import { Sparkles, ArrowRight, Lightbulb, Target, Zap } from "lucide-react";

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  rationale: string;
  linkedModules: Array<{ id: string; title: string; color: string }>;
  suggestedQuickWins: Array<{ title: string; impact: "high" | "medium" | "low" }>;
  expectedImpact: string;
  estimatedEffort: string;
}

interface AISuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: AISuggestion;
  onCreatePlan: (suggestion: AISuggestion) => void;
}

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

const impactColors = {
  high: { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981" },
  medium: { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B" },
  low: { bg: "rgba(107, 114, 128, 0.15)", text: "#6B7280" },
};

export function AISuggestionModal({
  isOpen,
  onClose,
  suggestion,
  onCreatePlan,
}: AISuggestionModalProps) {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePlan = async () => {
    setIsCreating(true);
    try {
      await onCreatePlan(suggestion);
      toast.success("Action plan created from AI suggestion!", {
        description: suggestion.title,
        icon: "🎯",
      });
      onClose();
    } catch {
      toast.error("Failed to create plan");
    } finally {
      setIsCreating(false);
    }
  };

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
            {/* Header with gradient */}
            <div className="relative px-6 py-5 border-b border-[var(--border)] bg-gradient-to-r from-[var(--teal-glow)] to-transparent">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 20px var(--teal-glow)",
                        "0 0 30px var(--teal-glow-strong)",
                        "0 0 20px var(--teal-glow)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center"
                  >
                    <Sparkles className="w-6 h-6 text-[var(--accent)]" />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">
                        AI Recommendation
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-[var(--foreground)]">
                      {suggestion.title}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close AI suggestion"
                  className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Icon name="x" className="w-5 h-5 text-[var(--foreground-muted)]" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Description */}
              <div>
                <p className="text-[var(--foreground-secondary)] leading-relaxed">
                  {suggestion.description}
                </p>
              </div>

              {/* Rationale */}
              <div className="p-4 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)]">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-[var(--accent)]" />
                  <h3 className="text-sm font-medium text-[var(--foreground)]">Why this recommendation?</h3>
                </div>
                <p className="text-sm text-[var(--foreground-secondary)]">
                  {suggestion.rationale}
                </p>
              </div>

              {/* Linked Modules */}
              <div>
                <h3 className="text-sm font-medium text-[var(--foreground)] mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[var(--foreground-muted)]" />
                  Linked Modules
                </h3>
                <div className="flex flex-wrap gap-2">
                  {suggestion.linkedModules.map((module) => (
                    <div
                      key={module.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: `${module.color}15` }}
                    >
                      <ModuleIcon
                        moduleId={module.id}
                        className="w-4 h-4"
                        style={{ color: module.color }}
                      />
                      <span className="text-sm font-medium" style={{ color: module.color }}>
                        {module.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Quick Wins */}
              <div>
                <h3 className="text-sm font-medium text-[var(--foreground)] mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#10B981]" />
                  Suggested Quick Wins ({suggestion.suggestedQuickWins.length})
                </h3>
                <div className="space-y-2">
                  {suggestion.suggestedQuickWins.map((win, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)]"
                    >
                      <span className="text-sm text-[var(--foreground)]">{win.title}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded capitalize"
                        style={{
                          backgroundColor: impactColors[win.impact].bg,
                          color: impactColors[win.impact].text,
                        }}
                      >
                        {win.impact} impact
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact & Effort */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--teal-glow)] border border-[var(--accent)]/30">
                  <p className="text-xs text-[var(--foreground-muted)] mb-1">Expected Impact</p>
                  <p className="text-sm font-medium text-[var(--foreground)]">{suggestion.expectedImpact}</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)]">
                  <p className="text-xs text-[var(--foreground-muted)] mb-1">Estimated Effort</p>
                  <p className="text-sm font-medium text-[var(--foreground)]">{suggestion.estimatedEffort}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--background-tertiary)]">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] transition-colors"
              >
                Maybe Later
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreatePlan}
                disabled={isCreating}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--accent)] text-white disabled:opacity-50 flex items-center gap-2 shadow-lg"
                style={{ boxShadow: "0 4px 20px var(--teal-glow)" }}
              >
                {isCreating ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Action Plan
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Default AI suggestion for the plans page
export const defaultAISuggestion: AISuggestion = {
  id: "green-corridor-initiative",
  title: "Green Corridor Initiative",
  description:
    "A comprehensive plan combining biodiversity protection with urban heat mitigation strategies. This initiative targets creating interconnected green spaces that serve dual purposes: reducing urban heat islands while providing habitat corridors for wildlife.",
  rationale:
    "Analysis of your completed quick wins shows strong progress in both urban heat and biodiversity modules. Combining these efforts would create synergies - trees planted for cooling also provide habitat, while restored green spaces reduce temperatures. This integrated approach typically delivers 40% more impact than addressing these issues separately.",
  linkedModules: [
    { id: "urban-heat", title: "Urban Heat", color: "#EF4444" },
    { id: "biodiversity", title: "Biodiversity", color: "#10B981" },
  ],
  suggestedQuickWins: [
    { title: "Strategic shade tree planting", impact: "high" },
    { title: "Native pollinator gardens", impact: "high" },
    { title: "Green corridor mapping", impact: "medium" },
    { title: "Building shade audit", impact: "high" },
    { title: "Wildlife crossing signage", impact: "medium" },
  ],
  expectedImpact: "2-3°C temperature reduction in target corridors, 25% increase in pollinator activity",
  estimatedEffort: "4-6 months for initial implementation",
};
