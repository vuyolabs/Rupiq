import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FinancialGoal } from "@/types/finance";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function DashboardGoals({ goals }: { goals: FinancialGoal[] }) {
  const topGoals = goals.slice(0, 3);

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">Savings Goals</CardTitle>
              <CardDescription className="text-xs">Progress on your targets</CardDescription>
            </div>
          </div>
          <Link href="/goals" className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 pt-1">
          {goals.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No financial goals set yet.
            </p>
          ) : (
            topGoals.map((g) => {
              const pct = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0;
              const isDone = pct >= 100;

              return (
                <div key={g.id} className="flex flex-col gap-1.5 rounded-xl border p-2.5 bg-card">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{g.name}</span>
                    <Badge variant={isDone ? "default" : "secondary"} className="text-[10px] h-4.5 px-1.5">
                      {isDone ? "Achieved" : `${Math.round(pct)}%`}
                    </Badge>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isDone ? "bg-emerald-500" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
                    <span>{formatCurrency(g.currentAmount)}</span>
                    <span>Target: {formatCurrency(g.targetAmount)}</span>
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