"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import { createBudget, updateBudget } from "@/actions/budget";
import { categoriesForType, categoryMeta, type Budget } from "@/types/finance";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const monthItems = Object.fromEntries(MONTHS.map((m, i) => [String(i + 1), m]));

// Budgets cap spending, so only expense categories apply
const expenseCategories = categoriesForType("DEBIT");

interface BudgetDialogProps {
  budget?: Budget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Month/year to preselect for a new budget (defaults to the current month)
  defaultMonth?: number;
  defaultYear?: number;
}

export function BudgetDialog({ budget, open, onOpenChange, defaultMonth, defaultYear }: BudgetDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const isEdit = !!budget;
  const now = new Date();

  const [category, setCategory] = useState<string>(budget?.category ?? "FOOD");
  const budgetCategories =
    budget && !expenseCategories.includes(budget.category)
      ? [budget.category, ...expenseCategories]
      : expenseCategories;
  const categoryItems = Object.fromEntries(
    budgetCategories.map((c) => [c, categoryMeta[c].label]),
  );
  const [month, setMonth] = useState<string>(String(budget?.month ?? defaultMonth ?? now.getMonth() + 1));

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("category", category);
    formData.set("month", month);

    startTransition(async () => {
      const result = isEdit
        ? await updateBudget(budget.id, formData)
        : await createBudget(formData);

      if ("errors" in result && result.errors) {
        setErrors(result.errors as Record<string, string[]>);
        const firstErr = Object.values(result.errors)[0]?.[0];
        toast.error(firstErr ?? (isEdit ? "Failed to update budget" : "Failed to create budget"));
        return;
      }

      setErrors({});
      onOpenChange(false);

      const savedMonth = Number(month);
      const savedYear = Number(formData.get("year"));
      const period = `${MONTHS[savedMonth - 1]} ${savedYear}`;
      toast.success(isEdit ? `Budget updated for ${period}` : `Budget created for ${period}`);

      // On the Budgets page, jump to the month the budget belongs to so it is visible
      // (navigation re-renders the page with fresh data); elsewhere just refresh.
      if (pathname.startsWith("/budgets")) {
        router.push(`/budgets?month=${savedMonth}&year=${savedYear}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit budget" : "Add budget"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="category" value={category} />
          <input type="hidden" name="month" value={month} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget-name">Label <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="budget-name" name="name" placeholder="e.g. Groceries" defaultValue={budget?.name ?? ""} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget-category">Category</Label>
            <Select value={category} items={categoryItems} onValueChange={(v: string | null) => v && setCategory(v)}>
              <SelectTrigger id="budget-category" className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {budgetCategories.map((key) => {
                  const meta = categoryMeta[key];
                  const Icon = meta.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" />{meta.label}</span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-destructive">{errors.category[0]}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget-amount">Budget amount</Label>
            <Input id="budget-amount" name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" defaultValue={budget?.amount} required aria-invalid={!!errors.amount} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="budget-month">Month</Label>
              <Select value={month} items={monthItems} onValueChange={(v: string | null) => v && setMonth(v)}>
                <SelectTrigger id="budget-month" className="w-full"><SelectValue placeholder="Month" /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.month && <p className="text-xs text-destructive">{errors.month[0]}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="budget-year">Year</Label>
              <Input id="budget-year" name="year" type="number" min="2000" max="2100" defaultValue={budget?.year ?? defaultYear ?? now.getFullYear()} required aria-invalid={!!errors.year} />
              {errors.year && <p className="text-xs text-destructive">{errors.year[0]}</p>}
            </div>
          </div>

          {errors.form && <p className="text-xs text-destructive">{errors.form[0]}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                isEdit ? "Save changes" : "Add budget"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}