"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { DashboardStats } from "@/lib/types"
import { FDV_TIER_LABELS } from "@/lib/constants"
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
              tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
              axisLine={{ stroke: "oklch(0.3 0 0)" }}
            />
            <YAxis
              tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
              axisLine={{ stroke: "oklch(0.3 0 0)" }}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.178 0 0)",
                border: "1px solid oklch(0.3 0 0)",
                borderRadius: "0.5rem",
                color: "oklch(0.985 0 0)",
              }}
              formatter={((value: number, name: string, props: { payload: ChartDataItem }) => {
                if (name === "absChange") {
                  const v = props.payload.originalChange
                  return [`${v.toFixed(1)}%`, "Median FDV Change"]
                }
                return [`${value.toFixed(1)}%`, "% Green"]
              }) as never}
            />
            <Legend
              wrapperStyle={{ color: "oklch(0.65 0 0)" }}
              formatter={(value: string) =>
                value === "absChange" ? "Median FDV Change" : "% Green"
              }
            />
            <Bar
              dataKey="absChange"
              fill="oklch(0.6 0.2 27)"
            />
            <Bar
              dataKey="pct_green"
              fill="oklch(0.7 0.18 145)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
