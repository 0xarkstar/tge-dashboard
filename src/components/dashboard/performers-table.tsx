import type { TGEToken } from "@/lib/types"
import { formatPercent, formatNumber, cn } from "@/lib/utils"

interface PerformersTableProps {
  readonly tokens: readonly TGEToken[]
  readonly title: string
  readonly variant: "top" | "bottom"
}

export function PerformersTable({ tokens, title, variant }: PerformersTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Ticker</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium text-right">FDV Change</th>
              <th className="px-5 py-3 font-medium text-right">Starting FDV</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, index) => {
              const isGreen = (token.fdv_change_pct ?? 0) >= 0
              const arrow = isGreen ? "▲" : "▼"
              return (
                <tr
                  key={token.ticker}
                  className="border-b border-border/50 last:border-b-0"
                >
                  <td className="px-5 py-3 text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="px-5 py-3 font-mono font-semibold">
                    {token.ticker}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {token.name}
                  </td>
                  <td
                    className={cn(
                      "px-5 py-3 text-right font-medium",
                      variant === "top" ? "text-green" : "text-red",
                    )}
                  >
                    {arrow} {formatPercent(token.fdv_change_pct)}
                  </td>
                  <td className="px-5 py-3 text-right text-muted-foreground">
                    {formatNumber(token.starting_fdv)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
