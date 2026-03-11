import { cn } from "@/lib/utils"

function Skeleton({ className, style }: { readonly className?: string; readonly style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius)] bg-muted",
        className,
      )}
      style={style}
    />
  )
}

export function SkeletonCard({ className }: { readonly className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border border-border bg-card p-6",
        className,
      )}
    >
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-8 w-32" />
      <Skeleton className="mt-2 h-4 w-20" />
    </div>
  )
}

export function SkeletonTable({ className }: { readonly className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border border-border bg-card",
        className,
      )}
    >
      <div className="border-b border-border p-4">
        <Skeleton className="h-5 w-48" />
      </div>
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border/50 px-4 py-3 last:border-0"
        >
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart({ className }: { readonly className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border border-border bg-card p-6",
        className,
      )}
    >
      <Skeleton className="h-5 w-40" />
      <div className="mt-4 flex items-end gap-2">
        {Array.from({ length: 10 }, (_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${((i * 73 + 41) % 120) + 40}px` }}
          />
        ))}
      </div>
      <Skeleton className="mt-3 h-4 w-full" />
    </div>
  )
}
