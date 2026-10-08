import { AlertTriangle, PiggyBank, Receipt, Wallet } from "lucide-react";
import { StatCardGrid } from "@/components/shared/stat-card-grid";
import type { Budget } from "@/types/finance";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function BudgetSummary({
  budgets,
  categorySpending,
  periodLabel,
}: {
  budgets: Budget[];
  categorySpending: Record<string, number>;
  periodLabel: string;
}) {
  const budgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const spent = budgets.reduce((sum, b) => sum + (categorySpending[b.category] ?? 0), 0);
  const remaining = budgeted - spent;
  const overCount = budgets.filter((b) => (categorySpending[b.category] ?? 0) > b.amount).length;
  const usedPct = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;

  return (
    <StatCardGrid
      items={[
        { label: "Total budgeted", value: formatCurrency(budgeted), icon: Wallet, subtitle: `${budgets.length} budget${budgets.length === 1 ? "" : "s"} for ${periodLabel}` },
        { label: "Spent so far", value: formatCurrency(spent), icon: Receipt, subtitle: `${usedPct}% of total budget used` },
        { label: remaining >= 0 ? "Remaining" : "Overspent", value: formatCurrency(Math.abs(remaining)), icon: PiggyBank, subtitle: remaining >= 0 ? `Left to spend in ${periodLabel}` : "Above your total limit" },
        { label: "Over budget", value: overCount.toLocaleString("en-IN"), icon: AlertTriangle, subtitle: overCount === 0 ? "All budgets on track" : `of ${budgets.length} categories exceeded` },
      ]}
    />
  );
}
