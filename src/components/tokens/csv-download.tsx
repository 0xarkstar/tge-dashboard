"use client"

import type { TGEToken } from "@/lib/types"

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatNumber(value: number | null | undefined): string {
  if (value == null) return ""
  return String(value)
}

export function CSVDownload({ tokens }: { readonly tokens: readonly TGEToken[] }) {
  function handleDownload() {
    const headers = [
      "Ticker",
      "Name",
      "Category",
      "Half",
      "Chain",
      "TGE Date",
      "Starting FDV",
      "Current FDV",
      "FDV Change %",
      "Volume 24h",
      "FDV Tier",
      "Status",
      "Performance",
      "VC Raised",
      "Lead Investors",
    ]

    const rows = tokens.map((t) => [
      escapeCSV(t.ticker),
      escapeCSV(t.name),
      escapeCSV(t.category),
      t.half,
      escapeCSV(t.chain),
      t.tge_date ?? "",
      formatNumber(t.starting_fdv),
      formatNumber(t.current_fdv),
      formatNumber(t.fdv_change_pct),
      formatNumber(t.volume_24h),
      t.fdv_tier,
      t.status,
      t.performance_status,
      formatNumber(t.vc_total_raised),
      escapeCSV(t.lead_investors.join("; ")),
    ])

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `tge-tokens-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Export CSV
    </button>
  )
}
