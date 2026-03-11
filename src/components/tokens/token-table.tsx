"use client"

import { useState, useMemo } from "react"
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
import { TableFilters } from "./table-filters"
import { CSVDownload } from "./csv-download"

function formatUSD(value: number | null | undefined): string {
  if (value == null) return "—"
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

function ChangeIndicator({ value }: { readonly value: number | null | undefined }) {
  if (value == null) return <span className="text-muted-foreground">—</span>
  const isPositive = value >= 0
  return (
    <span className={isPositive ? "text-green" : "text-red"}>
      {isPositive ? "\u25B2" : "\u25BC"} {Math.abs(value).toFixed(2)}%
    </span>
  )
}

const columns: ColumnDef<TGEToken>[] = [
  {
    accessorKey: "ticker",
    header: "Ticker",
    cell: ({ getValue }) => (
      <span className="font-semibold text-foreground">{getValue<string>()}</span>
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
    cell: ({ getValue }) => formatUSD(getValue<number>()),
  },
  {
    accessorKey: "current_fdv",
    header: "Current FDV",
    cell: ({ getValue }) => formatUSD(getValue<number | null>()),
  },
  {
    accessorKey: "fdv_change_pct",
    header: "FDV Change %",
    cell: ({ getValue }) => <ChangeIndicator value={getValue<number | null>()} />,
    sortingFn: "basic",
  },
  {
    accessorKey: "volume_24h",
    header: "Volume 24h",
    cell: ({ getValue }) => formatUSD(getValue<number | null>()),
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

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-card border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: " \u25B2",
                        desc: " \u25BC",
                      }[header.column.getIsSorted() as string] ?? ""}
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
                className="hover:bg-secondary/50 transition-colors"
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
                  <span className="font-semibold text-foreground">
                    {token.ticker}
                  </span>
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
                  {formatUSD(token.starting_fdv)}
                </div>
                <div>
                  <span className="text-muted-foreground">Current FDV: </span>
                  {formatUSD(token.current_fdv)}
                </div>
                <div>
                  <span className="text-muted-foreground">Change: </span>
                  <ChangeIndicator value={token.fdv_change_pct} />
                </div>
                <div>
                  <span className="text-muted-foreground">Vol 24h: </span>
                  {formatUSD(token.volume_24h)}
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
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-secondary transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-secondary transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
