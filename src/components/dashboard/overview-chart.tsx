"use client";

import { useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

interface DataPoint {
  month: string;
  income: number;
  expenses: number;
}

interface OverviewChartProps {
  monthlyData: DataPoint[];
  weeklyData?: DataPoint[];
  yearlyData?: DataPoint[];
}

type Timeframe = "weekly" | "monthly" | "yearly";

const chartConfig = {
  income: {
    label: "Income",
    color: "#10B981",
  },
  expenses: {
    label: "Expenses",
    color: "#E11D48",
  },
} satisfies ChartConfig;

export function OverviewChart({
  monthlyData = [],
  weeklyData = [],
  yearlyData = [],
}: OverviewChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("weekly");

  const chartData = useMemo(() => {
    if (timeframe === "weekly" && weeklyData.length > 0) {
      return weeklyData;
    }
    if (timeframe === "monthly" && monthlyData.length > 0) {
      return monthlyData;
    }
    if (timeframe === "yearly" && yearlyData.length > 0) {
      return yearlyData;
    }
    return weeklyData;
  }, [timeframe, monthlyData, weeklyData, yearlyData]);

  return (
    <Card className="lg:col-span-2 rounded-2xl border-border/80 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-base font-semibold">Income vs Expenses</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {timeframe === "weekly"
              ? "Current week cashflow breakdown (Mon — Sun)"
              : timeframe === "monthly"
              ? "Current month cashflow progression"
              : "Current year 12-month overview"}
          </CardDescription>
        </div>

        {/* Segmented Timeframe Switcher */}
        <div className="inline-flex items-center rounded-xl bg-muted/60 p-1 border border-border/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeframe("weekly")}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              timeframe === "weekly"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("monthly")}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              timeframe === "monthly"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("yearly")}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              timeframe === "yearly"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E11D48" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.25} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs text-muted-foreground"
            />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#10B981"
              strokeWidth={2.5}
              fill="url(#fillIncome)"
              dot={{ r: 3, fill: "#10B981" }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#E11D48"
              strokeWidth={2.5}
              fill="url(#fillExpenses)"
              dot={{ r: 3, fill: "#E11D48" }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}