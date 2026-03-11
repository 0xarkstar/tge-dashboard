import type { DashboardStats } from "@/lib/types"
import { formatNumber, formatPercent, cn } from "@/lib/utils"

interface HeroStatsProps {
  readonly stats: DashboardStats
}

interface StatCardProps {
  readonly label: string
  readonly value: string
  readonly subtext?: string
  readonly variant?: "default" | "green" | "red"
}

function StatCard({ label, value, subtext, variant = "default" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 text-3xl font-bold tracking-tight",
          variant === "green" && "text-green",
          variant === "red" && "text-red",
        )}
      >
        {value}
      </p>
      {subtext && (
        <p className="mt-1 text-sm text-muted-foreground">{subtext}</p>
      )}
    </div>
  )
}

export function HeroStats({ stats }: HeroStatsProps) {
  const medianVariant = stats.median_fdv_change >= 0 ? "green" : "red"
  const medianArrow = stats.median_fdv_change >= 0 ? "▲" : "▼"

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Tokens"
        value={String(stats.total_tokens)}
        subtext={`${stats.launched_tokens} launched`}
      />
      <StatCard
        label="Green %"
        value={`${stats.green_pct}%`}
        subtext={`${stats.green_count} green / ${stats.red_count} red`}
        variant="green"
      />
      <StatCard
        label="Median FDV Change"
        value={`${medianArrow} ${formatPercent(stats.median_fdv_change)}`}
        variant={medianVariant}
      />
      <StatCard
        label="Total VC Raised"
        value={formatNumber(stats.total_vc_raised)}
        subtext={`${stats.vc_data_coverage} tokens with VC data`}
      />
    </div>
  )
}
