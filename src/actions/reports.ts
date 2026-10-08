"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

export async function getFinancialReport({
    month,
    year,
}: {
    month: number;
    year: number;
}) {
    const session = await verifySession();
    const userId = Number(session.userId);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const [
        transactions,
        accounts,
        budgets,
        goals,
    ] = await Promise.all([
        prisma.transaction.findMany({
            where: {
                userId,
                occurredAt: {
                    gte: startDate,
                    lt: endDate,
                },
            },
            orderBy: {
                occurredAt: "desc",
            },
        }),
        prisma.account.findMany({
            where: { userId },
            orderBy: { balance: "desc" },
        }),
        prisma.budget.findMany({
            where: { userId, month, year },
        }),
        prisma.financialGoal.findMany({
            where: { userId },
            orderBy: { targetDate: "asc" },
        }),
    ]);

    let income = 0;
    let expenses = 0;
    const categoryTotals: Record<string, number> = {};

    for (const transaction of transactions) {
        const amount = Number(transaction.amount);
        if (transaction.type === "CREDIT") {
            income += amount;
        } else {
            expenses += amount;
            categoryTotals[transaction.category] =
                (categoryTotals[transaction.category] ?? 0) + amount;
        }
    }

    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    const categorySpending = Object.entries(categoryTotals)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);

    const budgetReport = budgets.map((budget) => {
        const spent = categoryTotals[budget.category] ?? 0;
        const budgetAmount = Number(budget.amount);
        const remaining = budgetAmount - spent;
        const utilization = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

        return {
            id: budget.id,
            name: budget.name,
            category: budget.category,
            budget: budgetAmount,
            spent,
            remaining,
            utilization,
        };
    });

    const accountReport = accounts.map((account) => ({
        id: account.id,
        name: account.name,
        type: account.type,
        balance: Number(account.balance),
    }));

    const goalReport = goals.map((goal) => {
        const target = Number(goal.targetAmount);
        const current = Number(goal.currentAmount);
        const progress = target > 0 ? (current / target) * 100 : 0;

        return {
            id: goal.id,
            name: goal.name,
            targetAmount: target,
            currentAmount: current,
            remainingAmount: Math.max(target - current, 0),
            progress,
            targetDate: goal.targetDate,
        };
    });

    const serializedTransactions = transactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
        occurredAt: t.occurredAt.toISOString(),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
    }));

    return {
        period: { month, year },
        summary: { income, expenses, savings, savingsRate },
        categorySpending,
        budgets: budgetReport,
        accounts: accountReport,
        goals: goalReport,
        transactions: serializedTransactions,
    };
}