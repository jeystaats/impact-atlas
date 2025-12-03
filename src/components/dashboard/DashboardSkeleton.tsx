"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-16 w-64 rounded-xl" />
      </div>

      {/* Stats row - responsive grid with widescreen support */}
      <div className="grid grid-cols-2 lg:grid-cols-4 3xl:grid-cols-6 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Main content grid - 3 cols on lg, 4 cols on widescreen */}
      <div className="grid lg:grid-cols-3 3xl:grid-cols-4 gap-6">
        {/* Modules grid - takes 2 cols on lg, 3 on widescreen */}
        <div className="lg:col-span-2 3xl:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="grid sm:grid-cols-2 3xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Skeleton className="h-72 rounded-xl" />
          <div>
            <Skeleton className="h-6 w-24 mb-4" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-4 w-32 mb-3" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-[450px] rounded-xl" />
      </div>
    </div>
  );
}
