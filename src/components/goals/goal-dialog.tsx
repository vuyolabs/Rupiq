"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { createGoal, updateGoal } from "@/actions/goals";
import type { FinancialGoal } from "@/types/finance";

interface GoalDialogProps {
  goal?: FinancialGoal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalDialog({ goal, open, onOpenChange }: GoalDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const isEdit = !!goal;

  const defaultDate = goal?.targetDate
    ? new Date(goal.targetDate).toISOString().slice(0, 10)
    : "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = isEdit
        ? await updateGoal(goal.id, formData)
        : await createGoal(formData);

      if ("errors" in result && result.errors) {
        setErrors(result.errors as Record<string, string[]>);
        toast.error(isEdit ? "Failed to update goal" : "Failed to create goal");
        return;
      }

      setErrors({});
      onOpenChange(false);
      toast.success(isEdit ? "Goal updated" : "Goal created");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit goal" : "Add goal"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-name">Goal name</Label>
            <Input
              id="goal-name"
              name="name"
              placeholder="e.g. Emergency fund"
              defaultValue={goal?.name}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name[0]}</p>
            )}
          </div>

          {/* Target amount */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-target">Target amount</Label>
            <Input
              id="goal-target"
              name="targetAmount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              defaultValue={goal?.targetAmount}
              aria-invalid={!!errors.targetAmount}
            />
            {errors.targetAmount && (
              <p className="text-xs text-destructive">{errors.targetAmount[0]}</p>
            )}
          </div>

          {/* Current amount */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-current">Saved so far</Label>
            <Input
              id="goal-current"
              name="currentAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              defaultValue={goal?.currentAmount ?? 0}
              aria-invalid={!!errors.currentAmount}
            />
            {errors.currentAmount && (
              <p className="text-xs text-destructive">{errors.currentAmount[0]}</p>
            )}
          </div>

          {/* Target date */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-date">
              Target date <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="goal-date"
              name="targetDate"
              type="date"
              defaultValue={defaultDate}
            />
          </div>

          {errors.form && (
            <p className="text-xs text-destructive">{errors.form[0]}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Add goal"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}