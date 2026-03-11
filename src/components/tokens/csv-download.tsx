"use client"

import { useState } from "react"
import type { TGEToken } from "@/lib/types"
import { useI18n } from "@/lib/i18n"

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
  const [downloaded, setDownloaded] = useState(false)
  const { t } = useI18n()

  function handleDownload() {
    const headers = [
      "Ticker", "Name", "CoinGecko ID", "Category", "Chain", "Half",
      "TGE Date", "Starting FDV", "Starting MC", "Current FDV", "Current MC",
      "Initial Circ Ratio", "Current Price", "FDV Change %", "Volume 24h",
      "ATH", "ATL", "FDV Tier", "Status", "Performance", "Is Illiquid",
      "VC Raised", "Lead Investors", "VC Data Source", "Data Source", "Last Updated",
    ]

    const rows = tokens.map((tk) => [
      escapeCSV(tk.ticker),
      escapeCSV(tk.name),
      tk.coingecko_id ?? "",
      escapeCSV(tk.category),
      escapeCSV(tk.chain),
      tk.half,
      tk.tge_date ?? "",
      formatNumber(tk.starting_fdv),
      formatNumber(tk.starting_mc),
      formatNumber(tk.current_fdv),
      formatNumber(tk.current_mc),
      formatNumber(tk.initial_circ_ratio),
      formatNumber(tk.current_price),
      formatNumber(tk.fdv_change_pct),
      formatNumber(tk.volume_24h),
      formatNumber(tk.ath),
      formatNumber(tk.atl),
      tk.fdv_tier,
      tk.status,
      tk.performance_status,
      String(tk.is_illiquid),
      formatNumber(tk.vc_total_raised),
      escapeCSV(tk.lead_investors.join("; ")),
      tk.vc_data_source ?? "",
      tk.data_source ?? "",
      tk.last_updated,
    ])

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `tge-tokens-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2000)
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
      {downloaded ? t("tokens.downloaded") : t("tokens.exportCsv")}
    </button>
  )
}
