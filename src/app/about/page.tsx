import type { Metadata } from "next"
import { FDV_TIER_LABELS } from "@/lib/constants"

export const metadata: Metadata = {
  title: "About | TGE Dashboard 2025",
  description:
    "Methodology, data sources, and limitations of the 2025 TGE Performance Dashboard.",
}

function Section({
  title,
  children,
}: {
  readonly title: string
  readonly children: React.ReactNode
}) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 text-muted-foreground">{children}</div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">About This Dashboard</h1>
      <p className="mt-4 text-muted-foreground">
        The 2025 TGE Performance Dashboard tracks 118 VC-backed token generation
        events (TGEs) that launched in 2025. It provides real-time FDV tracking,
        VC ROI analysis, and category breakdowns to help understand the
        performance landscape of new token launches.
      </p>

      <Section title="Methodology">
        <p>
          Each token is tracked from its TGE date. Starting FDV and market cap
          are captured at launch. Current prices are updated every 2 hours via
          the CoinGecko API. FDV change percentage is calculated as the
          difference between current FDV and starting FDV.
        </p>
        <p>
          Tokens are classified as &quot;green&quot; (outperforming) if their
          current FDV is above their starting FDV, and &quot;red&quot;
          (underperforming) if below. Illiquid tokens or those without reliable
          price data are flagged accordingly.
        </p>
      </Section>

      <Section title="Data Sources">
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong>CoinGecko</strong> — Live price data, market cap, volume,
            ATH/ATL, and circulating supply.
          </li>
          <li>
            <strong>DeFiLlama</strong> — VC funding data including total raised
            amounts and lead investors.
          </li>
          <li>
            <strong>Manual Research</strong> — Initial TGE parameters (starting
            FDV, market cap, TGE date, category, chain) sourced from project
            announcements and on-chain data.
          </li>
        </ul>
      </Section>

      <Section title="FDV Tier Definitions">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4 font-medium text-foreground">Tier</th>
                <th className="py-2 font-medium text-foreground">
                  Starting FDV Range
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                Object.entries(FDV_TIER_LABELS) as Array<[string, string]>
              ).map(([tier, label]) => (
                <tr key={tier} className="border-b border-border/50">
                  <td className="py-2 pr-4 capitalize text-foreground">
                    {tier}
                  </td>
                  <td className="py-2">{label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Limitations & Disclaimers">
        <ul className="list-inside list-disc space-y-2">
          <li>
            Price data may be delayed up to 2 hours depending on the last update
            cycle.
          </li>
          <li>
            VC funding data is not available for all tokens. Coverage percentage
            is noted in the dashboard stats.
          </li>
          <li>
            Starting FDV values are based on best-available data at launch and
            may differ slightly from other sources.
          </li>
          <li>
            Some tokens may have low liquidity, making their price data less
            reliable. These are flagged as &quot;illiquid.&quot;
          </li>
          <li>
            This dashboard is for informational purposes only and does not
            constitute financial advice.
          </li>
        </ul>
      </Section>

      <Section title="Update Frequency">
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong>Price updates</strong> — Every 2 hours via automated
            pipeline.
          </li>
          <li>
            <strong>Full data refresh</strong> — Daily at 03:00 UTC, including
            VC data and new token additions.
          </li>
          <li>
            <strong>Manual updates</strong> — New TGEs are added as they launch
            throughout 2025.
          </li>
        </ul>
      </Section>
    </div>
  )
}
