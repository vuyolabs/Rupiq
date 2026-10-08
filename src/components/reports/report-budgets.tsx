import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categoryMeta } from "@/types/finance";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

interface BudgetReportItem {
  id: number;
  name: string | null;
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  utilization: number;
}

export function ReportBudgets({ budgets }: { budgets: BudgetReportItem[] }) {
  if (budgets.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget utilization</CardTitle>
        <CardDescription>How much of each budget you used this period</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {budgets.map((b) => {
          const meta = categoryMeta[b.category as keyof typeof categoryMeta];
          const Icon = meta?.icon;
          const pct = Math.min(b.utilization, 100);
          const isOver = b.remaining < 0;

          return (
            <div key={b.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                  <span className="font-medium">{b.name ?? meta?.label ?? b.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground tabular-nums">
                    {formatCurrency(b.spent)} / {formatCurrency(b.budget)}
                  </span>
                  <Badge
                    variant={isOver ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {Math.round(b.utilization)}%
                  </Badge>
                </div>
              </div>

              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isOver ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-primary"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
