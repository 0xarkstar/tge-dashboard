import Link from "next/link"
import type { TGEToken } from "@/lib/types"
import { formatNumber, cn } from "@/lib/utils"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const TIER_DISPLAY: Record<string, { label: string; className: string }> = {
  mega: { label: "Mega", className: "bg-purple-500/15 text-purple-400" },
  large: { label: "Large", className: "bg-blue-500/15 text-blue-400" },
  mid: { label: "Mid", className: "bg-amber-500/15 text-amber-400" },
  small: { label: "Small", className: "bg-zinc-500/15 text-zinc-400" },
}

function FdvTierBadge({ tier }: { readonly tier: string }) {
  const display = TIER_DISPLAY[tier] ?? { label: tier, className: "bg-secondary text-secondary-foreground" }
  return (
    <Badge variant="secondary" className={cn(display.className)}>
      {display.label}
    </Badge>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5">#</TableHead>
              <TableHead className="px-5">Ticker</TableHead>
              <TableHead className="px-5">Name</TableHead>
              <TableHead className="px-5 text-right">FDV Change</TableHead>
              <TableHead className="px-5 text-right">Starting FDV</TableHead>
              <TableHead className="px-5 text-center">FDV Tier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token, index) => {
              const isGreen = (token.fdv_change_pct ?? 0) >= 0
              const arrow = isGreen ? "▲" : "▼"
              const absChange = token.fdv_change_pct != null ? Math.abs(token.fdv_change_pct).toFixed(1) + "%" : "N/A"
              return (
                <TableRow
                  key={token.ticker}
                >
                  <TableCell className="px-5 text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-5 font-mono font-semibold">
                    <Link href={`/tokens/${token.ticker}`} className="hover:text-primary transition-colors hover:underline">
                      {token.ticker}
                    </Link>
                  </TableCell>
                  <TableCell className="px-5 text-muted-foreground">
                    {token.name}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "px-5 text-right font-medium",
                      variant === "top" ? "text-green" : "text-red",
                    )}
                  >
                    {arrow} {absChange}
                  </TableCell>
                  <TableCell className="px-5 text-right text-muted-foreground">
                    {formatNumber(token.starting_fdv)}
                  </TableCell>
                  <TableCell className="px-5 text-center">
                    <FdvTierBadge tier={token.fdv_tier} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
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
                    {isGreen ? "\u25B2" : "\u25BC"} {token.fdv_change_pct != null ? Math.abs(token.fdv_change_pct).toFixed(1) + "%" : "N/A"}
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
