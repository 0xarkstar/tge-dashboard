"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts"
import type { DashboardStats } from "@/lib/types"
import { FDV_TIER_LABELS, CHART_THEME } from "@/lib/constants"
import type { FdvTier } from "@/lib/types"

interface FdvTierChartProps {
  readonly stats: DashboardStats
}

const TIER_ORDER: readonly FdvTier[] = ["mega", "large", "mid", "small"]

interface ChartDataItem {
  readonly name: string
  readonly absChange: number
  readonly originalChange: number
  readonly pct_green: number
  readonly count: number
}

function buildChartData(stats: DashboardStats): readonly ChartDataItem[] {
  return TIER_ORDER.map((tier) => {
    const tierData = stats.by_fdv_tier[tier]
    return {
      name: FDV_TIER_LABELS[tier],
      absChange: Math.abs(tierData?.median_change ?? 0),
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
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
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
              contentStyle={{
                backgroundColor: CHART_THEME.tooltipBg,
                border: `1px solid ${CHART_THEME.tooltipBorder}`,
                borderRadius: "0.5rem",
                color: CHART_THEME.tooltipText,
              }}
              formatter={((value: number, name: string, props: { payload: ChartDataItem }) => {
                if (name === "absChange") {
                  const v = props.payload.originalChange
                  return [`${v >= 0 ? "+" : ""}${v.toFixed(1)}%`, "Median FDV Change"]
                }
                return [`${value.toFixed(1)}%`, "% Green"]
              }) as never}
            />
            <Legend
              wrapperStyle={{ color: CHART_THEME.axis }}
              formatter={(value: string) =>
                value === "absChange" ? "Median FDV Change" : "% Green"
              }
            />
            <Bar dataKey="absChange">
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
        </ResponsiveContainer>
      </div>
    </div>
  )
}
