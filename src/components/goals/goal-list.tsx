"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Eye, MoreHorizontal, Target } from "lucide-react";
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

import { deleteGoal } from "@/actions/goals";
import type { FinancialGoal } from "@/types/finance";
import { GoalDialog } from "./goal-dialog";
import { ViewDetailsDialog, type ViewItem } from "@/components/shared/view-details-dialog";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

interface GoalListProps {
  goals: FinancialGoal[];
}

export function GoalList({ goals }: GoalListProps) {
  const router = useRouter();
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const [viewItem, setViewItem] = useState<ViewItem | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleEdit(goal: FinancialGoal) {
    setEditingGoal(goal);
    setEditOpen(true);
  }

  function handleView(goal: FinancialGoal) {
    setViewItem({ type: "goal", data: goal });
    setViewOpen(true);
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      await deleteGoal(id);
      toast.success("Goal deleted");
      router.refresh();
    });
  }

  if (goals.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No goals yet. Add one to start saving with purpose.
      </p>
    );
  }

  return (
    <>
      <GoalDialog
        goal={editingGoal}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <ViewDetailsDialog
        item={viewItem}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const pct =
            goal.targetAmount > 0
              ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
              : 0;
          const remaining = goal.targetAmount - goal.currentAmount;
          const isDone = pct >= 100;

          return (
            <Card key={goal.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <Target className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{goal.name}</p>
                    <Badge
                      variant={isDone ? "default" : "secondary"}
                      className="font-normal text-xs"
                    >
                      {isDone ? "Completed" : `${Math.round(pct)}% done`}
                    </Badge>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-sm" />}
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(goal)} className="gap-2">
                      <Eye className="h-4 w-4" />
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEdit(goal)}>
                      Edit goal
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => handleDelete(goal.id)}
                      disabled={isPending}
                    >
                      Delete goal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isDone ? "bg-emerald-500" : "bg-primary"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrency(goal.currentAmount)} saved
                  </span>
                  <span className="font-medium">
                    {formatCurrency(goal.targetAmount)}
                  </span>
                </div>

                {!isDone && (
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(remaining)} remaining
                  </p>
                )}

                {goal.targetDate && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>Target: {formatDate(goal.targetDate)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}