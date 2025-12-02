import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProgressState {
  // Completed quick wins (stored as Set serialized to array)
  completedQuickWins: string[];

  // Actions
  markQuickWinComplete: (id: string) => void;
  markQuickWinIncomplete: (id: string) => void;
  toggleQuickWin: (id: string) => void;
  isQuickWinComplete: (id: string) => boolean;
  getCompletedCount: () => number;
  clearAllProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      // Default values
      completedQuickWins: [],

      // Actions
      markQuickWinComplete: (id) =>
        set((state) => ({
          completedQuickWins: state.completedQuickWins.includes(id)
            ? state.completedQuickWins
            : [...state.completedQuickWins, id],
        })),

      markQuickWinIncomplete: (id) =>
        set((state) => ({
          completedQuickWins: state.completedQuickWins.filter((qwId) => qwId !== id),
        })),

      toggleQuickWin: (id) =>
        set((state) => ({
          completedQuickWins: state.completedQuickWins.includes(id)
            ? state.completedQuickWins.filter((qwId) => qwId !== id)
            : [...state.completedQuickWins, id],
        })),

      isQuickWinComplete: (id) => get().completedQuickWins.includes(id),

      getCompletedCount: () => get().completedQuickWins.length,

      clearAllProgress: () => set({ completedQuickWins: [] }),
    }),
    {
      name: "impact-atlas-progress",
    }
  )
);
