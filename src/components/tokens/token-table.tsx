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
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
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
      <Badge variant="secondary">{getValue<string>()}</Badge>
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
        <Table className="tabular-nums">
          <TableHeader className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    scope="col"
                    aria-sort={
                      header.column.getIsSorted() === "asc" ? "ascending"
                      : header.column.getIsSorted() === "desc" ? "descending"
                      : "none"
                    }
                    className="text-xs font-medium uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === "asc" ? " \u25B2" :
                       header.column.getIsSorted() === "desc" ? " \u25BC" :
                       " \u25BD"}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => router.push(`/tokens/${row.original.ticker}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
                <Badge variant="secondary">{token.category}</Badge>
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
            <Select value={String(table.getState().pagination.pageSize)} onValueChange={(v) => table.setPageSize(Number(v))}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Prev
            </Button>
            {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
              const current = table.getState().pagination.pageIndex
              const total = table.getPageCount()
              let start = Math.max(0, current - 2)
              if (start + 5 > total) start = Math.max(0, total - 5)
              const pageIdx = start + i
              if (pageIdx >= total) return null
              return (
                <Button
                  key={pageIdx}
                  variant={pageIdx === current ? "default" : "outline"}
                  size="sm"
                  onClick={() => table.setPageIndex(pageIdx)}
                >
                  {pageIdx + 1}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
