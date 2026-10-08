import { TransactionsSummary } from "@/components/dashboard/transactions/summary";
import { TransactionsTable } from "@/components/dashboard/transactions/data-table";
import { CashflowAnalysis } from "@/components/dashboard/transactions/cashflow-analysis";
import { buildCashflowData } from "@/lib/cashflow";
import { getPaginatedTransactions, getTransactions } from "@/actions/transactions";
import { getAccounts } from "@/actions/accounts";
import type { Transaction, Account, TransactionType, TransactionCategory, AccountType } from "@/types/finance";

export default async function Transactions() {
  const [paginatedTx, rawAccounts, sampleTx] = await Promise.all([
    getPaginatedTransactions({ page: 1, pageSize: 15 }),
    getAccounts(),
    getTransactions(),
  ]);

  const accounts: Account[] = rawAccounts.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type as AccountType,
    balance: Number(a.balance),
  }));

  const transactionsForSummary: Transaction[] = sampleTx.map((t) => ({
    id: t.id,
    amount: Number(t.amount),
    type: t.type as TransactionType,
    category: t.category as TransactionCategory,
    merchant: t.merchant,
    description: t.description,
    emoji: t.emoji,
    occurredAt: t.occurredAt,
    accountId: t.accountId,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));

  // Weekly / monthly / yearly cashflow + category spend, same buckets as the dashboard
  const cashflow = buildCashflowData(transactionsForSummary);

  return (
    <div className="flex flex-col gap-6">
      <TransactionsSummary transactions={transactionsForSummary} />

      <CashflowAnalysis data={cashflow} />

      <TransactionsTable
        initialData={paginatedTx.data}
        initialTotal={paginatedTx.meta.total}
        accounts={accounts}
      />
    </div>
  );
}