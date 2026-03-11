import { Marquee } from "@/components/ui/marquee"
import type { TGEToken } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TokenTickerProps {
  readonly tokens: readonly TGEToken[]
}

export function TokenTicker({ tokens }: TokenTickerProps) {
  const movers = [...tokens]
    .filter((t) => t.fdv_change_pct != null && t.status === "launched")
    .sort((a, b) => Math.abs(b.fdv_change_pct ?? 0) - Math.abs(a.fdv_change_pct ?? 0))
    .slice(0, 10)

  if (movers.length === 0) return null

  return (
    <div className="rounded-lg border border-border bg-card">
      <Marquee pauseOnHover className="py-2 [--duration:30s]">
        {movers.map((token) => {
          const isPositive = (token.fdv_change_pct ?? 0) >= 0
          return (
            <div key={token.ticker} className="mx-4 flex items-center gap-2 text-sm">
              <span className="font-semibold">{token.ticker}</span>
              <span className={cn(
                "font-medium",
                isPositive ? "text-green" : "text-red",
              )}>
                {isPositive ? "\u25B2 +" : "\u25BC -"}
                {Math.abs(token.fdv_change_pct ?? 0).toFixed(1)}%
              </span>
            </div>
          )
        })}
      </Marquee>
    </div>
  )
}
