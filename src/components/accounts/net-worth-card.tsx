import { CreditCard, Landmark, Scale, Wallet } from "lucide-react";
import { StatCardGrid } from "@/components/shared/stat-card-grid";
import type { Account } from "@/types/finance";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function NetWorthCard({ accounts }: { accounts: Account[] }) {
  // Bank, Cash, Wallet, and non-credit positive balances count as Assets
  const assets = accounts
    .filter((a) => a.type !== "CREDIT_CARD" && a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);

  // Credit cards and negative balances are liabilities (debts to pay)
  const liabilities = accounts.reduce((sum, a) => {
    if (a.type === "CREDIT_CARD") {
      // Credit card balance is owed debt
      return sum + Math.abs(a.balance);
    }
    if (a.balance < 0) {
      return sum + Math.abs(a.balance);
    }
    return sum;
  }, 0);

  const netWorth = assets - liabilities;
  const cardCount = accounts.filter((a) => a.type === "CREDIT_CARD").length;

  return (
    <StatCardGrid
      items={[
        { label: "Total net worth", value: formatCurrency(netWorth), icon: Scale, subtitle: "Assets minus liabilities" },
        { label: "Liquid assets", value: formatCurrency(assets), icon: Wallet, subtitle: "Banks, cash & wallets" },
        { label: "Credit card & debt", value: formatCurrency(liabilities), icon: CreditCard, subtitle: `${cardCount} credit card${cardCount === 1 ? "" : "s"}` },
        { label: "Accounts", value: accounts.length.toLocaleString("en-IN"), icon: Landmark, subtitle: "Linked to Rupiq" },
      ]}
    />
  );
}
