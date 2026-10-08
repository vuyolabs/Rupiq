import "server-only";

import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { TRANSACTION_CATEGORIES } from "@/types/finance";

const periodSchema = {
  month: z
    .number()
    .int()
    .min(1)
    .max(12)
    .optional()
    .describe("Month 1-12. Omit to cover the whole year."),
  year: z.number().int().min(2000).max(2100).optional().describe("Four-digit year. Defaults to the current year."),
};

const typeSchema = z
  .enum(["DEBIT", "CREDIT"])
  .optional()
  .describe("DEBIT = money spent (default), CREDIT = money received");

function periodRange(month?: number, year?: number) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  if (month) {
    return {
      label: new Date(y, month - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" }),
      gte: new Date(y, month - 1, 1),
      lte: new Date(y, month, 0, 23, 59, 59, 999),
    };
  }
  return {
    label: `Year ${y}`,
    gte: new Date(y, 0, 1),
    lte: new Date(y, 11, 31, 23, 59, 59, 999),
  };
}

const pct = (part: number, total: number) =>
  total > 0 ? Number(((part / total) * 100).toFixed(1)) : 0;

// Every query is scoped to `userId`; the model never chooses whose data it reads.
export function createFinanceTools(userId: number) {
  return {
    getCashflowSummary: tool({
      description:
        "Total income, total expenses, net savings and savings rate for a month or year. Use for overviews and 'how am I doing' questions.",
      inputSchema: z.object(periodSchema),
      execute: async ({ month, year }) => {
        const range = periodRange(month, year);
        const totals = await prisma.transaction.groupBy({
          by: ["type"],
          where: { userId, occurredAt: { gte: range.gte, lte: range.lte } },
          _sum: { amount: true },
          _count: { id: true },
        });
        const income = Number(totals.find((t) => t.type === "CREDIT")?._sum.amount ?? 0);
        const expenses = Number(totals.find((t) => t.type === "DEBIT")?._sum.amount ?? 0);
        return {
          period: range.label,
          income,
          expenses,
          netSavings: income - expenses,
          savingsRatePercent: pct(income - expenses, income),
          transactionCount: totals.reduce((n, t) => n + t._count.id, 0),
        };
      },
    }),

    getCategoryBreakdown: tool({
      description:
        "Spending (or income) grouped by category, largest first, with share of total. Use for 'where did my money go' questions.",
      inputSchema: z.object({
        ...periodSchema,
        type: typeSchema,
      }),
      execute: async ({ month, year, type }) => {
        const range = periodRange(month, year);
        const rows = await prisma.transaction.groupBy({
          by: ["category"],
          where: { userId, type: type ?? "DEBIT", occurredAt: { gte: range.gte, lte: range.lte } },
          _sum: { amount: true },
          _count: { id: true },
          orderBy: { _sum: { amount: "desc" } },
          take: 8,
        });
        const total = rows.reduce((acc, r) => acc + Number(r._sum.amount ?? 0), 0);
        return {
          period: range.label,
          type: type ?? "DEBIT",
          total,
          categories: rows.map((r) => ({
            category: r.category,
            amount: Number(r._sum.amount ?? 0),
            transactions: r._count.id,
            sharePercent: pct(Number(r._sum.amount ?? 0), total),
          })),
        };
      },
    }),

    getTopMerchants: tool({
      description: "Merchants/vendors the user paid (or received from) the most, with totals and share.",
      inputSchema: z.object({
        ...periodSchema,
        type: typeSchema,
      }),
      execute: async ({ month, year, type }) => {
        const range = periodRange(month, year);
        const rows = await prisma.transaction.groupBy({
          by: ["merchant"],
          where: {
            userId,
            type: type ?? "DEBIT",
            merchant: { not: null },
            occurredAt: { gte: range.gte, lte: range.lte },
          },
          _sum: { amount: true },
          _count: { id: true },
          orderBy: { _sum: { amount: "desc" } },
          take: 8,
        });
        const total = rows.reduce((acc, r) => acc + Number(r._sum.amount ?? 0), 0);
        return {
          period: range.label,
          total,
          merchants: rows.map((r) => ({
            merchant: r.merchant,
            amount: Number(r._sum.amount ?? 0),
            transactions: r._count.id,
            sharePercent: pct(Number(r._sum.amount ?? 0), total),
          })),
        };
      },
    }),

    getBudgetStatus: tool({
      description: "Budget limits vs actual spending per category for a month, including overspend.",
      inputSchema: z.object({
        month: periodSchema.month.describe("Month 1-12. Defaults to the current month."),
        year: periodSchema.year,
      }),
      execute: async ({ month, year }) => {
        const now = new Date();
        const m = month ?? now.getMonth() + 1;
        const range = periodRange(m, year);
        const y = range.gte.getFullYear();

        const [budgets, actuals] = await Promise.all([
          prisma.budget.findMany({ where: { userId, month: m, year: y } }),
          prisma.transaction.groupBy({
            by: ["category"],
            where: { userId, type: "DEBIT", occurredAt: { gte: range.gte, lte: range.lte } },
            _sum: { amount: true },
          }),
        ]);
        const spentBy = new Map(actuals.map((a) => [a.category, Number(a._sum.amount ?? 0)]));

        return {
          period: range.label,
          hasBudgets: budgets.length > 0,
          budgets: budgets.map((b) => {
            const limit = Number(b.amount);
            const spent = spentBy.get(b.category) ?? 0;
            return {
              category: b.category,
              limit,
              spent,
              remaining: limit - spent,
              usedPercent: pct(spent, limit),
              overBudget: spent > limit,
            };
          }),
        };
      },
    }),

    searchTransactions: tool({
      description:
        "Find individual transactions by merchant/description text, category or type. Use for questions about a specific vendor (e.g. Swiggy, Netflix).",
      inputSchema: z.object({
        query: z.string().trim().max(80).optional().describe("Text to match in merchant or description"),
        category: z.enum(TRANSACTION_CATEGORIES).optional(),
        type: typeSchema,
        ...periodSchema,
        limit: z.number().int().min(1).max(20).optional(),
      }),
      execute: async ({ query, category, type, month, year, limit }) => {
        const where: Prisma.TransactionWhereInput = { userId };
        if (type) where.type = type;
        if (category) where.category = category;
        if (month || year) {
          const range = periodRange(month, year);
          where.occurredAt = { gte: range.gte, lte: range.lte };
        }
        if (query) {
          where.OR = [
            { merchant: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ];
        }

        const [rows, agg] = await Promise.all([
          prisma.transaction.findMany({
            where,
            orderBy: { occurredAt: "desc" },
            take: limit ?? 10,
            select: { merchant: true, description: true, category: true, amount: true, type: true, occurredAt: true },
          }),
          prisma.transaction.aggregate({ where, _sum: { amount: true }, _count: { id: true } }),
        ]);

        return {
          matchedCount: agg._count.id,
          matchedTotal: Number(agg._sum.amount ?? 0),
          shown: rows.map((r) => ({
            merchant: r.merchant ?? r.description ?? r.category,
            category: r.category,
            type: r.type,
            amount: Number(r.amount),
            date: r.occurredAt.toISOString().slice(0, 10),
          })),
        };
      },
    }),

    getAccountsAndGoals: tool({
      description: "All accounts with balances, net worth, and savings goals with progress.",
      inputSchema: z.object({}),
      execute: async () => {
        const [accounts, goals] = await Promise.all([
          prisma.account.findMany({ where: { userId } }),
          prisma.financialGoal.findMany({ where: { userId } }),
        ]);

        // Credit card balances are amounts owed
        const netWorth = accounts.reduce(
          (acc, a) => acc + (a.type === "CREDIT_CARD" ? -1 : 1) * Number(a.balance),
          0,
        );

        return {
          netWorth,
          accounts: accounts.map((a) => ({ name: a.name, type: a.type, balance: Number(a.balance) })),
          goals: goals.map((g) => ({
            name: g.name,
            saved: Number(g.currentAmount),
            target: Number(g.targetAmount),
            progressPercent: pct(Number(g.currentAmount), Number(g.targetAmount)),
            targetDate: g.targetDate?.toISOString().slice(0, 10) ?? null,
          })),
        };
      },
    }),
  };
}

export type FinanceTools = ReturnType<typeof createFinanceTools>;
