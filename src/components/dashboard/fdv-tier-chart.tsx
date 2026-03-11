"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ReferenceLine } from "recharts"
import type { DashboardStats } from "@/lib/types"
import { FDV_TIER_LABELS, CHART_THEME, CHART_TOOLTIP_STYLE } from "@/lib/constants"
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
            tick={{ fill: CHART_THEME.axis, fontSize: 12 }}
            axisLine={{ stroke: CHART_THEME.grid }}
          />
          <YAxis
            tick={{ fill: CHART_THEME.axis, fontSize: 12 }}
            axisLine={{ stroke: CHART_THEME.grid }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={((value, name, props) => {
              if (name === "originalChange") {
                const v = (props as { payload: ChartDataItem }).payload.originalChange
                return [`${v >= 0 ? "+" : ""}${v.toFixed(1)}%`, "Median FDV Change"] as [string, string]
              }
              return [`${(value as number).toFixed(1)}%`, "% Green"] as [string, string]
            })}
          />
          <Legend
            wrapperStyle={{ color: CHART_THEME.axis }}
            formatter={(value: string) =>
              value === "originalChange" ? "Median FDV Change" : "% Green"
            }
          />
          <ReferenceLine y={0} stroke={CHART_THEME.reference} strokeDasharray="3 3" />
          <Bar dataKey="originalChange">
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.originalChange >= 0 ? CHART_THEME.green : CHART_THEME.red}
              />
            ))}
          </Bar>
          <Bar
            dataKey="pct_green"
            fill={CHART_THEME.green}
          />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
