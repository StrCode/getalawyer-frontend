import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BulkOperationConfig, BulkOperations } from "./BulkOperations"
import { FilterField, FilterPreset, TableFilters } from "./TableFilters"

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface BulkAction<T> extends BulkOperationConfig<T> {
  // Legacy compatibility - will be deprecated
}

export interface AdminDataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  pagination?: PaginationInfo
  sorting?: SortingState
  filtering?: ColumnFiltersState
  onPaginationChange?: (pagination: PaginationInfo) => void
  onSortingChange?: (sorting: SortingState) => void
  onFilteringChange?: (filtering: ColumnFiltersState) => void
  isLoading?: boolean
  bulkActions?: BulkAction<T>[]
  searchPlaceholder?: string
  enableRowSelection?: boolean
  enableColumnVisibility?: boolean
  emptyMessage?: string
  // Advanced filtering
  filterFields?: FilterField[]
  advancedFilters?: Record<string, any>
  onAdvancedFiltersChange?: (filters: Record<string, any>) => void
  filterPresets?: FilterPreset[]
  onSaveFilterPreset?: (name: string, filters: Record<string, any>) => void
  onLoadFilterPreset?: (preset: FilterPreset) => void
  onDeleteFilterPreset?: (presetId: string) => void
  enableAdvancedFiltering?: boolean
  // Bulk operations
  bulkOperations?: BulkOperationConfig<T>[]
  userRole?: string
  onBulkOperationComplete?: (operationId: string, results: any[]) => void
}

export function AdminDataTable<T>({
  data,
  columns,
  pagination,
  sorting = [],
  filtering = [],
  onPaginationChange,
  onSortingChange,
  onFilteringChange,
  isLoading = false,
  bulkActions = [],
  searchPlaceholder = "Search...",
  enableRowSelection = false,
  enableColumnVisibility = true,
  emptyMessage = "No results found.",
  // Advanced filtering
  filterFields = [],
  advancedFilters = {},
  onAdvancedFiltersChange,
  filterPresets = [],
  onSaveFilterPreset,
  onLoadFilterPreset,
  onDeleteFilterPreset,
  enableAdvancedFiltering = false,
  // Bulk operations
  bulkOperations = [],
  userRole = "user",
  onBulkOperationComplete,
}: AdminDataTableProps<T>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Enable row selection if bulk operations are available
  const shouldEnableRowSelection = enableRowSelection || bulkActions.length > 0 || bulkOperations.length > 0

  // Add selection column if bulk actions are enabled
  const tableColumns = React.useMemo(() => {
    if (!shouldEnableRowSelection) {
      return columns
    }

    const selectionColumn: ColumnDef<T> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }

    return [selectionColumn, ...columns]
  }, [columns, shouldEnableRowSelection])

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: onSortingChange,
    onColumnFiltersChange: onFilteringChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters: filtering,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    // Server-side pagination if pagination prop is provided
    manualPagination: !!pagination,
    manualSorting: !!onSortingChange,
    manualFiltering: !!onFilteringChange,
    pageCount: pagination?.totalPages ?? -1,
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original)

  const handleBulkAction = async (action: BulkAction<T>) => {
    if (selectedRows.length === 0) return

    if (action.requiresConfirmation) {
      const confirmed = window.confirm(
        action.confirmationMessage || 
        `Are you sure you want to ${action.label.toLowerCase()} ${selectedRows.length} item(s)?`
      )
      if (!confirmed) return
    }

    try {
      await action.action(selectedRows)
      setRowSelection({}) // Clear selection after action
    } catch (error) {
      console.error(`Bulk action ${action.id} failed:`, error)
      // TODO: Show error toast
    }
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center py-4">
          <Skeleton className="h-10 w-[250px]" />
          <div className="ml-auto">
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: columns.length }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: columns.length }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Advanced Filtering */}
      {enableAdvancedFiltering && filterFields.length > 0 ? (
        <TableFilters
          fields={filterFields}
          filters={advancedFilters}
          onFiltersChange={onAdvancedFiltersChange || (() => {})}
          presets={filterPresets}
          onSavePreset={onSaveFilterPreset}
          onLoadPreset={onLoadFilterPreset}
          onDeletePreset={onDeleteFilterPreset}
          searchValue={globalFilter}
          onSearchChange={setGlobalFilter}
          searchPlaceholder={searchPlaceholder}
        />
      ) : (
        <div className="flex items-center py-4 gap-4">
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Bulk Actions and Column Visibility */}
      <div className="flex items-center gap-4 pb-4">
        {/* New Bulk Operations Component */}
        {bulkOperations.length > 0 && (
          <BulkOperations
            selectedItems={selectedRows}
            operations={bulkOperations}
            userRole={userRole}
            onOperationComplete={onBulkOperationComplete}
            onSelectionClear={() => setRowSelection({})}
          />
        )}

        {/* Legacy Bulk Actions */}
        {bulkActions.length > 0 && selectedRows.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedRows.length} selected
            </Badge>
            {bulkActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => handleBulkAction(action)}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Column Visibility */}
        {enableColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectedRows.length > 0 && (
              <span>
                {selectedRows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPaginationChange?.({
                  ...pagination,
                  page: Math.max(1, pagination.page - 1)
                })}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPaginationChange?.({
                  ...pagination,
                  page: Math.min(pagination.totalPages, pagination.page + 1)
                })}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to create sortable column header
export function createSortableHeader(title: string) {
  return ({ column }: { column: any }) => {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium"
      >
        {title}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    )
  }
}

// Helper function to create action column
export function createActionColumn<T>(
  actions: Array<{
    label: string
    onClick: (item: T) => void
    variant?: "default" | "destructive"
  }>
): ColumnDef<T> {
  return {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {actions.map((action, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => action.onClick(item)}
                className={action.variant === "destructive" ? "text-destructive" : ""}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }
}