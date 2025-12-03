"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icons";
import { isAIGenerated } from "@/components/ui/AIGeneratedBadge";
import { modules as fallbackModules } from "@/data/modules";
import { useSelectedCity } from "@/hooks/useSelectedCity";
import { useHydration } from "@/hooks/useHydration";
import {
  useQuickWins,
  useModules,
  useCompleteQuickWin,
  useUncompleteQuickWin,
  useQuickWinProgress,
} from "@/hooks/useConvex";
import { useProgressStore } from "@/stores/useProgressStore";
import { useUIStore } from "@/stores/useUIStore";
import { trackQuickWinComplete, trackEvent, AnalyticsEvents } from "@/lib/analytics";
import {
  QuickWinCard,
  QuickWinStats,
  QuickWinFilters,
  EmptyState,
  ProgressIndicator,
  LoadingSkeleton,
  containerVariants,
  fallbackQuickWinsData,
} from "@/components/quick-wins";
import type {
  ImpactLevel,
  NormalizedQuickWin,
  NormalizedModule,
} from "@/components/quick-wins";
import { Id } from "../../../../convex/_generated/dataModel";

export default function QuickWinsPage() {
  const { selectedCityId, isHydrated } = useSelectedCity();

  // Fetch data from Convex
  const convexModules = useModules();
  const convexQuickWins = useQuickWins({ cityId: selectedCityId });
  const userProgress = useQuickWinProgress({ cityId: selectedCityId });
  const completeQuickWin = useCompleteQuickWin();
  const uncompleteQuickWin = useUncompleteQuickWin();

  // Progress store for fallback data persistence
  const { completedQuickWins, toggleQuickWin, clearAllProgress } =
    useProgressStore();

  // UI store for persisted filters
  const { quickWinsFilters, setQuickWinsFilters, resetQuickWinsFilters } =
    useUIStore();
  const isStoreHydrated = useHydration();

  // Use persisted filters after hydration
  const selectedModule = isStoreHydrated
    ? quickWinsFilters.selectedModule
    : "all";
  const selectedImpact = isStoreHydrated
    ? quickWinsFilters.selectedImpact
    : "all";
  const searchQuery = isStoreHydrated ? quickWinsFilters.searchQuery : "";

  const setSelectedModule = (module: string) =>
    setQuickWinsFilters({ selectedModule: module });
  const setSelectedImpact = (impact: ImpactLevel | "all") =>
    setQuickWinsFilters({ selectedImpact: impact });
  const setSearchQuery = (query: string) =>
    setQuickWinsFilters({ searchQuery: query });

  // Normalize modules
  const modules: NormalizedModule[] = convexModules
    ? convexModules.map(
        (m: { slug: string; name: string; color: string }) => ({
          id: m.slug,
          title: m.name,
          color: m.color,
          quickWinsCount: 0,
        })
      )
    : fallbackModules.map(
        (m: {
          id: string;
          title: string;
          color: string;
          quickWinsCount: number;
        }) => ({
          id: m.id,
          title: m.title,
          color: m.color,
          quickWinsCount: m.quickWinsCount,
        })
      );

  // Normalize quick wins - memoized to prevent unnecessary re-renders
  const quickWinsData: NormalizedQuickWin[] = useMemo(() => {
    if (!convexQuickWins) return fallbackQuickWinsData;

    return convexQuickWins.map(
      (qw: {
        _id: Id<"quickWins">;
        moduleId: Id<"modules">;
        title: string;
        description: string;
        impact: ImpactLevel;
        effort: "low" | "medium" | "high";
        estimatedDays?: number;
        tags: string[];
      }) => {
        const matchedModule = convexModules?.find(
          (m: { _id: Id<"modules">; slug: string }) => m._id === qw.moduleId
        );
        return {
          id: qw._id,
          convexId: qw._id,
          title: qw.title,
          description: qw.description,
          moduleId: matchedModule?.slug ?? "unknown",
          impact: qw.impact,
          effort: qw.effort,
          estimatedDays: qw.estimatedDays ?? 7,
          tags: qw.tags,
        };
      }
    );
  }, [convexQuickWins, convexModules]);

  // Calculate module quick win counts
  const modulesWithCounts = modules.map((m) => ({
    ...m,
    quickWinsCount: quickWinsData.filter((qw) => qw.moduleId === m.id).length,
  }));

  const getModuleById = (id: string) =>
    modulesWithCounts.find((m) => m.id === id);

  // Get completed wins (from Convex or progress store for fallback data)
  const completedWinIds = useMemo(() => {
    const convexCompleted = new Set(
      userProgress?.completedWins?.map(
        (cw: { quickWinId: Id<"quickWins"> }) => cw.quickWinId
      ) ?? []
    );
    const localCompleted = new Set(isStoreHydrated ? completedQuickWins : []);
    return new Set([...convexCompleted, ...localCompleted]);
  }, [userProgress, completedQuickWins, isStoreHydrated]);

  // Filtered quick wins
  const filteredWins = useMemo(() => {
    return quickWinsData.filter((win) => {
      const matchesModule =
        selectedModule === "all" || win.moduleId === selectedModule;
      const matchesImpact =
        selectedImpact === "all" || win.impact === selectedImpact;
      const matchesSearch =
        searchQuery === "" ||
        win.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        win.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        win.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesModule && matchesImpact && matchesSearch;
    });
  }, [quickWinsData, selectedModule, selectedImpact, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = quickWinsData.length;
    const highImpact = quickWinsData.filter((w) => w.impact === "high").length;
    const aiGenerated = quickWinsData.filter((w) =>
      isAIGenerated(w.tags)
    ).length;
    const completed = completedWinIds.size;
    return { total, highImpact, aiGenerated, completed };
  }, [quickWinsData, completedWinIds]);

  // Toggle complete handler
  const handleToggleComplete = async (win: NormalizedQuickWin) => {
    const isCompleted = completedWinIds.has(win.id);

    // Track analytics
    if (!isCompleted) {
      trackQuickWinComplete(String(win.id), win.moduleId);
    } else {
      trackEvent(AnalyticsEvents.QUICK_WIN_VIEW, {
        quickWinId: String(win.id),
        moduleId: win.moduleId,
        action: "uncomplete",
      });
    }

    if (win.convexId) {
      try {
        if (isCompleted) {
          await uncompleteQuickWin({ quickWinId: win.convexId });
          toast.success("Quick win unmarked", { description: win.title });
        } else {
          await completeQuickWin({ quickWinId: win.convexId });
          toast.success("Quick win completed!", {
            description: win.title,
            icon: "🎉",
          });
        }
      } catch (error) {
        console.error("Failed to toggle completion:", error);
        toast.error("Failed to update quick win", {
          description: "Please try again.",
        });
      }
    } else {
      toggleQuickWin(win.id);
      if (isCompleted) {
        toast.success("Quick win unmarked", { description: win.title });
      } else {
        toast.success("Quick win completed!", {
          description: win.title,
          icon: "🎉",
        });
      }
    }
  };

  // Show skeleton while loading
  const isConvexLoading =
    selectedCityId &&
    (convexQuickWins === undefined || convexModules === undefined);

  if (!isHydrated || isConvexLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center">
              <Icon name="zap" className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">
              Actionable Insights
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]"
          >
            Quick Wins
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--foreground-secondary)] mt-1 max-w-xl"
          >
            AI-identified opportunities for immediate climate action across all
            modules
          </motion.p>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative w-full lg:w-80"
        >
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]"
          />
          <input
            type="text"
            placeholder="Search quick wins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
          />
        </motion.div>
      </div>

      {/* Stats Row */}
      <QuickWinStats stats={stats} />

      {/* Filters */}
      <QuickWinFilters
        modules={modulesWithCounts}
        selectedModule={selectedModule}
        selectedImpact={selectedImpact}
        onModuleChange={setSelectedModule}
        onImpactChange={setSelectedImpact}
      />

      {/* Results count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex items-center justify-between mb-4"
      >
        <p className="text-sm text-[var(--foreground-muted)]">
          Showing{" "}
          <span className="text-[var(--foreground)] font-medium">
            {filteredWins.length}
          </span>{" "}
          quick wins
          {selectedModule !== "all" && (
            <>
              {" "}
              in{" "}
              <span className="text-[var(--foreground)] font-medium">
                {getModuleById(selectedModule)?.title.split(" ").slice(0, 2).join(" ")}
              </span>
            </>
          )}
        </p>
        {completedWinIds.size > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={clearAllProgress}
            className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Reset completed ({completedWinIds.size})
          </motion.button>
        )}
      </motion.div>

      {/* Quick Wins List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredWins.map((win) => {
            const winModule = getModuleById(win.moduleId);
            const isCompleted = completedWinIds.has(win.id);

            return (
              <QuickWinCard
                key={win.id}
                win={win}
                module={winModule}
                isCompleted={isCompleted}
                onToggleComplete={handleToggleComplete}
              />
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      {filteredWins.length === 0 && (
        <EmptyState onResetFilters={resetQuickWinsFilters} />
      )}

      {/* Progress indicator at bottom */}
      <ProgressIndicator stats={stats} />
    </div>
  );
}
