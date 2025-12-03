import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton loading placeholder with pulse animation.
 * Used for loading states across the application.
 *
 * @example
 * <Skeleton className="h-8 w-32" />
 * <Skeleton className="h-24 rounded-xl" />
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-[var(--background-tertiary)] animate-pulse rounded-lg",
        className
      )}
    />
  );
}

/**
 * Container for skeleton groups with consistent spacing.
 */
export function SkeletonContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("animate-pulse space-y-4", className)}>{children}</div>
  );
}
