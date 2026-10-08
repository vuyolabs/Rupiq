import Link from "next/link";
import { ArrowRight, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { accountTypeIcon, accountTypeLabel, type Account } from "@/types/finance";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function DashboardAccounts({ accounts }: { accounts: Account[] }) {
  const topAccounts = accounts.slice(0, 3);

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">Linked Accounts</CardTitle>
              <CardDescription className="text-xs">Wallets, cards & banks</CardDescription>
            </div>
          </div>
          <Link href="/accounts" className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 pt-1">
          {accounts.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No accounts added yet.
            </p>
          ) : (
            topAccounts.map((a) => {
              const Icon = accountTypeIcon[a.type];
              const isNegative = a.balance < 0;

              return (
                <div key={a.id} className="flex items-center justify-between rounded-xl border p-2.5 bg-card">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{a.name}</span>
                      <span className="text-[10px] text-muted-foreground">{accountTypeLabel[a.type]}</span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      isNegative ? "text-red-600 dark:text-red-400" : ""
                    }`}
                  >
                    {formatCurrency(a.balance)}
                  </span>
                </div>
              );
            })
          )}
        </CardContent>
      </div>
    </Card>
  );
}