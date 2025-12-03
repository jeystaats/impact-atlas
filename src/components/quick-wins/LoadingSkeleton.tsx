"use client";

import { Skeleton, SkeletonContainer } from "@/components/ui/Skeleton";

export function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <SkeletonContainer className="space-y-8">
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 3xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </SkeletonContainer>
    </div>
  );
}
