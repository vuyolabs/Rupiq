import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from "lucide-react";
import { StatCardGrid } from "@/components/shared/stat-card-grid";
import type { Account } from "@/types/finance";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function StatCards({
  accounts,
  yearlyData,
}: {
  accounts: Account[];
  yearlyData: { month: string; income: number; expenses: number }[];
}) {
  // Only Bank, Cash, and Wallet accounts count towards liquid cash balance
  // Credit Cards are revolving credit/liabilities, not cash holdings
  const liquidAccounts = accounts.filter((a) => a.type !== "CREDIT_CARD");
  const totalBalance = liquidAccounts.reduce((sum, a) => sum + a.balance, 0);

  // Separate Credit Card outstanding balance
  const creditCardAccounts = accounts.filter((a) => a.type === "CREDIT_CARD");
  const creditCardLiability = creditCardAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0);

  // Month totals come from the server-side yearly aggregate (all transactions, not just the first page)
  const thisMonth = yearlyData[new Date().getMonth()];
  const income = thisMonth?.income ?? 0;
  const expenses = thisMonth?.expenses ?? 0;
  const net = income - expenses;

  const cards = [
    {
      label: "Total Liquid Balance",
      value: totalBalance,
      icon: Wallet,
      subtitle: creditCardLiability > 0 ? `${formatCurrency(creditCardLiability)} credit balance` : "Bank, cash & wallets",
    },
    {
      label: "Income this month",
      value: income,
      icon: ArrowUpRight,
      subtitle: "Total credit inflows",
    },
    {
      label: "Expenses this month",
      value: expenses,
      icon: ArrowDownRight,
      subtitle: "Total debit spending",
    },
    {
      label: "Net savings",
      value: net,
      icon: PiggyBank,
      subtitle: "Monthly cash surplus",
    },
  ];

  return (
    <StatCardGrid
      items={cards.map(({ label, value, icon, subtitle }) => ({
        label,
        value: formatCurrency(value),
        icon,
        subtitle,
      }))}
    />
  );
}
