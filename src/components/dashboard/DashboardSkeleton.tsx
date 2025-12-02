"use client";

import { motion } from "framer-motion";

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={`bg-[var(--background-tertiary)] animate-pulse rounded-lg ${className}`}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <SkeletonBox className="h-8 w-48 mb-2" />
          <SkeletonBox className="h-5 w-64" />
        </div>
        <SkeletonBox className="h-16 w-64 rounded-xl" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBox key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Modules grid */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <SkeletonBox className="h-6 w-24" />
            <SkeletonBox className="h-4 w-16" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonBox key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <SkeletonBox className="h-72 rounded-xl" />
          <div>
            <SkeletonBox className="h-6 w-24 mb-4" />
            <SkeletonBox className="h-40 rounded-xl" />
          </div>
          <div>
            <SkeletonBox className="h-4 w-32 mb-3" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <SkeletonBox key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <SkeletonBox className="h-6 w-48" />
          <SkeletonBox className="h-4 w-32" />
        </div>
        <SkeletonBox className="h-[450px] rounded-xl" />
      </div>
    </div>
  );
}
