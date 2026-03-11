import { cn } from "@/lib/utils"

interface StatCardProps {
  readonly title: string
  readonly value: string | number
  readonly subtitle?: string
  readonly trend?: "up" | "down" | "neutral"
  readonly className?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border border-border bg-card p-6",
        className,
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p
        className={cn(
          "mt-2 text-2xl font-bold tracking-tight",
          trend === "up" && "text-green",
          trend === "down" && "text-red",
        )}
      >
        {value}
      </p>
      {subtitle ? (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  )
}
