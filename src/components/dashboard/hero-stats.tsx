"use client"

import type { DashboardStats } from "@/lib/types"
import { formatNumber, cn } from "@/lib/utils"
import { NumberTicker } from "@/components/ui/number-ticker"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"

interface HeroStatsProps {
  readonly stats: DashboardStats
}

interface AnimatedStatCardProps {
  readonly label: string
  readonly numericValue: number
  readonly prefix?: string
  readonly suffix?: string
  readonly decimalPlaces?: number
  readonly delay?: number
  readonly subtext?: string
  readonly variant?: "default" | "green" | "red"
}

function AnimatedStatCard({
  label,
  numericValue,
  prefix = "",
  suffix = "",
  decimalPlaces = 0,
  delay = 0,
  subtext,
  variant = "default",
}: AnimatedStatCardProps) {
  return (
    <Card className={cn(
      variant === "default" && "bg-card",
      variant === "green" && "bg-green/5 border-green/20",
      variant === "red" && "bg-red/5 border-red/20",
    )}>
      <CardContent className="p-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className={cn(
          "mt-2 text-3xl font-bold tracking-tight",
          variant === "green" && "text-green",
          variant === "red" && "text-red",
        )}>
          {prefix}<NumberTicker value={numericValue} decimalPlaces={decimalPlaces} delay={delay} className="text-inherit" />{suffix}
        </p>
        {subtext && (
          <p className="mt-1 text-sm text-muted-foreground">{subtext}</p>
        )}
      </CardContent>
    </Card>
  )
}

function parseVcRaised(value: number): { numericValue: number; suffix: string } {
  if (value >= 1_000_000_000) {
    return { numericValue: value / 1_000_000_000, suffix: "B" }
  }
  if (value >= 1_000_000) {
    return { numericValue: value / 1_000_000, suffix: "M" }
  }
  return { numericValue: value, suffix: "" }
}

export function HeroStats({ stats }: HeroStatsProps) {
  const { t } = useI18n()
  const medianVariant = stats.median_fdv_change >= 0 ? "green" : "red"
  const medianArrow = stats.median_fdv_change >= 0 ? "\u25B2 " : "\u25BC "
  const vc = parseVcRaised(stats.total_vc_raised)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <AnimatedStatCard
        label={t("dashboard.totalTokens")}
        numericValue={stats.total_tokens}
        delay={0}
        subtext={t("dashboard.launched", { n: String(stats.launched_tokens) })}
      />
      <AnimatedStatCard
        label={t("dashboard.greenPct")}
        numericValue={stats.green_pct}
        suffix="%"
        decimalPlaces={1}
        delay={0.15}
        subtext={t("dashboard.greenRed", { g: String(stats.green_count), r: String(stats.red_count) })}
        variant="green"
      />
      <AnimatedStatCard
        label={t("dashboard.medianFdvChange")}
        numericValue={Math.abs(stats.median_fdv_change)}
        prefix={medianArrow}
        suffix="%"
        decimalPlaces={1}
        delay={0.3}
        variant={medianVariant}
      />
      <AnimatedStatCard
        label={t("dashboard.totalVcRaised")}
        numericValue={vc.numericValue}
        prefix="$"
        suffix={vc.suffix}
        decimalPlaces={vc.suffix ? 2 : 0}
        delay={0.45}
        subtext={t("dashboard.vcCoverage", { n: String(stats.vc_data_coverage) })}
      />
      <p className="text-xs text-muted-foreground mt-4 text-center col-span-full">
        {t("dashboard.dataUpdates")}
      </p>
    </div>
  )
}
