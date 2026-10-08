import type { TransactionCategory } from "@/types/finance";

export interface CashflowPoint {
  month: string; // short axis label, e.g. "May"
  label: string; // full tooltip label, e.g. "May 2026"
  income: number;
  expenses: number;
}

export type CashflowTimeframe = "weekly" | "monthly" | "yearly";

export type CashflowSeries = Record<CashflowTimeframe, CashflowPoint[]>;

export type CategorySpend = { category: TransactionCategory; amount: number };

export interface CashflowData {
  series: CashflowSeries;
  // Expense totals by category for each timeframe's whole period
  categories: Record<CashflowTimeframe, CategorySpend[]>;
}

type Tx = {
  amount: number;
  type: string;
  category: TransactionCategory;
  occurredAt: Date | string;
};

/**
 * Buckets transactions into the same three timeframes as the dashboard overview:
 * weekly = days of the current week (Mon–Sun), monthly = 7-day blocks of the current
 * month, yearly = 12 months of the current year. Also totals expenses by category
 * over each timeframe's whole period.
 */
export function buildCashflowData(transactions: Tx[], now = new Date()): CashflowData {
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleString("en-IN", { month: "short" });

  // Weekly: Monday → Sunday of the current week
  const startOfWeek = new Date(year, month, now.getDate() - ((now.getDay() + 6) % 7));
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i);
    return {
      month: `${d.toLocaleString("en-IN", { weekday: "short" })} ${d.getDate()}`,
      label: d.toLocaleString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" }),
      income: 0,
      expenses: 0,
    };
  });

  // Monthly: 1–7, 8–14, 15–21, 22–end of the current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const ranges = [[1, 7], [8, 14], [15, 21], [22, daysInMonth]] as const;
  const monthly = ranges.map(([from, to]) => ({
    month: `${from} - ${to}`,
    label: `${from}–${to} ${monthName} ${year}`,
    income: 0,
    expenses: 0,
  }));

  // Yearly: Jan → Dec of the current year
  const yearly = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(year, i, 1);
    return {
      month: d.toLocaleString("en-IN", { month: "short" }),
      label: d.toLocaleString("en-IN", { month: "long", year: "numeric" }),
      income: 0,
      expenses: 0,
    };
  });

  const spend: Record<CashflowTimeframe, Map<TransactionCategory, number>> = {
    weekly: new Map(),
    monthly: new Map(),
    yearly: new Map(),
  };

  const add = (timeframe: CashflowTimeframe, slot: CashflowPoint | undefined, tx: Tx) => {
    if (!slot) return;
    if (tx.type === "CREDIT") {
      slot.income += tx.amount;
    } else {
      slot.expenses += tx.amount;
      const bucket = spend[timeframe];
      bucket.set(tx.category, (bucket.get(tx.category) ?? 0) + tx.amount);
    }
  };

  for (const tx of transactions) {
    const d = new Date(tx.occurredAt);
    if (d.getFullYear() === year) add("yearly", yearly[d.getMonth()], tx);
    if (d.getFullYear() === year && d.getMonth() === month) {
      add("monthly", monthly[ranges.findIndex(([from, to]) => d.getDate() >= from && d.getDate() <= to)], tx);
    }
    const dayIdx = Math.round(
      (new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - startOfWeek.getTime()) / 86_400_000,
    );
    if (dayIdx >= 0 && dayIdx < 7) add("weekly", weekly[dayIdx], tx);
  }

  const toList = (m: Map<TransactionCategory, number>): CategorySpend[] =>
    [...m].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);

  return {
    series: { weekly, monthly, yearly },
    categories: {
      weekly: toList(spend.weekly),
      monthly: toList(spend.monthly),
      yearly: toList(spend.yearly),
    },
  };
}
