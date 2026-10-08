"use client";
import { formatCalendarDate } from "@/lib/utils";

import type { ColumnDef, StockFeatures } from "@tanstack/react-table";
import {
  ArrowDownLeft,
  ArrowUpDown,
  ArrowUpRight,
  Eye,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  accountTypeLabel,
  categoryMeta,
  type Account,
  type Transaction,
} from "@/types/finance";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function makeColumns(
  accounts: Account[],
  onEdit: (tx: Transaction) => void,
  onDelete: (id: number) => void,
  onView?: (tx: Transaction) => void,
): ColumnDef<StockFeatures, Transaction, unknown>[] {
  return [
    {
      id: "select",

      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
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
    },

    {
      accessorKey: "occurredAt",

      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),

      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatCalendarDate(row.original.occurredAt)}
        </span>
      ),
    },

    {
      id: "transaction",

      header: "Transaction",

      cell: ({ row }) => {
        const { merchant, description, category, type } = row.original;
        const meta = categoryMeta[category];
        const Icon = meta.icon;

        const isCredit = type === "CREDIT";

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
              {isCredit ? (
                <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Icon className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            <div className="flex flex-col">
              <span className="font-medium leading-tight">
                {merchant || description || meta.label}
              </span>

              <span className="text-xs text-muted-foreground">
                {merchant && description ? description : meta.label}
              </span>
            </div>
          </div>
        );
      },

      filterFn: (row, _columnId, filterValue: string) => {
        if (!filterValue) return true;
        const search = filterValue.toLowerCase();
        const merchant = (row.original.merchant ?? "").toLowerCase();
        const description = (row.original.description ?? "").toLowerCase();
        const categoryLabel =
          categoryMeta[row.original.category]?.label.toLowerCase() ?? "";
        return (
          merchant.includes(search) ||
          description.includes(search) ||
          categoryLabel.includes(search)
        );
      },
    },

    {
      accessorKey: "category",

      header: "Category",

      cell: ({ row }) => {
        const meta = categoryMeta[row.original.category];
        const Icon = meta.icon;

        return (
          <Badge variant="secondary" className="font-normal">
            <Icon className="mr-1 h-3 w-3" />
            {meta.label}
          </Badge>
        );
      },

      filterFn: (row, _columnId, filterValue: string) => {
        if (!filterValue || filterValue === "ALL") return true;
        return row.original.category === filterValue;
      },
    },

    {
      accessorKey: "accountId",

      header: "Account",

      cell: ({ row }) => {
        const account = accounts.find((a) => a.id === row.original.accountId);
        if (!account) return <span className="text-muted-foreground">—</span>;

        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{account.name}</span>
            <span className="text-xs text-muted-foreground">
              {accountTypeLabel[account.type]}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "type",

      header: "Type",

      cell: ({ row }) => {
        const isCredit = row.original.type === "CREDIT";

        return (
          <Badge
            variant="outline"
            className={
              isCredit
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
            }
          >
            {isCredit ? (
              <ArrowDownLeft className="mr-1 h-3 w-3" />
            ) : (
              <ArrowUpRight className="mr-1 h-3 w-3" />
            )}
            {isCredit ? "Credit" : "Debit"}
          </Badge>
        );
      },

      filterFn: (row, _columnId, filterValue: string) => {
        if (!filterValue || filterValue === "ALL") return true;
        return row.original.type === filterValue;
      },
    },

    {
      accessorKey: "amount",

      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            className="-mr-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        </div>
      ),

      cell: ({ row }) => {
        const isCredit = row.original.type === "CREDIT";

        return (
          <div
            className={`text-right font-medium tabular-nums ${
              isCredit
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-foreground"
            }`}
          >
            {isCredit ? "+" : "-"}
            {formatCurrency(row.original.amount)}
          </div>
        );
      },
    },

    {
      id: "actions",

      enableHiding: false,

      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" />}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            {onView && (
              <DropdownMenuItem
                onClick={() => onView(row.original)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                View details
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(String(row.original.id))
              }
            >
              Copy transaction ID
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              Edit transaction
            </DropdownMenuItem>

            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(row.original.id)}
            >
              Delete transaction
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
