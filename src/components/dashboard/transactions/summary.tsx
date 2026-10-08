import { ArrowDownRight, ArrowUpRight, ListOrdered, Scale } from "lucide-react";
import { StatCardGrid } from "@/components/shared/stat-card-grid";
import type { Transaction } from "@/types/finance";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function TransactionsSummary({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const income = transactions
    .filter((tx) => tx.type === "CREDIT")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = transactions
    .filter((tx) => tx.type === "DEBIT")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const net = income - expenses;

  const cards = [
    {
      label: "Total income",
      value: formatCurrency(income),
      icon: ArrowUpRight,
      subtitle: "All-time credit inflows",
    },
    {
      label: "Total expenses",
      value: formatCurrency(expenses),
      icon: ArrowDownRight,
      subtitle: "All-time debit spending",
    },
    {
      label: "Net",
      value: `${net >= 0 ? "+" : "-"}${formatCurrency(Math.abs(net))}`,
      icon: Scale,
      subtitle: "Income minus expenses",
    },
    {
      label: "Transactions",
      value: transactions.length.toLocaleString("en-IN"),
      icon: ListOrdered,
      subtitle: "Total recorded entries",
    },
  ];

  return <StatCardGrid items={cards} />;
}
