"use client";

import { useEffect, useState, useTransition, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  type ColumnVisibilityState, type RowSelectionState, type SortingState,
  columnVisibilityFeature,
  flexRender, rowSelectionFeature, rowSortingFeature,
  stockFeatures, tableFeatures, useTable,
} from "@tanstack/react-table";
import { ChevronDown, Copy, Download, Loader2, Plus, Search, Trash2, X, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useDebounce } from "@/hooks/use-debounce";

import { makeColumns } from "./columns";
import { TransactionDialog } from "./transaction-dialog";
import { ViewDetailsDialog, type ViewItem } from "@/components/shared/view-details-dialog";
import { deleteTransaction, bulkDeleteTransactions, getPaginatedTransactions } from "@/actions/transactions";
import { categoryMeta, type Account, type Transaction } from "@/types/finance";

interface TransactionsTableProps {
  initialData: Transaction[];
  initialTotal: number;
  accounts: Account[];
}

export function TransactionsTable({ initialData, initialTotal, accounts }: TransactionsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const [data, setData] = useState<Transaction[]>(initialData);
  const [totalCount, setTotalCount] = useState(initialTotal);

  // In-memory Client Cache across page navigation
  const pageCache = useRef<Map<string, { data: Transaction[]; total: number }>>(
    new Map([[ "1-15---occurredAt-desc", { data: initialData, total: initialTotal } ]])
  );

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | undefined>();
  const [viewItem, setViewItem] = useState<ViewItem | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  // Server pagination & filter states
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [sorting, setSorting] = useState<SortingState>([{ id: "occurredAt", desc: true }]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({ category: false });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const debouncedSearch = useDebounce(searchTerm, 300);

  function clearCache() {
    pageCache.current.clear();
  }

  // Fetch paginated data with Instant Client Cache lookup
  const fetchTransactions = useCallback(async (bypassCache = false) => {
    const sortField = sorting[0]?.id || "occurredAt";
    const sortOrder = sorting[0]?.desc ? "desc" : "asc";
    const page = pageIndex + 1;
    const cacheKey = `${page}-${pageSize}-${debouncedSearch}-${selectedCategory}-${selectedType}-${sortField}-${sortOrder}`;

    // 1. Instant Cache Hit
    if (!bypassCache && pageCache.current.has(cacheKey)) {
      const cached = pageCache.current.get(cacheKey)!;
      setData(cached.data);
      setTotalCount(cached.total);
      return;
    }

    setIsLoading(true);
    try {
      const res = await getPaginatedTransactions({
        page,
        pageSize,
        search: debouncedSearch,
        category: selectedCategory,
        type: selectedType,
        sortBy: sortField,
        sortOrder,
      });

      pageCache.current.set(cacheKey, {
        data: res.data,
        total: res.meta.total,
      });

      setData(res.data);
      setTotalCount(res.meta.total);

      // 2. Prefetch next page in background
      const totalPages = Math.ceil(res.meta.total / pageSize);
      if (page < totalPages) {
        const nextPage = page + 1;
        const nextCacheKey = `${nextPage}-${pageSize}-${debouncedSearch}-${selectedCategory}-${selectedType}-${sortField}-${sortOrder}`;
        if (!pageCache.current.has(nextCacheKey)) {
          getPaginatedTransactions({
            page: nextPage,
            pageSize,
            search: debouncedSearch,
            category: selectedCategory,
            type: selectedType,
            sortBy: sortField,
            sortOrder,
          }).then((nextRes) => {
            pageCache.current.set(nextCacheKey, {
              data: nextRes.data,
              total: nextRes.meta.total,
            });
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, pageSize, debouncedSearch, selectedCategory, selectedType, sorting]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  function openCreate() { setEditingTx(undefined); setDialogOpen(true); }
  function openEdit(tx: Transaction) { setEditingTx(tx); setDialogOpen(true); }
  function handleView(tx: Transaction) {
    const acc = accounts.find((a) => a.id === tx.accountId);
    setViewItem({ type: "transaction", data: tx, accountName: acc?.name });
    setViewOpen(true);
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      const result = await deleteTransaction(id);
      if (result.success) {
        toast.success("Transaction deleted");
        clearCache();
        fetchTransactions(true);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete transaction");
      }
    });
  }

  const columns = makeColumns(accounts, openEdit, handleDelete, handleView);

  const features = tableFeatures({
    ...stockFeatures, columnVisibilityFeature,
    rowSelectionFeature, rowSortingFeature,
  });

  const table = useTable({
    features, data, columns,
    state: { sorting, columnVisibility, rowSelection },
    onSortingChange: (updater) => {
      setSorting(updater);
      setPageIndex(0);
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  const selectedRows = table.getRowModel().rows.filter((r) => rowSelection[r.id]);
  const selectedCount = Object.keys(rowSelection).length;

  function handleBulkDelete() {
    if (!selectedCount) return;

    const ids = selectedRows.map((r) => r.original.id);
    if (!confirm(`Are you sure you want to delete ${ids.length} selected transaction(s)?`)) {
      return;
    }

    startTransition(async () => {
      const res = await bulkDeleteTransactions(ids);
      if (res.success) {
        toast.success(`Deleted ${res.count} transactions`);
        setRowSelection({});
        clearCache();
        fetchTransactions(true);
        router.refresh();
      } else {
        toast.error(res.error ?? "Bulk delete failed");
      }
    });
  }

  function handleBulkExportExcel() {
    if (!selectedCount) return;

    const rows = selectedRows.map((r) => ({
      ID: r.original.id,
      Date: new Date(r.original.occurredAt).toLocaleDateString("en-IN"),
      Type: r.original.type,
      Category: r.original.category,
      Merchant: r.original.merchant || "-",
      Description: r.original.description || "-",
      Amount: r.original.amount,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Selected_Transactions");
    XLSX.writeFile(wb, `Transactions_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success(`Exported ${rows.length} transactions to Excel`);
  }

  function handleBulkCopyIds() {
    if (!selectedCount) return;
    const ids = selectedRows.map((r) => r.original.id).join(", ");
    navigator.clipboard.writeText(ids);
    toast.success(`Copied ${selectedCount} transaction ID(s) to clipboard`);
  }

  const pageCount = Math.ceil(totalCount / pageSize) || 1;
  const currentPage = pageIndex + 1;

  function getPageNumbers() {
    const pages: (number | "ellipsis")[] = [];
    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(pageCount - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < pageCount - 2) pages.push("ellipsis");
      if (!pages.includes(pageCount)) pages.push(pageCount);
    }
    return pages;
  }

  return (
    <>
      <TransactionDialog
        transaction={editingTx}
        accounts={accounts}
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) {
            clearCache();
            fetchTransactions(true);
          }
        }}
      />
      <ViewDetailsDialog item={viewItem} open={viewOpen} onOpenChange={setViewOpen} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              {totalCount.toLocaleString()} total entries
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                clearCache();
                fetchTransactions(true);
              }}
              disabled={isLoading}
              title="Refresh and clear cache"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add transaction
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-2.5 pb-4 md:flex-row md:items-center">
            <div className="relative w-full md:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search merchant or description..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPageIndex(0);
                }}
                className="pl-9 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full md:w-auto">
              <Select
                value={selectedCategory}
                onValueChange={(v: string | null) => {
                  setSelectedCategory(v || "ALL");
                  setPageIndex(0);
                }}
              >
                <SelectTrigger className="w-full sm:w-40 rounded-xl text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL"><span className="flex items-center gap-2">All categories</span></SelectItem>
                  {Object.entries(categoryMeta).map(([key, meta]) => {
                    const Icon = meta.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" />{meta.label}</span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Select
                value={selectedType}
                onValueChange={(v: string | null) => {
                  setSelectedType(v || "ALL");
                  setPageIndex(0);
                }}
              >
                <SelectTrigger className="w-full sm:w-28 rounded-xl text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All types</SelectItem>
                  <SelectItem value="CREDIT">Credit</SelectItem>
                  <SelectItem value="DEBIT">Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" className="w-full sm:w-auto ml-0 md:ml-auto rounded-xl text-xs gap-1.5" />}>
                Columns <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table.getAllColumns().filter((c) => c.getCanHide() && c.id !== "category").map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id} className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(v) => column.toggleVisibility(!!v)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Bulk Action Bar when rows are selected */}
          {selectedCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 mb-3 animate-in fade-in-50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary">
                  {selectedCount} item(s) selected on this page
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkCopyIds}
                  className="text-xs gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy IDs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExportExcel}
                  className="text-xs gap-1.5 text-emerald-600 dark:text-emerald-400"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Selected (.xlsx)
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={handleBulkDelete}
                  className="text-xs gap-1.5"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete Selected
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setRowSelection({})}
                  title="Clear Selection"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Render animated skeleton rows matching table column count
                  Array.from({ length: pageSize }).map((_, rowIndex) => (
                    <TableRow key={`skeleton-${rowIndex}`} className="hover:bg-transparent">
                      <TableCell className="w-10">
                        <Skeleton className="h-4 w-4 rounded-xs" />
                      </TableCell>
                      <TableCell className="w-28">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                          <div className="flex flex-col gap-1.5 w-full">
                            <Skeleton className="h-3.5 w-36" />
                            <Skeleton className="h-2.5 w-24" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-3.5 w-28" />
                          <Skeleton className="h-2.5 w-16" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </TableCell>
                      <TableCell className="w-10">
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : data.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Shadcn Numbered Pagination Footer */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                Showing <strong>{data.length > 0 ? pageIndex * pageSize + 1 : 0}</strong>–<strong>{Math.min((pageIndex + 1) * pageSize, totalCount)}</strong> of <strong>{totalCount.toLocaleString()}</strong> entries
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  if (v) {
                    setPageSize(Number(v));
                    setPageIndex(0);
                  }
                }}
              >
                <SelectTrigger size="sm" className="w-24 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="15">15 / page</SelectItem>
                  <SelectItem value="25">25 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    disabled={pageIndex === 0 || isLoading}
                    onClick={() => {
                      setRowSelection({});
                      setPageIndex((p) => Math.max(0, p - 1));
                    }}
                  />
                </PaginationItem>

                {getPageNumbers().map((p, idx) => (
                  <PaginationItem key={idx}>
                    {p === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={currentPage === p}
                        disabled={isLoading}
                        onClick={() => {
                          setRowSelection({});
                          setPageIndex((p as number) - 1);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    disabled={pageIndex >= pageCount - 1 || isLoading}
                    onClick={() => {
                      setRowSelection({});
                      setPageIndex((p) => p + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </>
  );
}