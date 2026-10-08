"use client";

import { Label, Pie, PieChart } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { categoryMeta, type TransactionCategory } from "@/types/finance";

// Validated categorical palette (fixed order, light + dark steps), see globals.css --cat-*
const SLOT_COLORS = [
  "var(--cat-1)",
  "var(--cat-2)",
  "var(--cat-3)",
  "var(--cat-4)",
  "var(--cat-5)",
];
const OTHER_COLOR = "var(--cat-other)";
const MAX_SLICES = SLOT_COLORS.length;

type Slice = { key: string; label: string; amount: number; fill: string };

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

// Top categories keep their own slot; everything else folds into "Other"
function toSlices(
  data: { category: TransactionCategory; amount: number }[],
): Slice[] {
  const sorted = data
    .filter((d) => d.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const needsOther = sorted.length > MAX_SLICES;
  const head = needsOther ? sorted.slice(0, MAX_SLICES - 1) : sorted;
  const tail = needsOther ? sorted.slice(MAX_SLICES - 1) : [];

  const slices: Slice[] = head.map((d, i) => ({
    key: d.category,
    label: categoryMeta[d.category]?.label ?? d.category,
    amount: d.amount,
    fill: SLOT_COLORS[i],
  }));

  if (tail.length) {
    slices.push({
      key: "__other",
      label: `Other (${tail.length} categories)`,
      amount: tail.reduce((sum, d) => sum + d.amount, 0),
      fill: OTHER_COLOR,
    });
  }

  return slices;
}

export function CategoryChart({
  data,
  description = "This month's expenses",
  emptyTitle = "No expenses this month",
  className,
}: {
  data: { category: TransactionCategory; amount: number }[];
  description?: string;
  emptyTitle?: string;
  className?: string;
}) {
  const slices = toSlices(data);
  const total = slices.reduce((sum, d) => sum + d.amount, 0);

  const chartConfig = Object.fromEntries(
    slices.map((s) => [s.key, { label: s.label, color: s.fill }]),
  ) satisfies ChartConfig;

  return (
    <Card className={cn("rounded-2xl border-border/80 shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Spending by category
        </CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex h-75 flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{emptyTitle}</p>
              <p className="max-w-56 text-xs text-muted-foreground">
                Add a debit transaction and your category breakdown will appear
                here.
              </p>
            </div>
          </div>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square w-full max-w-64"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      nameKey="key"
                      formatter={(value, _name, item) => (
                        <div className="flex w-full items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: item.payload.fill }}
                          />
                          <span className="text-muted-foreground">
                            {item.payload.label}
                          </span>
                          <span className="ml-auto pl-3 font-mono font-medium tabular-nums text-foreground">
                            {formatCurrency(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={slices}
                  dataKey="amount"
                  nameKey="key"
                  innerRadius="62%"
                  outerRadius="100%"
                  paddingAngle={slices.length > 1 ? 1 : 0}
                  cornerRadius={4}
                  stroke="var(--card)"
                  strokeWidth={2}
                  isAnimationActive
                >
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !("cx" in viewBox)) return null;
                      const cx = viewBox.cx ?? 0;
                      const cy = viewBox.cy ?? 0;
                      return (
                        <text x={cx} y={cy} textAnchor="middle">
                          <tspan
                            x={cx}
                            y={cy - 4}
                            className="fill-foreground text-lg font-semibold"
                          >
                            {formatCurrency(total)}
                          </tspan>
                          <tspan
                            x={cx}
                            y={cy + 16}
                            className="fill-muted-foreground text-xs"
                          >
                            Total spent
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <ul className="mt-5 flex flex-col gap-2.5">
              {slices.map((s) => {
                const pct = (s.amount / total) * 100;
                return (
                  <li key={s.key} className="flex items-center gap-2.5 text-sm">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                      style={{ backgroundColor: s.fill }}
                    />
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">
                      {s.label}
                    </span>
                    <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                      {pct < 1 ? "<1" : Math.round(pct)}%
                    </span>
                    <span className="w-20 text-right font-medium tabular-nums">
                      {formatCurrency(s.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
