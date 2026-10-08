import Link from "next/link";
import { ArrowRight, PieChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryMeta, type Budget } from "@/types/finance";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function DashboardBudgets({
  budgets,
  categorySpending,
}: {
  budgets: Budget[];
  categorySpending: Record<string, number>;
}) {
  const topBudgets = budgets.slice(0, 3);

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">Monthly Budgets</CardTitle>
              <CardDescription className="text-xs">Current month spending limits</CardDescription>
            </div>
          </div>
          <Link href="/budgets" className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 pt-1">
          {budgets.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No budgets set for this month.
            </p>
          ) : (
            topBudgets.map((b) => {
              const meta = categoryMeta[b.category];
              const Icon = meta.icon;
              const spent = categorySpending[b.category] ?? 0;
              const pct = b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0;
              const isOver = spent > b.amount;

              return (
                <div key={b.id} className="flex flex-col gap-1.5 rounded-xl border p-2.5 bg-card">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{b.name ?? meta.label}</span>
                    </div>
                    <span className="tabular-nums font-medium">
                      {formatCurrency(spent)} / {formatCurrency(b.amount)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isOver ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-primary"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </div>
    </Card>
  );
}