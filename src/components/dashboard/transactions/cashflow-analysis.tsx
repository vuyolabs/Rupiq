"use client";

import { useState } from "react";
import { CashflowBarChart } from "@/components/dashboard/transactions/cashflow-bar-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import type { CashflowData, CashflowTimeframe } from "@/lib/cashflow";

const PERIOD_COPY: Record<CashflowTimeframe, { description: string; empty: string }> = {
  weekly: { description: "This week's expenses", empty: "No expenses this week" },
  monthly: { description: "This month's expenses", empty: "No expenses this month" },
  yearly: { description: "This year's expenses", empty: "No expenses this year" },
};

// Bar chart + category doughnut share one timeframe so both always describe the same period
export function CashflowAnalysis({ data }: { data: CashflowData }) {
  const [timeframe, setTimeframe] = useState<CashflowTimeframe>("weekly");
  const copy = PERIOD_COPY[timeframe];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <CashflowBarChart
        className="lg:col-span-2"
        series={data.series}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />
      <CategoryChart
        className="min-w-0"
        data={data.categories[timeframe]}
        description={copy.description}
        emptyTitle={copy.empty}
      />
    </div>
  );
}
