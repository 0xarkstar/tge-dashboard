"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import type { TGEToken } from "@/lib/types"
import { formatNumber, cn } from "@/lib/utils"
import { ChangeIndicator } from "@/components/shared/change-indicator"
import { TableFilters } from "./table-filters"
import { CSVDownload } from "./csv-download"

const columns: ColumnDef<TGEToken>[] = [
  {
    accessorKey: "ticker",
    header: "Ticker",
    cell: ({ getValue }) => (
      <Link href={`/tokens/${getValue<string>()}`} className="font-semibold text-foreground hover:text-primary transition-colors hover:underline">
        {getValue<string>()}
      </Link>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ getValue }) => (
      <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "starting_fdv",
    header: "Starting FDV",
    cell: ({ getValue }) => formatNumber(getValue<number>()),
  },
  {
    accessorKey: "current_fdv",
    header: "Current FDV",
    cell: ({ getValue }) => formatNumber(getValue<number | null>()),
  },
  {
    accessorKey: "fdv_change_pct",
    header: "FDV Change %",
    cell: ({ getValue }) => <ChangeIndicator value={getValue<number | null>() ?? null} />,
    sortingFn: "basic",
  },
  {
    accessorKey: "volume_24h",
    header: "Volume 24h",
    cell: ({ getValue, row }) => {
      const volume = getValue<number | null>()
      const isIlliquid = row.original.is_illiquid
      return (
        <span className={isIlliquid ? "text-muted-foreground" : ""}>
          {formatNumber(volume)}
          {isIlliquid ? <span className="ml-1 text-xs text-chart-4" title="Low liquidity">&#9888;</span> : null}
        </span>
      )
    },
  },
  {
    accessorKey: "fdv_tier",
    header: "FDV Tier",
    cell: ({ getValue }) => (
      <span className="text-xs font-medium capitalize">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "half",
    header: "Half",
    cell: ({ getValue }) => (
      <span className="text-xs font-medium">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<string>()
      const color =
        status === "launched"
          ? "text-green"
          : status === "pending"
            ? "text-chart-4"
            : "text-muted-foreground"
      return <span className={`text-xs capitalize ${color}`}>{status}</span>
    },
  },
]

interface TokenTableProps {
  readonly tokens: readonly TGEToken[]
}

export function TokenTable({ tokens }: TokenTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([
    { id: "fdv_change_pct", desc: true },
  ])
  const [globalFilter, setGlobalFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [tierFilter, setTierFilter] = useState("")
  const [halfFilter, setHalfFilter] = useState("")

  const filteredData = useMemo(() => {
    let result = [...tokens]
    if (categoryFilter) {
      result = result.filter((t) => t.category === categoryFilter)
    }
    if (tierFilter) {
      result = result.filter((t) => t.fdv_tier === tierFilter)
    }
    if (halfFilter) {
      result = result.filter((t) => t.half === halfFilter)
    }
    return result
  }, [tokens, categoryFilter, tierFilter, halfFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const search = filterValue.toLowerCase()
      const ticker = (row.getValue("ticker") as string).toLowerCase()
      const name = (row.getValue("name") as string).toLowerCase()
      return ticker.includes(search) || name.includes(search)
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 25 },
    },
  })

  const filteredRows = table.getFilteredRowModel().rows
  const filteredTokens = filteredRows.map((r) => r.original)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TableFilters
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          tierFilter={tierFilter}
          onTierFilterChange={setTierFilter}
          halfFilter={halfFilter}
          onHalfFilterChange={setHalfFilter}
        />
        <CSVDownload tokens={filteredTokens} />
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredRows.length} of {tokens.length} tokens
      </p>

      {filteredRows.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16">
          <p className="text-lg font-medium text-muted-foreground">No tokens match your filters</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm tabular-nums">
          <thead className="sticky top-0 z-10 bg-card border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    scope="col"
                    aria-sort={
                      header.column.getIsSorted() === "asc" ? "ascending"
                      : header.column.getIsSorted() === "desc" ? "descending"
                      : "none"
                    }
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === "asc" ? " \u25B2" :
                       header.column.getIsSorted() === "desc" ? " \u25BC" :
                       " \u25BD"}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/tokens/${row.original.ticker}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {table.getRowModel().rows.map((row) => {
          const token = row.original
          return (
            <div
              key={row.id}
              className="rounded-lg border border-border bg-card p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Link href={`/tokens/${token.ticker}`} className="font-semibold text-foreground hover:text-primary transition-colors hover:underline">
                    {token.ticker}
                  </Link>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {token.name}
                  </span>
                </div>
                <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                  {token.category}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Starting FDV: </span>
                  {formatNumber(token.starting_fdv)}
                </div>
                <div>
                  <span className="text-muted-foreground">Current FDV: </span>
                  {formatNumber(token.current_fdv)}
                </div>
                <div>
                  <span className="text-muted-foreground">Change: </span>
                  <ChangeIndicator value={token.fdv_change_pct ?? null} />
                </div>
                <div>
                  <span className="text-muted-foreground">Vol 24h: </span>
                  {formatNumber(token.volume_24h)}
                  {token.is_illiquid ? <span className="ml-1 text-xs text-chart-4" title="Low liquidity">&#9888;</span> : null}
                </div>
                <div>
                  <span className="text-muted-foreground">Half: </span>
                  {token.half}
                </div>
                <div>
                  <span className="text-muted-foreground">Tier: </span>
                  {token.fdv_tier}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {table.getPageCount() > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="rounded-md border border-border bg-background px-2 py-1 text-sm"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="rounded-md border border-border px-2 py-1.5 text-sm disabled:opacity-50 hover:bg-secondary transition-colors"
            >
              First
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-secondary transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
              const current = table.getState().pagination.pageIndex
              const total = table.getPageCount()
              let start = Math.max(0, current - 2)
              if (start + 5 > total) start = Math.max(0, total - 5)
              const pageIdx = start + i
              if (pageIdx >= total) return null
              return (
                <button
                  key={pageIdx}
                  onClick={() => table.setPageIndex(pageIdx)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm transition-colors",
                    pageIdx === current
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-secondary"
                  )}
                >
                  {pageIdx + 1}
                </button>
              )
            })}
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-secondary transition-colors"
            >
              Next
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="rounded-md border border-border px-2 py-1.5 text-sm disabled:opacity-50 hover:bg-secondary transition-colors"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
