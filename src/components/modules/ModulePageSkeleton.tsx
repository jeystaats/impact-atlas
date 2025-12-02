"use client";

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={`bg-[var(--background-tertiary)] animate-pulse rounded-lg ${className}`}
    />
  );
}

export function ModulePageSkeleton() {
  return (
    <div className="p-6 lg:p-8">
      {/* Module Header Skeleton */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <SkeletonBox className="w-12 h-12 rounded-xl" />
          <div>
            <SkeletonBox className="h-7 w-40 mb-2" />
            <SkeletonBox className="h-4 w-64" />
          </div>
        </div>
      </div>

      {/* Action Bar Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SkeletonBox className="h-10 w-32 rounded-lg" />
          <SkeletonBox className="h-10 w-24 rounded-lg" />
          <SkeletonBox className="h-10 w-28 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBox className="h-10 w-10 rounded-lg" />
          <SkeletonBox className="h-10 w-10 rounded-lg" />
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="mb-6">
        <SkeletonBox className="h-12 w-full rounded-xl" />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Map Area - 3 columns */}
        <div className="lg:col-span-3">
          {/* Map Container */}
          <div className="rounded-xl border border-[var(--border)] overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <SkeletonBox className="h-5 w-28" />
              <SkeletonBox className="h-4 w-16" />
            </div>
            <SkeletonBox className="h-[500px] rounded-none" />
          </div>
        </div>

        {/* Sidebar - 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <SkeletonBox className="h-5 w-24" />
            <SkeletonBox className="h-4 w-16" />
          </div>

          {/* Hotspot Cards */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background-secondary)]"
              >
                <div className="flex items-start gap-3 mb-3">
                  <SkeletonBox className="w-8 h-8 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <SkeletonBox className="h-4 w-3/4 mb-2" />
                    <SkeletonBox className="h-3 w-1/2" />
                  </div>
                </div>
                <SkeletonBox className="h-12 w-full rounded-lg" />
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--border)] my-4" />

          {/* Insight Cards */}
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background-secondary)]"
              >
                <div className="flex items-start gap-3 mb-3">
                  <SkeletonBox className="w-8 h-8 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <SkeletonBox className="h-4 w-2/3 mb-2" />
                    <SkeletonBox className="h-3 w-full mb-1" />
                    <SkeletonBox className="h-3 w-4/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background-secondary)]">
            <SkeletonBox className="h-4 w-24 mb-3" />
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonBox key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
