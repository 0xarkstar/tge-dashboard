import Link from "next/link"
import type { TGEToken } from "@/lib/types"
import { formatPercent, formatNumber, cn } from "@/lib/utils"

const TIER_DISPLAY: Record<string, { label: string; className: string }> = {
  mega: { label: "Mega", className: "bg-purple-500/15 text-purple-400" },
  large: { label: "Large", className: "bg-blue-500/15 text-blue-400" },
  mid: { label: "Mid", className: "bg-amber-500/15 text-amber-400" },
  small: { label: "Small", className: "bg-zinc-500/15 text-zinc-400" },
}

function FdvTierBadge({ tier }: { readonly tier: string }) {
  const display = TIER_DISPLAY[tier] ?? { label: tier, className: "bg-secondary text-secondary-foreground" }
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", display.className)}>
      {display.label}
    </span>
  )
}

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
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Ticker</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium text-right">FDV Change</th>
              <th className="px-5 py-3 font-medium text-right">Starting FDV</th>
              <th className="px-5 py-3 font-medium text-center">FDV Tier</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, index) => {
              const isGreen = (token.fdv_change_pct ?? 0) >= 0
              const arrow = isGreen ? "▲" : "▼"
              return (
                <tr
                  key={token.ticker}
                  className="border-b border-border/50 last:border-b-0 hover:bg-secondary/50 transition-colors"
                >
                  <td className="px-5 py-3 text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="px-5 py-3 font-mono font-semibold">
                    <Link href={`/tokens/${token.ticker}`} className="hover:text-primary transition-colors hover:underline">
                      {token.ticker}
                    </Link>
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
                  <td className="px-5 py-3 text-center">
                    <FdvTierBadge tier={token.fdv_tier} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3 p-4">
        {tokens.map((token, index) => {
          const isGreen = (token.fdv_change_pct ?? 0) >= 0
          return (
            <div key={token.ticker} className="rounded-lg border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">{index + 1}.</span>
                  <Link href={`/tokens/${token.ticker}`} className="font-mono font-semibold hover:text-primary transition-colors hover:underline">
                    {token.ticker}
                  </Link>
                  <span className="text-sm text-muted-foreground">{token.name}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">FDV Change: </span>
                  <span className={variant === "top" ? "text-green" : "text-red"}>
                    {isGreen ? "\u25B2" : "\u25BC"} {formatPercent(token.fdv_change_pct)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Starting FDV: </span>
                  {formatNumber(token.starting_fdv)}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground text-sm">Tier:</span>
                <FdvTierBadge tier={token.fdv_tier} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
