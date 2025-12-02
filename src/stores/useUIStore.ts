import { create } from "zustand";
import { persist } from "zustand/middleware";

type ImpactLevel = "high" | "medium" | "low";

interface QuickWinsFilters {
  selectedModule: string;
  selectedImpact: ImpactLevel | "all";
  searchQuery: string;
}

interface UIState {
  // Sidebar state
  sidebarCollapsed: boolean;

  // Copilot state
  copilotOpen: boolean;

  // Command palette state
  commandPaletteOpen: boolean;

  // Mobile sidebar state (not persisted)
  mobileSidebarOpen: boolean;

  // Quick wins filters (persisted)
  quickWinsFilters: QuickWinsFilters;

  // Action plans filters (persisted)
  actionPlansFilters: ActionPlansFilters;

  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setCopilotOpen: (open: boolean) => void;
  toggleCopilot: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setQuickWinsFilters: (filters: Partial<QuickWinsFilters>) => void;
  resetQuickWinsFilters: () => void;
  setActionPlansFilter: (filter: "all" | PlanStatus) => void;
  resetActionPlansFilters: () => void;
}

const defaultQuickWinsFilters: QuickWinsFilters = {
  selectedModule: "all",
  selectedImpact: "all",
  searchQuery: "",
};

type PlanStatus = "draft" | "active" | "completed";

interface ActionPlansFilters {
  statusFilter: "all" | PlanStatus;
}

const defaultActionPlansFilters: ActionPlansFilters = {
  statusFilter: "all",
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Default values
      sidebarCollapsed: false,
      copilotOpen: false,
      commandPaletteOpen: false,
      mobileSidebarOpen: false,
      quickWinsFilters: defaultQuickWinsFilters,
      actionPlansFilters: defaultActionPlansFilters,

      // Actions
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setCopilotOpen: (open) => set({ copilotOpen: open }),
      toggleCopilot: () => set((state) => ({ copilotOpen: !state.copilotOpen })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      setQuickWinsFilters: (filters) =>
        set((state) => ({
          quickWinsFilters: { ...state.quickWinsFilters, ...filters },
        })),
      resetQuickWinsFilters: () => set({ quickWinsFilters: defaultQuickWinsFilters }),
      setActionPlansFilter: (filter) =>
        set((state) => ({
          actionPlansFilters: { ...state.actionPlansFilters, statusFilter: filter },
        })),
      resetActionPlansFilters: () => set({ actionPlansFilters: defaultActionPlansFilters }),
    }),
    {
      name: "impact-atlas-ui",
      // Only persist certain fields, not mobile/ephemeral state
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        quickWinsFilters: state.quickWinsFilters,
        actionPlansFilters: state.actionPlansFilters,
      }),
    }
  )
);
