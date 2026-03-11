"use client"

import { Category, FdvTier } from "@/lib/types"

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
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        placeholder="Search ticker or name..."
        value={globalFilter}
        onChange={(e) => onGlobalFilterChange(e.target.value)}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-64"
      />

      <select
        value={categoryFilter}
        onChange={(e) => onCategoryFilterChange(e.target.value)}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <select
        value={tierFilter}
        onChange={(e) => onTierFilterChange(e.target.value)}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">All Tiers</option>
        {TIERS.map((tier) => (
          <option key={tier} value={tier}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </option>
        ))}
      </select>

      <select
        value={halfFilter}
        onChange={(e) => onHalfFilterChange(e.target.value)}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">All Halves</option>
        {HALVES.map((half) => (
          <option key={half} value={half}>
            {half}
          </option>
        ))}
      </select>
    </div>
  )
}
