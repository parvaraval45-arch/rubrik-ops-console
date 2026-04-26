"use client";

import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Row,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  initialSort?: SortingState;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  loading?: boolean;
  pageSize?: 25 | 50 | 100;
  rowHeight?: "comfortable" | "compact";
  caption?: string;
  rowClassName?: (row: T) => string;
  expandedContent?: (row: T) => React.ReactNode;
  isExpanded?: (row: T) => boolean;
  onRowKey?: (row: T) => string;
}

export function DataTable<T>({
  data,
  columns,
  initialSort = [],
  onRowClick,
  emptyState,
  loading = false,
  pageSize: initialPageSize = 25,
  rowHeight = "comfortable",
  caption,
  rowClassName,
  expandedContent,
  isExpanded,
  onRowKey,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(initialSort);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [pageIndex, setPageIndex] = useState(0);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table is compatible in practice; React Compiler memoization is intentionally disabled for this hook.
  const table = useReactTable<T>({
    data,
    columns,
    state: { sorting, pagination: { pageIndex, pageSize } },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const total = data.length;
  const start = pageIndex * pageSize;
  const end = Math.min(start + pageSize, total);

  const heightClass =
    rowHeight === "compact" ? "h-10 text-[13px]" : "h-12 text-[13px]";
  const padClass = rowHeight === "compact" ? "px-3" : "px-4";

  const showPagination = total > pageSize;

  const skeletonCols = useMemo(() => columns.length, [columns.length]);

  return (
    <div className="flex flex-col">
      {caption ? (
        <span className="sr-only" id="data-table-caption">
          {caption}
        </span>
      ) : null}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-surface">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border-subtle">
                {headerGroup.headers.map((header) => {
                  const sortable = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      scope="col"
                      aria-sort={
                        sortDir === "asc"
                          ? "ascending"
                          : sortDir === "desc"
                            ? "descending"
                            : "none"
                      }
                      style={{ width: header.getSize?.() }}
                      className={cn(
                        padClass,
                        "h-9 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary",
                        sortable && "cursor-pointer select-none",
                      )}
                      onClick={
                        sortable
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {sortable ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-text-secondary" />
                          ) : sortDir === "desc" ? (
                            <ArrowDown className="h-3 w-3 text-text-secondary" />
                          ) : (
                            <span className="h-3 w-3" />
                          )
                        ) : null}
                      </span>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={`skel_${i}`} className="border-border-subtle">
                  {Array.from({ length: skeletonCols }).map((__, j) => (
                    <TableCell key={`skel_${i}_${j}`} className={cn(padClass, heightClass)}>
                      <Skeleton className="h-3 w-full max-w-[180px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : total === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="px-4 py-12 text-center"
                >
                  {emptyState ?? (
                    <span className="text-[13px] text-text-tertiary">
                      No rows match the current filters.
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <DataRow<T>
                  key={onRowKey ? onRowKey(row.original) : row.id}
                  row={row}
                  padClass={padClass}
                  heightClass={heightClass}
                  rowClassName={rowClassName}
                  onRowClick={onRowClick}
                  expandedContent={expandedContent}
                  isExpanded={isExpanded}
                  columnsCount={columns.length}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination ? (
        <div className="flex items-center justify-end gap-4 border-t border-border-subtle px-4 py-3 text-[12px] text-text-secondary">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-7 w-[68px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="tabular-nums">
            {start + 1}–{end} of {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-secondary disabled:opacity-40"
              disabled={!table.getCanPreviousPage()}
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-secondary disabled:opacity-40"
              disabled={!table.getCanNextPage()}
              onClick={() => setPageIndex((p) => p + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DataRow<T>({
  row,
  padClass,
  heightClass,
  rowClassName,
  onRowClick,
  expandedContent,
  isExpanded,
  columnsCount,
}: {
  row: Row<T>;
  padClass: string;
  heightClass: string;
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
  expandedContent?: (row: T) => React.ReactNode;
  isExpanded?: (row: T) => boolean;
  columnsCount: number;
}) {
  const expanded = isExpanded ? isExpanded(row.original) : false;
  return (
    <>
      <TableRow
        className={cn(
          "border-border-subtle transition-colors hover:bg-secondary/40",
          onRowClick && "cursor-pointer",
          rowClassName ? rowClassName(row.original) : "",
        )}
        onClick={onRowClick ? () => onRowClick(row.original) : undefined}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell
            key={cell.id}
            className={cn(padClass, heightClass, "align-middle")}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest("[data-stop-row-click]")) {
                e.stopPropagation();
              }
            }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
      {expanded && expandedContent ? (
        <TableRow className="border-border-subtle bg-canvas">
          <TableCell colSpan={columnsCount} className="px-4 py-4">
            {expandedContent(row.original)}
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}
