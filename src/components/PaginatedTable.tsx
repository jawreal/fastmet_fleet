"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import {
  createColumnHelper,
  createPaginatedRowModel,
  FlexRender,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const features = tableFeatures({
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

export interface DataTableColumn<TData> {
  id: string;
  header: string;
  cell: (row: TData) => ReactNode;
  footer?: ReactNode;
  className?: string;
}

interface PaginatedTableProps<TData> {
  data: TData[];
  columns: DataTableColumn<TData>[];
  getRowId: (row: TData) => string;
  labelledBy: string;
  className?: string;
}

export function PaginatedTable<TData extends object>({
  data,
  columns,
  getRowId,
  labelledBy,
  className,
}: Readonly<PaginatedTableProps<TData>>) {
  const pageSizeId = useId();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  // Keep column definitions stable so pagination changes only update table state.
  const tableColumns = useMemo(() => {
    const helper = createColumnHelper<typeof features, TData>();
    return columns.map((column) =>
      helper.display({
        id: column.id,
        header: column.header,
        cell: ({ row }) => column.cell(row.original),
      }),
    );
  }, [columns]);
  const table = useTable({
    features,
    data,
    columns: tableColumns,
    getRowId,
    state: { pagination },
    onPaginationChange: setPagination,
  });
  const rowCount = data.length;
  const start = rowCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, rowCount);

  function handlePageSizeChange(value: string | null) {
    if (!value) return;

    // Start at the first page to avoid an empty page after changing page size.
    table.setPageSize(Number(value));
    table.setPageIndex(0);
  }

  return (
    <>
      <Table aria-labelledby={labelledBy} className={cn("tabular-nums", className)}>
        <TableHeader className="bg-muted/30">
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header, index) => (
                <TableHead key={header.id} scope="col" className={cn("px-4 text-muted-foreground", columns[index].className)}>
                  {header.isPlaceholder ? null : <FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getAllCells().map((cell, index) => (
                <TableCell key={cell.id} className={cn("px-4 py-3", columns[index].className)}>
                  <FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          )) : (
            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">No results.</TableCell></TableRow>
          )}
        </TableBody>
        {columns.some((column) => column.footer !== undefined) && (
          <TableFooter>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} className={cn("px-4 py-3", column.className)}>{column.footer}</TableCell>
              ))}
            </TableRow>
          </TableFooter>
        )}
      </Table>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
        <p aria-live="polite">{start}–{end} of {rowCount} rows</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor={pageSizeId}>Rows per page</Label>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={handlePageSizeChange}
              items={[5, 10, 20, 50].map((size) => ({ label: String(size), value: String(size) }))}
            >
              <SelectTrigger id={pageSizeId} className="w-16"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <span>Page {pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}</span>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="First page"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.setPageIndex(0)}
            >
              <ChevronsLeftIcon />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous page"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next page"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              <ChevronRightIcon />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Last page"
              disabled={!table.getCanNextPage()}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            >
              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
