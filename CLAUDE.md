# TGE Dashboard 2025

Track 118 VC-backed token generation events and their market performance in 2025. Static site with real-time price updates via automated pipelines.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript 5.9
- **Styling**: Tailwind v4 (CSS `@theme` tokens), shadcn/ui patterns
- **Data**: Static JSON (`data/tokens.json`, `data/stats.json`)
- **Charts**: Recharts
- **Icons**: lucide-react
- **Validation**: Zod 4
- **Build**: `output: 'export'` (full SSG), pnpm

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build (static export to out/)
pnpm lint         # ESLint

# Data pipeline (Python 3.11)
pip install -r scripts/requirements.txt
python scripts/update_prices.py     # Price update only
python scripts/pipeline.py          # Full data refresh
```

## Directory Structure

```
src/
  app/
    layout.tsx          # Root layout with header/footer
    page.tsx            # Dashboard home
    tokens/page.tsx     # Token list with table
    tokens/[ticker]/    # Token detail pages (SSG)
    analytics/page.tsx  # Charts and analysis
    about/page.tsx      # Methodology and data sources
  components/
    shared/             # StatCard, ChangeIndicator, LoadingSkeleton, ShareButton
    layout/             # SiteHeader, SiteFooter, MobileNav
    dashboard/          # HeroStats, PerformersTable
    analytics/          # Chart components
    tokens/             # TokenTable
  lib/
    types.ts            # Zod schemas and TypeScript types
    constants.ts        # Category colors, FDV tiers, site config
    utils.ts            # cn(), formatNumber, formatPercent, formatDate
data/
  tokens.json           # 118 token records
  stats.json            # Aggregated dashboard stats
scripts/                # Python data pipeline
.github/workflows/      # CI, price updates (2h), full updates (daily)
```

## Key Patterns

- Dark theme only (OKLCH colors in globals.css)
- Immutable data patterns (no mutation)
- Mobile responsive with Tailwind breakpoints
- All pages statically generated (`generateStaticParams` for dynamic routes)
