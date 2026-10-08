import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  TrendingUp,
} from "lucide-react";
import { StatCardGrid } from "@/components/shared/stat-card-grid";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

interface ReportSummaryProps {
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

export function ReportSummary({ income, expenses, savings, savingsRate }: ReportSummaryProps) {
  return (
    <StatCardGrid
      items={[
        { label: "Income", value: formatCurrency(income), icon: ArrowUpRight, subtitle: "Credit inflows this month" },
        { label: "Expenses", value: formatCurrency(expenses), icon: ArrowDownRight, subtitle: "Debit spending this month" },
        { label: "Net savings", value: formatCurrency(savings), icon: PiggyBank, subtitle: "Income minus expenses" },
        { label: "Savings rate", value: `${savingsRate.toFixed(1)}%`, icon: TrendingUp, subtitle: "Share of income saved" },
      ]}
    />
  );
}
