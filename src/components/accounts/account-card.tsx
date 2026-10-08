"use client";
import { formatCalendarDate } from "@/lib/utils";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  accountTypeIcon,
  accountTypeLabel,
  type Account,
  type Transaction,
} from "@/types/finance";
import { deleteAccount } from "@/actions/accounts";
import { AccountDialog } from "./account-dialog";
import {
  ViewDetailsDialog,
  type ViewItem,
} from "@/components/shared/view-details-dialog";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
function formatDate(iso: string) {
  return formatCalendarDate(iso, { day: "2-digit", month: "short" });
}

export function AccountCard({
  account,
  transactions,
}: {
  account: Account;
  transactions: Transaction[];
}) {
  const router = useRouter();
  const Icon = accountTypeIcon[account.type];
  const [editOpen, setEditOpen] = useState(false);
  const [viewItem, setViewItem] = useState<ViewItem | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isCreditCard = account.type === "CREDIT_CARD";
  const accountTransactions = transactions.filter(
    (tx) => tx.accountId === account.id,
  );
  const lastTransaction = accountTransactions[0];
  const now = new Date();
  const thisMonthCount = accountTransactions.filter((tx) => {
    const d = new Date(tx.occurredAt);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;
  const isNegative = account.balance < 0;

  function handleView() {
    setViewItem({
      type: "account",
      data: account,
      txCount: accountTransactions.length,
    });
    setViewOpen(true);
  }

  function handleDelete() {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteAccount(account.id);
      if (!result.success) {
        const msg = result.error ?? "Failed to delete account";
        setDeleteError(msg);
        toast.error(msg);
        return;
      }
      toast.success("Account deleted");
      router.refresh();
    });
  }

  return (
    <>
      <Card className="flex flex-col justify-between rounded-2xl border-border/70 hover:border-primary/40 transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm leading-none">
                {account.name}
              </p>
              <Badge
                variant="secondary"
                className="mt-1 text-[10px] py-0 px-1.5 font-normal"
              >
                {accountTypeLabel[account.type]}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full"
                />
              }
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={handleView}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 pt-2">
          <div>
            <span className="text-[11px] text-muted-foreground font-medium">
              {isCreditCard ? "Outstanding Due / Balance" : "Available Balance"}
            </span>
            <p
              className={`text-2xl font-bold tracking-tight tabular-nums mt-0.5 ${
                isCreditCard && account.balance > 0
                  ? "text-red-500 dark:text-red-400"
                  : isNegative
                    ? "text-red-500 dark:text-red-400"
                    : "text-foreground"
              }`}
            >
              {formatCurrency(account.balance)}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-2.5">
            <span>
              {thisMonthCount > 0
                ? `${thisMonthCount} txns this month`
                : "No activity yet"}
            </span>
            {lastTransaction && (
              <span>Last: {formatDate(lastTransaction.occurredAt)}</span>
            )}
          </div>

          {deleteError && (
            <p className="text-xs text-destructive">{deleteError}</p>
          )}
        </CardContent>
      </Card>

      <AccountDialog
        account={account}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      {viewItem && (
        <ViewDetailsDialog
          item={viewItem}
          open={viewOpen}
          onOpenChange={setViewOpen}
        />
      )}
    </>
  );
}
