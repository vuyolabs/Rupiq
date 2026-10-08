import Link from "next/link";
import { Suspense } from "react";
import { getBudgets } from "@/actions/budget";
import { getTransactions } from "@/actions/transactions";
import { BudgetList } from "@/components/budgets/budget-list";
import { AddBudgetButton } from "@/components/budgets/add-budget-button";
import { BudgetSummary } from "@/components/budgets/budget-summary";
import { MonthPicker } from "@/components/reports/month-picker";
import type { Budget, TransactionCategory } from "@/types/finance";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const now = new Date();

  // Viewed period comes from ?month=&year=, falling back to the current month
  const paramMonth = Number(params.month);
  const paramYear = Number(params.year);
  const month = Number.isInteger(paramMonth) && paramMonth >= 1 && paramMonth <= 12 ? paramMonth : now.getMonth() + 1;
  const year = Number.isInteger(paramYear) && paramYear >= 2000 && paramYear <= 2100 ? paramYear : now.getFullYear();

  const [rawBudgets, rawTransactions] = await Promise.all([
    getBudgets(),
    getTransactions(),
  ]);

  const allBudgets: Budget[] = rawBudgets.map((b) => ({
    id: b.id,
    name: b.name,
    category: b.category as TransactionCategory,
    amount: Number(b.amount),
    month: b.month,
    year: b.year,
  }));
  const budgets = allBudgets.filter((b) => b.month === month && b.year === year);

  // Other months that have budgets, so a budget set for another month is never "lost"
  const otherPeriods = [
    ...new Map(
      allBudgets
        .filter((b) => b.month !== month || b.year !== year)
        .map((b) => [`${b.year}-${b.month}`, { month: b.month, year: b.year }]),
    ).values(),
  ].sort((a, b) => a.year - b.year || a.month - b.month);

  const categorySpending: Record<string, number> = {};
  for (const tx of rawTransactions) {
    const d = new Date(tx.occurredAt);
    if (
      tx.type === "DEBIT" &&
      d.getMonth() + 1 === month &&
      d.getFullYear() === year
    ) {
      const cat = tx.category as string;
      categorySpending[cat] = (categorySpending[cat] ?? 0) + Number(tx.amount);
    }
  }

  const periodLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {periodLabel} — track spending against your limits.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Suspense>
            <MonthPicker month={month} year={year} />
          </Suspense>
          <AddBudgetButton month={month} year={year} />
        </div>
      </div>

      {otherPeriods.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Budgets also set for:</span>
          {otherPeriods.map((p) => (
            <Link
              key={`${p.year}-${p.month}`}
              href={`/budgets?month=${p.month}&year=${p.year}`}
              className="rounded-full border border-border px-2.5 py-1 font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              {MONTH_NAMES[p.month - 1].slice(0, 3)} {p.year}
            </Link>
          ))}
        </div>
      )}

      <BudgetSummary budgets={budgets} categorySpending={categorySpending} periodLabel={periodLabel} />

      <BudgetList budgets={budgets} categorySpending={categorySpending} />
    </div>
  );
}
