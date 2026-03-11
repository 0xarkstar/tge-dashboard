"use client"

import { Category, FdvTier } from "@/lib/types"
import { useI18n } from "@/lib/i18n"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

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
        <Input
          id="search-filter"
          type="text"
          placeholder={t("tokens.search")}
          value={globalFilter}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          className="w-full pr-8"
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

      <Select value={categoryFilter || undefined} onValueChange={(v) => onCategoryFilterChange(v === "__all__" ? "" : v)}>
        <SelectTrigger id="category-filter" className="w-[160px]">
          <SelectValue placeholder={t("tokens.allCategories")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">{t("tokens.allCategories")}</SelectItem>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={tierFilter || undefined} onValueChange={(v) => onTierFilterChange(v === "__all__" ? "" : v)}>
        <SelectTrigger id="tier-filter" className="w-[140px]">
          <SelectValue placeholder={t("tokens.allTiers")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">{t("tokens.allTiers")}</SelectItem>
          {TIERS.map((tier) => (
            <SelectItem key={tier} value={tier}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={halfFilter || undefined} onValueChange={(v) => onHalfFilterChange(v === "__all__" ? "" : v)}>
        <SelectTrigger id="half-filter" className="w-[140px]">
          <SelectValue placeholder={t("tokens.allHalves")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">{t("tokens.allHalves")}</SelectItem>
          {HALVES.map((half) => (
            <SelectItem key={half} value={half}>{half}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
