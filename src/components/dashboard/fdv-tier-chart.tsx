"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ReferenceLine } from "recharts"
import type { DashboardStats } from "@/lib/types"
import { FDV_TIER_LABELS } from "@/lib/constants"
import { useChartTheme, chartTooltipStyle } from "@/lib/hooks/use-chart-theme"
import type { FdvTier } from "@/lib/types"
import { ChartContainer } from "@/components/shared/chart-container"

interface FdvTierChartProps {
  readonly stats: DashboardStats
}

const TIER_ORDER: readonly FdvTier[] = ["mega", "large", "mid", "small"]

interface ChartDataItem {
  readonly name: string
  readonly originalChange: number
  readonly pct_green: number
  readonly count: number
}

function buildChartData(stats: DashboardStats): readonly ChartDataItem[] {
  return TIER_ORDER.map((tier) => {
    const tierData = stats.by_fdv_tier[tier]
    return {
      name: FDV_TIER_LABELS[tier],
      originalChange: tierData?.median_change ?? 0,
      pct_green: tierData?.pct_green ?? 0,
      count: tierData?.count ?? 0,
    }
  })
}

export function FdvTierChart({ stats }: FdvTierChartProps) {
  const ct = useChartTheme()
  const data = buildChartData(stats)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-lg font-semibold">
        FDV Tier Comparison
      </h3>
      <ChartContainer height="h-[350px]">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fill: ct.axis, fontSize: 12 }}
            axisLine={{ stroke: ct.grid }}
          />
          <YAxis
            tick={{ fill: ct.axis, fontSize: 12 }}
            axisLine={{ stroke: ct.grid }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            contentStyle={chartTooltipStyle(ct)}
            formatter={((value, name, props) => {
              if (name === "originalChange") {
                const v = (props as { payload: ChartDataItem }).payload.originalChange
                return [`${v >= 0 ? "+" : ""}${v.toFixed(1)}%`, "Median FDV Change"] as [string, string]
              }
              return [`${(value as number).toFixed(1)}%`, "% Green"] as [string, string]
            })}
          />
          <Legend
            wrapperStyle={{ color: ct.axis }}
            formatter={(value: string) =>
              value === "originalChange" ? "Median FDV Change" : "% Green"
            }
          />
          <ReferenceLine y={0} stroke={ct.reference} strokeDasharray="3 3" />
          <Bar dataKey="originalChange">
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.originalChange >= 0 ? ct.green : ct.red}
              />
            ))}
          </Bar>
          <Bar
            dataKey="pct_green"
            fill={ct.green}
          />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
