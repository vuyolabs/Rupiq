"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import {
    AccountType,
    TransactionCategory,
    TransactionType,
    TRANSACTION_CATEGORIES,
    isCategoryValidForType,
} from "@/types/finance";

const TransactionCategorySchema = z.enum(TRANSACTION_CATEGORIES, {
    message: "Please select a valid category",
});

const TransactionTypeSchema = z.enum(["CREDIT", "DEBIT"], {
    message: "Please choose Credit (income) or Debit (expense)",
});

const CreateTransactionSchema = z.object({
    amount: z.coerce
        .number({ message: "Please enter a valid amount" })
        .positive("Amount must be greater than 0"),
    type: TransactionTypeSchema,
    category: TransactionCategorySchema,
    merchant: z.string().trim().max(100).optional().nullable(),
    description: z.string().trim().max(255).optional().nullable(),
    emoji: z.string().max(10).optional().nullable(),
    occurredAt: z.string().min(1, "Date is required").transform((val) => {
        const parts = val.split("T")[0].split("-");
        if (parts.length === 3) {
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const d = parseInt(parts[2], 10);
            return new Date(Date.UTC(y, m, d, 12, 0, 0));
        }
        return new Date(val);
    }),
    accountId: z.coerce
        .number({ message: "Please select an account" })
        .int()
        .positive("Please select an account"),
});

const UpdateTransactionSchema = CreateTransactionSchema;

function categoryTypeMismatch(type: TransactionType) {
    return type === "CREDIT"
        ? "This is an expense category. Pick an income category for a credit."
        : "This is an income category. Pick an expense category for a debit.";
}

export async function getFullDashboardData() {
    const session = await verifySession();
    const userId = Number(session.userId);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    // 1. Boundaries
    const startOfCurrentYear = new Date(currentYear, 0, 1);
    const startOfCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfCurrentMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // Current Week bounds (Monday to Sunday)
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = (dayOfWeek + 6) % 7;
    const startOfCurrentWeek = new Date(now);
    startOfCurrentWeek.setDate(now.getDate() - diffToMonday);
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    const [
        totalTxCount,
        recentTxRows,
        yearTransactions,
        currentMonthCategorySpending,
        rawAccounts,
        rawBudgets,
        rawGoals,
    ] = await Promise.all([
        // 1. Total transaction count
        prisma.transaction.count({ where: { userId } }),

        // 2. Initial page of 15 transactions
        prisma.transaction.findMany({
            where: { userId },
            orderBy: { occurredAt: "desc" },
            take: 15,
        }),

        // 3. Current year transactions for all chart timeframes
        prisma.transaction.findMany({
            where: {
                userId,
                occurredAt: { gte: startOfCurrentYear },
            },
            select: {
                amount: true,
                type: true,
                occurredAt: true,
            },
        }),

        // 4. Current month category spending
        prisma.transaction.groupBy({
            by: ["category"],
            where: {
                userId,
                type: "DEBIT",
                occurredAt: {
                    gte: startOfCurrentMonth,
                    lte: endOfCurrentMonth,
                },
            },
            _sum: {
                amount: true,
            },
            orderBy: {
                _sum: {
                    amount: "desc",
                },
            },
        }),

        // 5. User accounts
        prisma.account.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        }),

        // 6. User active monthly budgets
        prisma.budget.findMany({
            where: { userId, month: currentMonth, year: currentYear },
        }),

        // 7. User financial goals
        prisma.financialGoal.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        }),
    ]);

    // ==========================================
    // 1. WEEKLY DATA: 7 Days of the CURRENT WEEK
    // ==========================================
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyData = weekDays.map((name, i) => {
        const d = new Date(startOfCurrentWeek);
        d.setDate(startOfCurrentWeek.getDate() + i);
        const dayLabel = `${name} ${d.getDate()}`;
        return {
            month: dayLabel,
            dateKey: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
            income: 0,
            expenses: 0,
        };
    });

    // ==========================================
    // 2. MONTHLY DATA: 4-5 Weeks of CURRENT MONTH
    // ==========================================
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const monthlyData: { month: string; startDay: number; endDay: number; income: number; expenses: number }[] = [
        { month: "1 - 7", startDay: 1, endDay: 7, income: 0, expenses: 0 },
        { month: "8 - 14", startDay: 8, endDay: 14, income: 0, expenses: 0 },
        { month: "15 - 21", startDay: 15, endDay: 21, income: 0, expenses: 0 },
        { month: `22 - ${daysInMonth}`, startDay: 22, endDay: daysInMonth, income: 0, expenses: 0 },
    ];

    // ==========================================
    // 3. YEARLY DATA: 12 Months of CURRENT YEAR
    // ==========================================
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const yearlyData = monthNames.map((mName, idx) => ({
        month: mName,
        monthIndex: idx,
        income: 0,
        expenses: 0,
    }));

    // Aggregate transactions into the datasets
    for (const tx of yearTransactions) {
        const d = new Date(tx.occurredAt);
        const amt = Number(tx.amount);
        const isCredit = tx.type === "CREDIT";

        // Aggregate to Weekly (Current Week)
        const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const weekDaySlot = weeklyData.find((w) => w.dateKey === dateKey);
        if (weekDaySlot) {
            if (isCredit) weekDaySlot.income += amt;
            else weekDaySlot.expenses += amt;
        }

        // Aggregate to Monthly (Current Month)
        if (d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth) {
            const dayNum = d.getDate();
            const slot = monthlyData.find((m) => dayNum >= m.startDay && dayNum <= m.endDay);
            if (slot) {
                if (isCredit) slot.income += amt;
                else slot.expenses += amt;
            }
        }

        // Aggregate to Yearly (Current Year)
        if (d.getFullYear() === currentYear) {
            const mIdx = d.getMonth();
            if (yearlyData[mIdx]) {
                if (isCredit) yearlyData[mIdx].income += amt;
                else yearlyData[mIdx].expenses += amt;
            }
        }
    }

    const categoryData = currentMonthCategorySpending
        .map((c) => ({
            category: c.category as TransactionCategory,
            amount: Number(c._sum?.amount ?? 0),
        }))
        .sort((a, b) => b.amount - a.amount);

    const categorySpendingRecord: Record<string, number> = {};
    for (const c of currentMonthCategorySpending) {
        categorySpendingRecord[c.category] = Number(c._sum?.amount ?? 0);
    }

    const transactions = recentTxRows.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        type: t.type as TransactionType,
        category: t.category as TransactionCategory,
        merchant: t.merchant,
        description: t.description,
        emoji: t.emoji,
        occurredAt: t.occurredAt.toISOString(),
        accountId: t.accountId,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
    }));

    const accounts = rawAccounts.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type as AccountType,
        balance: Number(a.balance),
        accountNumber: a.accountNumber,
        ifsc: a.ifsc,
        branch: a.branch,
    }));

    const budgets = rawBudgets.map((b) => ({
        id: b.id,
        name: b.name,
        category: b.category as TransactionCategory,
        amount: Number(b.amount),
        month: b.month,
        year: b.year,
    }));

    const goals = rawGoals.map((g) => ({
        id: g.id,
        name: g.name,
        targetAmount: Number(g.targetAmount),
        currentAmount: Number(g.currentAmount),
        targetDate: g.targetDate ? g.targetDate.toISOString() : null,
    }));

    return {
        initialPaginatedTx: {
            data: transactions,
            meta: {
                total: totalTxCount,
                page: 1,
                pageSize: 15,
                pageCount: Math.ceil(totalTxCount / 15),
            },
        },
        analytics: {
            overviewData: monthlyData.map((m) => ({ month: m.month, income: m.income, expenses: m.expenses })),
            weeklyData: weeklyData.map((w) => ({ month: w.month, income: w.income, expenses: w.expenses })),
            yearlyData: yearlyData.map((y) => ({ month: y.month, income: y.income, expenses: y.expenses })),
            categoryData,
            categorySpending: categorySpendingRecord,
        },
        accounts,
        budgets,
        goals,
    };
}

export async function getTransactions() {
    const session = await verifySession();
    const transactions = await prisma.transaction.findMany({
        where: { userId: Number(session.userId) },
        orderBy: { occurredAt: "desc" },
    });

    return transactions.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        type: t.type as TransactionType,
        category: t.category as TransactionCategory,
        merchant: t.merchant,
        description: t.description,
        emoji: t.emoji,
        occurredAt: t.occurredAt.toISOString(),
        accountId: t.accountId,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
    }));
}

export async function getPaginatedTransactions({
    page = 1,
    pageSize = 15,
    search,
    category,
    type,
    sortBy = "occurredAt",
    sortOrder = "desc",
}: {
    page?: number;
    pageSize?: number;
    search?: string;
    category?: string;
    type?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}) {
    const session = await verifySession();
    const userId = Number(session.userId);

    const where: Prisma.TransactionWhereInput = { userId };

    if (search && search.trim() !== "") {
        where.OR = [
            { merchant: { contains: search.trim(), mode: "insensitive" } },
            { description: { contains: search.trim(), mode: "insensitive" } },
        ];
    }

    if (category && category !== "ALL") {
        where.category = category as TransactionCategory;
    }

    if (type && type !== "ALL") {
        where.type = type as TransactionType;
    }

    const validSortFields = ["occurredAt", "amount", "merchant", "createdAt"];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : "occurredAt";

    const [total, transactions] = await Promise.all([
        prisma.transaction.count({ where }),
        prisma.transaction.findMany({
            where,
            orderBy: { [orderByField]: sortOrder },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
    ]);

    return {
        data: transactions.map((t) => ({
            id: t.id,
            amount: Number(t.amount),
            type: t.type as TransactionType,
            category: t.category as TransactionCategory,
            merchant: t.merchant,
            description: t.description,
            emoji: t.emoji,
            occurredAt: t.occurredAt.toISOString(),
            accountId: t.accountId,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
        })),
        meta: {
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize) || 1,
        },
    };
}

export async function createTransaction(formData: FormData) {
    const session = await verifySession();
    const userId = Number(session.userId);

    const validatedFields = CreateTransactionSchema.safeParse({
        amount: formData.get("amount"),
        type: formData.get("type"),
        category: formData.get("category"),
        merchant: formData.get("merchant") || null,
        description: formData.get("description") || null,
        emoji: formData.get("emoji") || null,
        occurredAt: formData.get("occurredAt"),
        accountId: formData.get("accountId"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const data = validatedFields.data;

    if (!isCategoryValidForType(data.category, data.type)) {
        return {
            errors: {
                category: [categoryTypeMismatch(data.type)],
            },
        };
    }

    const account = await prisma.account.findFirst({
        where: {
            id: data.accountId,
            userId,
        },
    });

    if (!account) {
        return {
            errors: {
                accountId: ["Account not found or does not belong to you"],
            },
        };
    }

    const txAmount = new Prisma.Decimal(data.amount);

    const [transaction] = await prisma.$transaction([
        prisma.transaction.create({
            data: {
                amount: txAmount,
                type: data.type,
                category: data.category,
                merchant: data.merchant,
                description: data.description,
                emoji: data.emoji,
                occurredAt: data.occurredAt,
                accountId: data.accountId,
                userId,
            },
        }),
        prisma.account.update({
            where: { id: data.accountId },
            data: {
                balance: data.type === "CREDIT"
                    ? { increment: txAmount }
                    : { decrement: txAmount },
            },
        }),
    ]);

    return {
        success: true,
        transaction: {
            ...transaction,
            amount: Number(transaction.amount),
            occurredAt: transaction.occurredAt.toISOString(),
            createdAt: transaction.createdAt.toISOString(),
            updatedAt: transaction.updatedAt.toISOString(),
        },
    };
}

export async function updateTransaction(
    transactionId: number,
    formData: FormData
) {
    const session = await verifySession();
    const userId = Number(session.userId);

    const validatedFields = UpdateTransactionSchema.safeParse({
        amount: formData.get("amount"),
        type: formData.get("type"),
        category: formData.get("category"),
        merchant: formData.get("merchant") || null,
        description: formData.get("description") || null,
        emoji: formData.get("emoji") || null,
        occurredAt: formData.get("occurredAt"),
        accountId: formData.get("accountId"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const data = validatedFields.data;

    const existingTransaction = await prisma.transaction.findFirst({
        where: {
            AND: [{ id: transactionId }, { userId }],
        },
    });

    if (!existingTransaction) {
        return {
            errors: {
                form: ["Transaction not found or does not belong to you"],
            },
        };
    }

    // Legacy rows may pair a category with the "wrong" type; only block changes that introduce a mismatch
    const pairUnchanged =
        existingTransaction.category === data.category && existingTransaction.type === data.type;
    if (!pairUnchanged && !isCategoryValidForType(data.category, data.type)) {
        return {
            errors: {
                category: [categoryTypeMismatch(data.type)],
            },
        };
    }

    const targetAccount = await prisma.account.findFirst({
        where: {
            id: data.accountId,
            userId,
        },
    });

    if (!targetAccount) {
        return {
            errors: {
                accountId: ["Account not found or does not belong to you"],
            },
        };
    }

    const oldAmount = existingTransaction.amount;
    const oldType = existingTransaction.type;
    const oldAccountId = existingTransaction.accountId;

    const newAmount = new Prisma.Decimal(data.amount);
    const newType = data.type;
    const newAccountId = data.accountId;

    const operations: Prisma.PrismaPromise<unknown>[] = [];

    operations.push(
        prisma.account.update({
            where: { id: oldAccountId },
            data: {
                balance: oldType === "CREDIT"
                    ? { decrement: oldAmount }
                    : { increment: oldAmount },
            },
        })
    );

    operations.push(
        prisma.account.update({
            where: { id: newAccountId },
            data: {
                balance: newType === "CREDIT"
                    ? { increment: newAmount }
                    : { decrement: newAmount },
            },
        })
    );

    operations.push(
        prisma.transaction.update({
            where: { id: transactionId },
            data: {
                amount: newAmount,
                type: newType,
                category: data.category,
                merchant: data.merchant,
                description: data.description,
                emoji: data.emoji,
                occurredAt: data.occurredAt,
                accountId: newAccountId,
            },
        })
    );

    const results = await prisma.$transaction(operations);
    const updatedTx = results[2] as typeof existingTransaction;

    return {
        success: true,
        transaction: {
            ...updatedTx,
            amount: Number(updatedTx.amount),
            occurredAt: updatedTx.occurredAt.toISOString(),
            createdAt: updatedTx.createdAt.toISOString(),
            updatedAt: updatedTx.updatedAt.toISOString(),
        },
    };
}

export async function deleteTransaction(transactionId: number) {
    const session = await verifySession();
    const userId = Number(session.userId);

    const transaction = await prisma.transaction.findFirst({
        where: {
            AND: [
                { id: transactionId },
                { userId },
            ],
        },
    });

    if (!transaction) {
        return {
            success: false,
            error: "Transaction not found",
        };
    }

    const txAmount = transaction.amount;
    const txType = transaction.type;
    const accountId = transaction.accountId;

    await prisma.$transaction([
        prisma.transaction.delete({
            where: { id: transaction.id },
        }),
        prisma.account.update({
            where: { id: accountId },
            data: {
                balance: txType === "CREDIT"
                    ? { decrement: txAmount }
                    : { increment: txAmount },
            },
        }),
    ]);

    return {
        success: true,
    };
}

export async function bulkDeleteTransactions(transactionIds: number[]) {
    const session = await verifySession();
    const userId = Number(session.userId);

    if (!transactionIds.length) {
        return { success: true, count: 0 };
    }

    const transactions = await prisma.transaction.findMany({
        where: {
            id: { in: transactionIds },
            userId,
        },
    });

    if (!transactions.length) {
        return { success: false, error: "No matching transactions found" };
    }

    const accountDeltas = new Map<number, Prisma.Decimal>();

    for (const tx of transactions) {
        const currentDelta = accountDeltas.get(tx.accountId) ?? new Prisma.Decimal(0);
        const diff = tx.type === "CREDIT"
            ? tx.amount.negated()
            : tx.amount;
        accountDeltas.set(tx.accountId, currentDelta.plus(diff));
    }

    const operations: Prisma.PrismaPromise<unknown>[] = [
        prisma.transaction.deleteMany({
            where: {
                id: { in: transactions.map((t) => t.id) },
                userId,
            },
        }),
    ];

    for (const [accId, delta] of accountDeltas.entries()) {
        operations.push(
            prisma.account.update({
                where: { id: accId },
                data: {
                    balance: { increment: delta },
                },
            })
        );
    }

    await prisma.$transaction(operations);

    return {
        success: true,
        count: transactions.length,
    };
}