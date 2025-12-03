"use client";

import { EmptyState as BaseEmptyState } from "@/components/ui/EmptyState";

interface EmptyStateProps {
  onResetFilters: () => void;
}

export function EmptyState({ onResetFilters }: EmptyStateProps) {
  return (
    <BaseEmptyState
      icon="search"
      title="No quick wins found"
      description="Try adjusting your filters or search query to find more opportunities."
      action={{
        label: "Reset Filters",
        onClick: onResetFilters,
      }}
    />
  );
}
