import { getGoals } from "@/actions/goals";
import { GoalList } from "@/components/goals/goal-list";
import { AddGoalButton } from "@/components/goals/add-goal-button";
import { GoalSummary } from "@/components/goals/goal-summary";
import type { FinancialGoal } from "@/types/finance";

export default async function GoalsPage() {
  const rawGoals = await getGoals();

  const goals: FinancialGoal[] = rawGoals.map((g) => ({
    id: g.id,
    name: g.name,
    targetAmount: Number(g.targetAmount),
    currentAmount: Number(g.currentAmount),
    targetDate: g.targetDate ? g.targetDate.toISOString() : null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Savings Goals</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Save with purpose — track your target milestones.
          </p>
        </div>
        <div className="self-start sm:self-auto">
          <AddGoalButton />
        </div>
      </div>

      <GoalSummary goals={goals} />

      <GoalList goals={goals} />
    </div>
  );
}