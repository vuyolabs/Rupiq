import { CheckCircle2, Flag, PiggyBank, Target } from "lucide-react";
import { StatCardGrid } from "@/components/shared/stat-card-grid";
import type { FinancialGoal } from "@/types/finance";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function GoalSummary({ goals }: { goals: FinancialGoal[] }) {
  const target = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const saved = goals.reduce((sum, g) => sum + Math.min(g.currentAmount, g.targetAmount), 0);
  const left = Math.max(target - saved, 0);
  const completed = goals.filter((g) => g.currentAmount >= g.targetAmount).length;
  const progressPct = target > 0 ? Math.round((saved / target) * 100) : 0;

  return (
    <StatCardGrid
      items={[
        { label: "Total target", value: formatCurrency(target), icon: Target, subtitle: `Across ${goals.length} goal${goals.length === 1 ? "" : "s"}` },
        { label: "Saved so far", value: formatCurrency(saved), icon: PiggyBank, subtitle: `${progressPct}% of all targets` },
        { label: "Left to save", value: formatCurrency(left), icon: Flag, subtitle: "Remaining to reach every goal" },
        { label: "Completed", value: `${completed} / ${goals.length}`, icon: CheckCircle2, subtitle: completed === goals.length && goals.length > 0 ? "Every goal reached" : "Goals fully funded" },
      ]}
    />
  );
}
