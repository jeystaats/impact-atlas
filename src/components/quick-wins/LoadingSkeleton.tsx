"use client";

export function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="animate-pulse space-y-8">
        <div className="h-20 bg-[var(--background-tertiary)] rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-[var(--background-tertiary)] rounded-xl"
            />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-32 bg-[var(--background-tertiary)] rounded-xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
