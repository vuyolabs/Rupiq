"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { CashflowPoint, CashflowSeries, CashflowTimeframe } from "@/lib/cashflow";

type Timeframe = CashflowTimeframe;

const TIMEFRAMES: { value: Timeframe; label: string; description: string }[] = [
  { value: "weekly", label: "Weekly", description: "Current week cashflow breakdown (Mon — Sun)" },
  { value: "monthly", label: "Monthly", description: "Current month cashflow progression" },
  { value: "yearly", label: "Yearly", description: "Current year 12-month overview" },
];

// Same income/expense hues as the dashboard overview chart; the dark-mode green is
// stepped down so it stays in the readable lightness band on dark surfaces.
const chartConfig = {
  income: {
    label: "Income",
    theme: { light: "#10B981", dark: "#12AB7A" },
  },
  expenses: {
    label: "Expenses",
    theme: { light: "#E11D48", dark: "#E11D48" },
  },
} satisfies ChartConfig;

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function CashflowBarChart({
  series,
  timeframe,
  onTimeframeChange,
  className,
}: {
  series: CashflowSeries;
  timeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  className?: string;
}) {
  const data = series[timeframe];
  const active = TIMEFRAMES.find((t) => t.value === timeframe)!;
  const hasData = data.some((d) => d.income > 0 || d.expenses > 0);

  return (
    <Card className={cn("min-w-0", className)}>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base font-semibold">Cashflow analysis</CardTitle>
          <CardDescription className="text-xs">{active.description}</CardDescription>
        </div>

        {/* Segmented Timeframe Switcher (matches the dashboard overview chart) */}
        <div className="inline-flex items-center self-start rounded-xl border border-border/60 bg-muted/60 p-1 sm:self-auto">
          {TIMEFRAMES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onTimeframeChange(t.value)}
              aria-pressed={timeframe === t.value}
              className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                timeframe === t.value
                  ? "bg-background font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <BarChart data={data} barGap={2} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v: number) => compactCurrency.format(v)}
              />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(_, payload) =>
                      (payload?.[0]?.payload as CashflowPoint | undefined)?.label ?? ""
                    }
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span
                            className="size-2 rounded-[2px]"
                            style={{ background: `var(--color-${name})` }}
                          />
                          {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                        </span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {currency.format(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
            No transactions in this period
          </div>
        )}
      </CardContent>
    </Card>
  );
}
