import { cn } from "@/lib/utils"

interface Column {
  readonly header: string
  readonly align?: "left" | "right"
  readonly className?: string
}

interface DataTableProps {
  readonly columns: readonly Column[]
  readonly children: React.ReactNode
  readonly className?: string
  readonly stickyHeader?: boolean
  readonly maxHeight?: string
}

const thBase = "px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground"

export function DataTable({
  columns,
  children,
  className,
  stickyHeader = false,
  maxHeight,
}: DataTableProps) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-border",
        maxHeight && "overflow-y-auto",
        className,
      )}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="w-full text-sm">
        <thead className={cn("bg-card border-b border-border", stickyHeader && "sticky top-0 z-10")}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                scope="col"
                className={cn(
                  thBase,
                  col.align === "right" ? "text-right" : "text-left",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {children}
        </tbody>
      </table>
    </div>
  )
}

export function Td({
  children,
  align,
  className,
}: {
  readonly children: React.ReactNode
  readonly align?: "left" | "right"
  readonly className?: string
}) {
  return (
    <td
      className={cn(
        "px-4 py-3",
        align === "right" && "text-right",
        className,
      )}
    >
      {children}
    </td>
  )
}
