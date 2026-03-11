"use client"

import { useState } from "react"
import Link from "next/link"
import type { TGEToken } from "@/lib/types"
import { formatNumber, formatPercent } from "@/lib/utils"

interface ColumnDef {
  readonly header: string
  readonly align?: "left" | "right"
  readonly render: (token: TGEToken) => React.ReactNode
}

interface ExpandableTokenListProps {
  readonly title: string
  readonly tokens: readonly TGEToken[]
  readonly columns: readonly ColumnDef[]
  readonly defaultOpen?: boolean
  readonly colorDot?: string
  readonly subtitle?: string
}

const defaultColumns: readonly ColumnDef[] = [
  {
    header: "Ticker",
    render: (t) => (
      <Link href={`/tokens/${t.ticker}`} className="font-medium hover:text-primary transition-colors hover:underline">
        {t.ticker}
      </Link>
    ),
  },
  {
    header: "Name",
    render: (t) => <span className="text-muted-foreground">{t.name}</span>,
  },
  {
    header: "Category",
    render: (t) => t.category,
  },
  {
    header: "Starting FDV",
    align: "right",
    render: (t) => formatNumber(t.starting_fdv),
  },
  {
    header: "FDV Change",
    align: "right",
    render: (t) => (
      <span className={(t.fdv_change_pct ?? 0) >= 0 ? "text-green" : "text-red"}>
        {formatPercent(t.fdv_change_pct)}
      </span>
    ),
  },
]

export function ExpandableTokenList({
  title,
  tokens,
  columns = defaultColumns,
  defaultOpen = false,
  colorDot,
  subtitle,
}: ExpandableTokenListProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (tokens.length === 0) return null

  return (
    <div className="rounded-lg border border-border">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {colorDot ? (
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: colorDot }}
            />
          ) : null}
          <span className="font-medium">{title}</span>
          {subtitle ? (
            <span className="text-sm text-muted-foreground">{subtitle}</span>
          ) : null}
          <span className="text-sm text-muted-foreground">({tokens.length})</span>
        </div>
        <span className="text-muted-foreground text-sm">{isOpen ? "\u25B2" : "\u25BC"}</span>
      </button>
      {isOpen && (
        <div className="border-t border-border">
          <table className="w-full text-sm">
            <thead className="bg-card">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.header}
                    className={`px-4 py-2 text-xs font-medium uppercase text-muted-foreground ${col.align === "right" ? "text-right" : "text-left"}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tokens.map((t) => (
                <tr key={t.ticker} className="hover:bg-secondary/50 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={col.header}
                      className={`px-4 py-2 ${col.align === "right" ? "text-right" : ""}`}
                    >
                      {col.render(t)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
