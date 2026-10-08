"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { deleteBudget } from "@/actions/budget";
import { categoryMeta, type Budget } from "@/types/finance";
import { BudgetDialog } from "./budget-dialog";
import { ViewDetailsDialog, type ViewItem } from "@/components/shared/view-details-dialog";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

interface BudgetListProps {
  budgets: Budget[];
  categorySpending: Record<string, number>;
}

export function BudgetList({ budgets, categorySpending }: BudgetListProps) {
  const router = useRouter();
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const [viewItem, setViewItem] = useState<ViewItem | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleEdit(budget: Budget) { setEditingBudget(budget); setEditOpen(true); }
  function handleView(budget: Budget) {
    const spent = categorySpending[budget.category] ?? 0;
    setViewItem({ type: "budget", data: budget, spent });
    setViewOpen(true);
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      await deleteBudget(id);
      toast.success("Budget deleted");
      router.refresh();
    });
  }

  if (budgets.length === 0) {
    return <p className="text-muted-foreground text-sm">No budgets for this period. Add one to start tracking.</p>;
  }

  return (
    <>
      <BudgetDialog budget={editingBudget} open={editOpen} onOpenChange={setEditOpen} />
      <ViewDetailsDialog item={viewItem} open={viewOpen} onOpenChange={setViewOpen} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const meta = categoryMeta[budget.category];
          const Icon = meta.icon;
          const spent = categorySpending[budget.category] ?? 0;
          const pct = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
          const remaining = budget.amount - spent;
          const isOver = remaining < 0;

          return (
            <Card key={budget.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <Icon className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{budget.name ?? meta.label}</p>
                    <Badge variant="secondary" className="font-normal text-xs">{meta.label}</Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(budget)} className="gap-2">
                      <Eye className="h-4 w-4" />
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEdit(budget)}>Edit budget</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => handleDelete(budget.id)} disabled={isPending}>Delete budget</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isOver ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{formatCurrency(spent)} spent</span>
                  <span className={isOver ? "font-medium text-red-600 dark:text-red-400" : "font-medium text-muted-foreground"}>
                    {isOver ? `${formatCurrency(Math.abs(remaining))} over` : `${formatCurrency(remaining)} left`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Budget: {formatCurrency(budget.amount)} &middot; {Math.round(pct)}% used</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}