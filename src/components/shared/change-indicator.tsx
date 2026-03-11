import { cn } from "@/lib/utils"

interface ChangeIndicatorProps {
  readonly value: number | null
  readonly className?: string
}

export function ChangeIndicator({ value, className }: ChangeIndicatorProps) {
  if (value == null) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        N/A
      </span>
    )
  }

  const isPositive = value >= 0

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium",
        isPositive ? "text-green" : "text-red",
        className,
      )}
    >
      <span aria-hidden="true">{isPositive ? "▲" : "▼"}</span>
      <span>
        {isPositive ? "+" : ""}
        {value.toFixed(1)}%
      </span>
    </span>
  )
}
