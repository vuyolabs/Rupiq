"use client";
import { formatCalendarDate } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  categoryMeta,
  accountTypeLabel,
  type Transaction,
  type Account,
  type Budget,
  type FinancialGoal,
} from "@/types/finance";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CreditCard,
  DollarSign,
  PiggyBank,
  Target,
  Tag,
  Building2,
  FileText,
} from "lucide-react";

export type ViewItem =
  | { type: "transaction"; data: Transaction; accountName?: string }
  | { type: "budget"; data: Budget; spent?: number }
  | { type: "goal"; data: FinancialGoal }
  | { type: "account"; data: Account; txCount?: number };

interface ViewDetailsDialogProps {
  item: ViewItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

function formatDate(date: string | Date | null | undefined) {
  if (!date) return "-";
  return formatCalendarDate(date);
}

export function ViewDetailsDialog({
  item,
  open,
  onOpenChange,
}: ViewDetailsDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {item.type === "transaction" && (
              <Tag className="h-5 w-5 text-primary" />
            )}
            {item.type === "budget" && (
              <PiggyBank className="h-5 w-5 text-primary" />
            )}
            {item.type === "goal" && (
              <Target className="h-5 w-5 text-primary" />
            )}
            {item.type === "account" && (
              <CreditCard className="h-5 w-5 text-primary" />
            )}
            <span className="capitalize">{item.type} Details</span>
          </DialogTitle>
          <DialogDescription>
            Complete information and record metadata.
          </DialogDescription>
        </DialogHeader>

        {/* 1. Transaction Details */}
        {item.type === "transaction" &&
          (() => {
            const tx = item.data;
            const meta = categoryMeta[tx.category];
            const Icon = meta?.icon;
            const isCredit = tx.type === "CREDIT";

            return (
              <div className="flex flex-col gap-4 py-2 text-sm">
                <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Amount
                    </span>
                    <span
                      className={`text-2xl font-bold tabular-nums ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}
                    >
                      {isCredit ? "+" : "-"} {formatCurrency(tx.amount)}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      isCredit
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
                    }
                  >
                    {isCredit ? (
                      <ArrowDownLeft className="mr-1 h-3.5 w-3.5" />
                    ) : (
                      <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
                    )}
                    {isCredit ? "Credit / Income" : "Debit / Expense"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border p-2.5">
                    <span className="text-muted-foreground block mb-0.5">
                      Category
                    </span>
                    <span className="font-semibold flex items-center gap-1.5">
                      {Icon && (
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      {meta?.label || tx.category}
                    </span>
                  </div>

                  <div className="rounded-lg border p-2.5">
                    <span className="text-muted-foreground block mb-0.5">
                      Account
                    </span>
                    <span className="font-semibold">
                      {item.accountName || `Account #${tx.accountId}`}
                    </span>
                  </div>

                  <div className="rounded-lg border p-2.5">
                    <span className="text-muted-foreground block mb-0.5">
                      Merchant / Payee
                    </span>
                    <span className="font-semibold">
                      {tx.merchant || "Not specified"}
                    </span>
                  </div>

                  <div className="rounded-lg border p-2.5">
                    <span className="text-muted-foreground block mb-0.5">
                      Transaction Date
                    </span>
                    <span className="font-semibold">
                      {formatDate(tx.occurredAt)}
                    </span>
                  </div>
                </div>

                {tx.description && (
                  <div className="rounded-lg border p-2.5 text-xs">
                    <span className="text-muted-foreground block mb-0.5">
                      Description / Note
                    </span>
                    <span className="text-foreground">{tx.description}</span>
                  </div>
                )}

                <div className="text-[11px] text-muted-foreground flex justify-between pt-1">
                  <span>Transaction ID: {tx.id}</span>
                  <span>
                    Created:{" "}
                    {tx.createdAt
                      ? new Date(tx.createdAt).toLocaleDateString("en-IN")
                      : new Date(tx.occurredAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            );
          })()}

        {/* 2. Budget Details */}
        {item.type === "budget" &&
          (() => {
            const b = item.data;
            const meta = categoryMeta[b.category];
            const spent = item.spent ?? 0;
            const remaining = b.amount - spent;
            const isOver = remaining < 0;
            const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;

            return (
              <div className="flex flex-col gap-4 py-2 text-sm">
                <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Budget Limit
                    </span>
                    <span className="text-2xl font-bold tabular-nums">
                      {formatCurrency(b.amount)}
                    </span>
                  </div>
                  <Badge
                    variant={
                      isOver
                        ? "destructive"
                        : pct > 80
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {isOver ? "Over Budget" : `${Math.round(pct)}% Utilized`}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border p-2.5">
                    <span className="text-muted-foreground block mb-0.5">
                      Category
                    </span>
                    <span className="font-semibold">
                      {meta?.label || b.category}
                    </span>
                  </div>
                  <div className="rounded-lg border p-2.5">
                    <span className="text-muted-foreground block mb-0.5">
                      Period
                    </span>
                    <span className="font-semibold">
                      Month {b.month}, {b.year}
                    </span>
                  </div>
                  <div className="rounded-lg border p-2.5">
                    <span className="text-muted-foreground block mb-0.5">
                      Actual Spent
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(spent)}
                    </span>
                  </div>
                  <div className="rounded-lg border p-2.5">
                    <span className="text-muted-foreground block mb-0.5">
                      Remaining Balance
                    </span>
                    <span
                      className={`font-semibold ${isOver ? "text-red-600 font-bold" : "text-emerald-600"}`}
                    >
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

        {/* 3. Goal Details */}
        {item.type === "goal" &&
          (() => {
            const g = item.data;
            const pct =
              g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
            const remaining = g.targetAmount - g.currentAmount;

            return (
              <div className="flex flex-col gap-4 py-2 text-sm">
                <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Target Goal
                    </span>
                    <span className="text-2xl font-bold tabular-nums">
                      {formatCurrency(g.targetAmount)}
                    </span>
                  </div>
                  <Badge variant={pct >= 100 ? "default" : "secondary"}>
                    {pct >= 100 ? "Completed" : `${Math.round(pct)}% Saved`}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border p-2.5">
                    <span className="text-muted-foreground block mb-0.5">
                      Saved So Far
                    </span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(g.currentAmount)}
                    </span>
                  </div>
                  <div className="rounded-lg border p-2.5">
                    <span className="text-muted-foreground block mb-0.5">
                      Remaining Needed
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(Math.max(remaining, 0))}
                    </span>
                  </div>
                  <div className="rounded-lg border p-2.5 col-span-2">
                    <span className="text-muted-foreground block mb-0.5">
                      Target Completion Date
                    </span>
                    <span className="font-semibold">
                      {g.targetDate
                        ? formatDate(g.targetDate)
                        : "No target date set"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

        {/* 4. Account Details */}
        {item.type === "account" &&
          (() => {
            const acc = item.data;
            return (
              <div className="flex flex-col gap-4 py-2 text-sm">
                <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Current Balance
                    </span>
                    <span
                      className={`text-2xl font-bold tabular-nums ${acc.balance < 0 ? "text-red-600" : ""}`}
                    >
                      {formatCurrency(acc.balance)}
                    </span>
                  </div>
                  <Badge variant="outline">{accountTypeLabel[acc.type]}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border p-2.5">
                    <span className="text-muted-foreground block mb-0.5">
                      Account Name
                    </span>
                    <span className="font-semibold">{acc.name}</span>
                  </div>
                  <div className="rounded-lg border p-2.5">
                    <span className="text-muted-foreground block mb-0.5">
                      Account Type
                    </span>
                    <span className="font-semibold">
                      {accountTypeLabel[acc.type]}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
      </DialogContent>
    </Dialog>
  );
}
