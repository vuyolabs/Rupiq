import { NetWorthCard } from "@/components/accounts/net-worth-card";
import { AccountCard } from "@/components/accounts/account-card";
import { getAccounts } from "@/actions/accounts";
import { getTransactions } from "@/actions/transactions";
import { AddAccountButton } from "@/components/accounts/add-account-button";
import type { Account, Transaction, AccountType, TransactionType, TransactionCategory } from "@/types/finance";

export default async function Accounts() {
  const [rawAccounts, rawTransactions] = await Promise.all([
    getAccounts(),
    getTransactions(),
  ]);

  const accounts: Account[] = rawAccounts.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type as AccountType,
    balance: Number(a.balance),
  }));

  const transactions: Transaction[] = rawTransactions.map((t) => ({
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Every bank account, card, and wallet in one place.
          </p>
        </div>
        <div className="self-start sm:self-auto">
          <AddAccountButton />
        </div>
      </div>

      <NetWorthCard accounts={accounts} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center col-span-full">
            <p className="text-muted-foreground text-sm">
              No accounts yet. Add one to get started.
            </p>
          </div>
        ) : (
          accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              transactions={transactions}
            />
          ))
        )}
      </div>
    </div>
  );
}