"use client"

import { Category, FdvTier } from "@/lib/types"
import { useI18n } from "@/lib/i18n"

const CATEGORIES = Category.options
const TIERS = FdvTier.options
const HALVES = ["H1", "H2"] as const

interface TableFiltersProps {
  readonly globalFilter: string
  readonly onGlobalFilterChange: (value: string) => void
  readonly categoryFilter: string
  readonly onCategoryFilterChange: (value: string) => void
  readonly tierFilter: string
  readonly onTierFilterChange: (value: string) => void
  readonly halfFilter: string
  readonly onHalfFilterChange: (value: string) => void
}

export function TableFilters({
  globalFilter,
  onGlobalFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  tierFilter,
  onTierFilterChange,
  halfFilter,
  onHalfFilterChange,
}: TableFiltersProps) {
  const { t } = useI18n()

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:w-64">
        <label htmlFor="search-filter" className="sr-only">Search ticker or name</label>
        <input
          id="search-filter"
          type="text"
          placeholder={t("tokens.search")}
          value={globalFilter}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full pr-8"
        />
        {globalFilter && (
          <button
            onClick={() => onGlobalFilterChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      <label htmlFor="category-filter" className="sr-only">Filter by category</label>
      <select
        id="category-filter"
        value={categoryFilter}
        onChange={(e) => onCategoryFilterChange(e.target.value)}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">{t("tokens.allCategories")}</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <label htmlFor="tier-filter" className="sr-only">Filter by FDV tier</label>
      <select
        id="tier-filter"
        value={tierFilter}
        onChange={(e) => onTierFilterChange(e.target.value)}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">{t("tokens.allTiers")}</option>
        {TIERS.map((tier) => (
          <option key={tier} value={tier}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </option>
        ))}
      </select>

      <label htmlFor="half-filter" className="sr-only">Filter by half</label>
      <select
        id="half-filter"
        value={halfFilter}
        onChange={(e) => onHalfFilterChange(e.target.value)}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">{t("tokens.allHalves")}</option>
        {HALVES.map((half) => (
          <option key={half} value={half}>
            {half}
          </option>
        ))}
      </select>
    </div>
  )
}
