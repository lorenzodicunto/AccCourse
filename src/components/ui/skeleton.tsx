"use client";

import { cn } from "@/lib/utils";

/**
 * Skeleton shimmer loading component.
 * Uses a CSS gradient animation for the shimmer effect.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted animate-pulse",
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton for a course card — matches the layout of ProjectCard in dashboard.
 */
export function SkeletonCourseCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      {/* Thumbnail area */}
      <Skeleton className="h-40 w-full rounded-none" />
      {/* Content area */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for stat cards row.
 */
export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-card rounded-xl p-4 flex items-center gap-3 border border-border">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for asset library grid items.
 */
export function SkeletonAssetCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

/**
 * Skeleton for a table row.
 */
export function SkeletonTableRow({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}
