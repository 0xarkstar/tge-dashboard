import fs from "fs"
import path from "path"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { TGETokenSchema } from "@/lib/types"
import type { TGEToken } from "@/lib/types"
import { FDV_TIER_LABELS } from "@/lib/constants"
import { formatNumber, formatPercent, formatDate } from "@/lib/utils"
import { StatCard } from "@/components/shared/stat-card"
import { ChangeIndicator } from "@/components/shared/change-indicator"
import { ShareButton } from "@/components/shared/share-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { z } from "zod"

function loadTokens(): readonly TGEToken[] {
  const filePath = path.join(process.cwd(), "data", "tokens.json")
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"))
  return z.array(TGETokenSchema).parse(raw)
}

export function generateStaticParams(): Array<{ ticker: string }> {
  const tokens = loadTokens()
  return tokens.map((t) => ({ ticker: t.ticker }))
}

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params
  const tokens = loadTokens()
  const token = tokens.find((t) => t.ticker === ticker)
  const name = token ? `${token.name} (${token.ticker})` : ticker

  return {
    title: `${name} | TGE Dashboard 2025`,
    description: token
      ? `${name} TGE performance: starting FDV ${formatNumber(token.starting_fdv)}, current FDV ${formatNumber(token.current_fdv)}.`
      : `Token details for ${ticker}`,
  }
}

function CategoryBadge({ category }: { readonly category: string }) {
  return (
    <Badge className="bg-primary/15 text-primary hover:bg-primary/25">{category}</Badge>
  )
}

function ChainBadge({ chain }: { readonly chain: string }) {
  return (
    <Badge variant="secondary">{chain}</Badge>
  )
}

function StatusBadge({
  status,
}: {
  readonly status: "green" | "red"
}) {
  return (
    <Badge className={status === "green" ? "bg-green/15 text-green hover:bg-green/25" : "bg-red/15 text-red hover:bg-red/25"}>
      {status === "green" ? "Outperforming" : "Underperforming"}
    </Badge>
  )
}

export default async function TokenDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>
}) {
  const { ticker } = await params
  const tokens = loadTokens()
  const token = tokens.find((t) => t.ticker === ticker)

  if (!token) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Token not found</h1>
        <p className="mt-2 text-muted-foreground">
          No data available for ticker &quot;{ticker}&quot;.
        </p>
        <Link
          href="/tokens"
          className="mt-6 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tokens
        </Link>
      </div>
    )
  }

  const shareText = `${token.name} ($${token.ticker}) TGE Performance: ${token.fdv_change_pct != null ? `${token.fdv_change_pct >= 0 ? "+" : ""}${token.fdv_change_pct.toFixed(1)}%` : "N/A"} FDV change since launch. #TGE2025`

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/tokens" className="hover:text-foreground transition-colors">Tokens</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{token.ticker}</span>
      </nav>

      {/* Header */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">{token.ticker}</h1>
        <span className="text-lg text-muted-foreground">{token.name}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <CategoryBadge category={token.category} />
        <ChainBadge chain={token.chain} />
        <StatusBadge status={token.performance_status} />
        {token.coingecko_id ? (
          <a href={`https://www.coingecko.com/en/coins/${token.coingecko_id}`} target="_blank" rel="noopener noreferrer"><Badge variant="secondary" className="gap-1.5 cursor-pointer">CoinGecko<ExternalLink className="h-3 w-3" /></Badge></a>
        ) : null}
      </div>

      {/* Share */}
      <div className="mt-4">
        <ShareButton text={shareText} />
      </div>

      {/* Key Metrics */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Key Metrics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Starting FDV"
            value={formatNumber(token.starting_fdv)}
          />
          <StatCard
            title="Current FDV"
            value={formatNumber(token.current_fdv)}
            trend={
              token.fdv_change_pct == null
                ? undefined
                : token.fdv_change_pct >= 0
                  ? "up"
                  : "down"
            }
          />
          <StatCard
            title="FDV Change"
            value={formatPercent(token.fdv_change_pct)}
            trend={
              token.fdv_change_pct == null
                ? undefined
                : token.fdv_change_pct >= 0
                  ? "up"
                  : "down"
            }
          />
          <StatCard
            title="Market Cap"
            value={formatNumber(token.current_mc)}
          />
          <StatCard
            title="Volume (24h)"
            value={formatNumber(token.volume_24h)}
          />
          <StatCard
            title="Starting Market Cap"
            value={formatNumber(token.starting_mc)}
          />
        </div>
      </section>

      {/* Performance */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Performance</h2>
        <Card className="mt-4"><CardContent className="p-6">
          <div className="flex items-center gap-4">
            <ChangeIndicator
              value={token.fdv_change_pct ?? null}
              className="text-3xl"
            />
          </div>
          {(token.ath != null || token.atl != null || token.current_price != null) && (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {token.ath != null && (
                <div>
                  <p className="text-sm text-muted-foreground">All-Time High</p>
                  <p className="mt-1 font-medium">${token.ath.toFixed(token.ath < 1 ? 6 : 2)}</p>
                </div>
              )}
              {token.atl != null && (
                <div>
                  <p className="text-sm text-muted-foreground">All-Time Low</p>
                  <p className="mt-1 font-medium">${token.atl.toFixed(token.atl < 1 ? 6 : 2)}</p>
                </div>
              )}
              {token.current_price != null && (
                <div>
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="mt-1 font-medium">${token.current_price.toFixed(token.current_price < 1 ? 6 : 2)}</p>
                </div>
              )}
            </div>
          )}
        </CardContent></Card>
      </section>

      {/* VC Info */}
      {token.vc_total_raised != null ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">VC Information</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total Raised"
              value={formatNumber(token.vc_total_raised)}
            />
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">
                  Lead Investors
                </p>
                <p className="mt-2 font-medium">
                  {token.lead_investors.length > 0
                    ? token.lead_investors.join(", ")
                    : "N/A"}
                </p>
              </CardContent>
            </Card>
            {token.vc_data_source ? (
              <StatCard title="Data Source" value={token.vc_data_source} />
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Token Details */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Token Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="TGE Date"
            value={formatDate(token.tge_date ?? null)}
          />
          <StatCard title="Half" value={token.half} />
          <StatCard
            title="Circulating Ratio"
            value={
              token.initial_circ_ratio != null
                ? `${(token.initial_circ_ratio * 100).toFixed(1)}%`
                : "N/A"
            }
          />
          <StatCard
            title="FDV Tier"
            value={FDV_TIER_LABELS[token.fdv_tier]}
            subtitle={token.fdv_tier.charAt(0).toUpperCase() + token.fdv_tier.slice(1)}
          />
          <StatCard
            title="Status"
            value={token.status.charAt(0).toUpperCase() + token.status.slice(1)}
          />
          <StatCard
            title="Liquidity"
            value={token.is_illiquid ? "Illiquid" : "Liquid"}
          />
        </div>
      </section>

      {/* Last updated */}
      <p className="mt-8 text-xs text-muted-foreground">
        Last updated: {formatDate(token.last_updated)}
      </p>
    </div>
  )
}
