"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownLeft, ArrowUpRight, BarChart3, CreditCard, ListOrdered, PiggyBank, Target } from "lucide-react";
import { categoryMeta, accountTypeLabel } from "@/types/finance";

interface ReportTablesProps {
  report: {
    summary: {
      income: number;
      expenses: number;
      savings: number;
      savingsRate: number;
    };
    categorySpending: { category: string; amount: number }[];
    budgets: {
      id: number;
      name: string | null;
      category: string;
      budget: number;
      spent: number;
      remaining: number;
      utilization: number;
    }[];
    accounts: {
      id: number;
      name: string;
      type: string;
      balance: number;
    }[];
    goals: {
      id: number;
      name: string;
      targetAmount: number;
      currentAmount: number;
      remainingAmount: number;
      progress: number;
      targetDate: Date | string | null;
    }[];
    transactions: {
      id: number;
      amount: number;
      type: string;
      category: string;
      merchant: string | null;
      description: string | null;
      occurredAt: string;
    }[];
  };
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

export function ReportDataViewer({ report }: ReportTablesProps) {
  const [activeTab, setActiveTab] = useState("transactions");

  return (
    <Card className="mt-4">
      <CardHeader>
        <div>
          <CardTitle>Detailed Statement & Data Breakdown</CardTitle>
          <CardDescription>
            Explore breakdown tables across transactions, category spending, budgets, goals, and accounts.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full mb-4">
            <TabsTrigger value="transactions" className="gap-1 text-xs">
              <ListOrdered className="h-3.5 w-3.5" />
              Transactions ({report.transactions.length})
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-1 text-xs">
              <BarChart3 className="h-3.5 w-3.5" />
              Categories ({report.categorySpending.length})
            </TabsTrigger>
            <TabsTrigger value="budgets" className="gap-1 text-xs">
              <PiggyBank className="h-3.5 w-3.5" />
              Budgets ({report.budgets.length})
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-1 text-xs">
              <Target className="h-3.5 w-3.5" />
              Goals ({report.goals.length})
            </TabsTrigger>
            <TabsTrigger value="accounts" className="gap-1 text-xs">
              <CreditCard className="h-3.5 w-3.5" />
              Accounts ({report.accounts.length})
            </TabsTrigger>
          </TabsList>

          {/* 1. Transactions Table */}
          <TabsContent value="transactions">
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No transactions recorded for this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.transactions.map((t) => {
                      const meta = categoryMeta[t.category as keyof typeof categoryMeta];
                      const Icon = meta?.icon;
                      const isCredit = t.type === "CREDIT";

                      return (
                        <TableRow key={t.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Intl.DateTimeFormat("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }).format(new Date(t.occurredAt))}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-xs">
                                {t.merchant || t.description || meta?.label || t.category}
                              </span>
                              {t.merchant && t.description && (
                                <span className="text-[10px] text-muted-foreground">{t.description}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs font-normal">
                              {Icon && <Icon className="mr-1 h-3 w-3" />}
                              {meta?.label || t.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                isCredit
                                  ? "text-emerald-700 dark:text-emerald-300 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40"
                                  : "text-red-700 dark:text-red-300 border-red-300 bg-red-50 dark:bg-red-950/40"
                              }`}
                            >
                              {isCredit ? (
                                <ArrowDownLeft className="mr-1 h-3 w-3" />
                              ) : (
                                <ArrowUpRight className="mr-1 h-3 w-3" />
                              )}
                              {isCredit ? "Income" : "Expense"}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium text-xs tabular-nums ${isCredit ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                            {isCredit ? "+" : "-"} {formatCurrency(t.amount)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* 2. Category Spending */}
          <TabsContent value="categories">
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                    <TableHead className="text-right">% of Total Expenses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.categorySpending.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        No category spending data for this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.categorySpending.map((c) => {
                      const meta = categoryMeta[c.category as keyof typeof categoryMeta];
                      const Icon = meta?.icon;
                      const pct = report.summary.expenses > 0 ? (c.amount / report.summary.expenses) * 100 : 0;

                      return (
                        <TableRow key={c.category}>
                          <TableCell className="font-medium text-xs">
                            <div className="flex items-center gap-2">
                              {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                              <span>{meta?.label || c.category}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium text-xs tabular-nums">
                            {formatCurrency(c.amount)}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground tabular-nums">
                            {pct.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* 3. Budgets */}
          <TabsContent value="budgets">
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Budget Label</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Budget Limit</TableHead>
                    <TableHead className="text-right">Actual Spent</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.budgets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No budgets set for this month.
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.budgets.map((b) => {
                      const isOver = b.remaining < 0;
                      return (
                        <TableRow key={b.id}>
                          <TableCell className="font-medium text-xs">{b.name || b.category}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{b.category}</TableCell>
                          <TableCell className="text-right text-xs tabular-nums">{formatCurrency(b.budget)}</TableCell>
                          <TableCell className="text-right text-xs tabular-nums font-medium">{formatCurrency(b.spent)}</TableCell>
                          <TableCell className={`text-right text-xs tabular-nums ${isOver ? "text-red-600 font-semibold" : ""}`}>
                            {formatCurrency(b.remaining)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={isOver ? "destructive" : b.utilization > 80 ? "secondary" : "outline"} className="text-[10px]">
                              {isOver ? "Over Budget" : `${Math.round(b.utilization)}% used`}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* 4. Goals */}
          <TabsContent value="goals">
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Goal</TableHead>
                    <TableHead className="text-right">Target</TableHead>
                    <TableHead className="text-right">Saved So Far</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead className="text-right">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.goals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No goals found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.goals.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium text-xs">{g.name}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{formatCurrency(g.targetAmount)}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums font-medium text-emerald-600">
                          {formatCurrency(g.currentAmount)}
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                          {formatCurrency(g.remainingAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={g.progress >= 100 ? "default" : "secondary"} className="text-[10px]">
                            {g.progress >= 100 ? "Completed" : `${Math.round(g.progress)}%`}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* 5. Accounts */}
          <TabsContent value="accounts">
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Current Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.accounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        No accounts linked.
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.accounts.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium text-xs">{a.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {accountTypeLabel[a.type as keyof typeof accountTypeLabel] || a.type}
                        </TableCell>
                        <TableCell className={`text-right font-medium text-xs tabular-nums ${a.balance < 0 ? "text-red-600" : ""}`}>
                          {formatCurrency(a.balance)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}