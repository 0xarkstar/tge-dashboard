import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

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
    <Card className={cn(className)}>
      <CardContent className="p-6">
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
      </CardContent>
    </Card>
  )
}
