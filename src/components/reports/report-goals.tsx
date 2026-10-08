import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

interface GoalReportItem {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progress: number;
  targetDate: Date | null;
}

export function ReportGoals({ goals }: { goals: GoalReportItem[] }) {
  if (goals.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial goals</CardTitle>
        <CardDescription>Your progress towards each savings goal</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {goals.map((g) => {
          const pct = Math.min(g.progress, 100);
          const isDone = pct >= 100;

          return (
            <div key={g.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{g.name}</span>
                  {isDone && (
                    <Badge variant="default" className="text-xs">Completed</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground tabular-nums">
                    {formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(pct)}%
                  </Badge>
                </div>
              </div>

              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${isDone ? "bg-emerald-500" : "bg-primary"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {g.targetDate && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  <span>Due {formatDate(g.targetDate.toISOString())}</span>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
