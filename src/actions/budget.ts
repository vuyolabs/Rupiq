"use server";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { BudgetSchema } from "@/schemas/budget";

export async function getBudgets(
    month?: number,
    year?: number,
) {
    const session = await verifySession();
    const userId = Number(session.userId);

    return prisma.budget.findMany({
        where: {
            userId,
            ...(month !== undefined && { month }),
            ...(year !== undefined && { year }),
        },
        orderBy: [
            { year: "desc" },
            { month: "desc" },
            { category: "asc" },
        ],
    });
}

export async function getBudget(budgetId: number) {
    const session = await verifySession();
    return prisma.budget.findFirst({
        where: { id: budgetId, userId: Number(session.userId) },
    });
}

export async function createBudget(formData: FormData) {
    const session = await verifySession();
    const userId = Number(session.userId);

    const validatedFields = BudgetSchema.safeParse({
        name: formData.get("name"),
        category: formData.get("category"),
        amount: formData.get("amount"),
        month: formData.get("month"),
        year: formData.get("year"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const data = validatedFields.data;

    const existingBudget = await prisma.budget.findUnique({
        where: {
            userId_category_month_year: {
                userId,
                category: data.category,
                month: data.month,
                year: data.year,
            },
        },
    });

    if (existingBudget) {
        return {
            errors: {
                category: ["A budget already exists for this category and month."],
            },
        };
    }

    const budget = await prisma.budget.create({
        data: {
            name: data.name || null,
            category: data.category,
            amount: new Prisma.Decimal(data.amount),
            month: data.month,
            year: data.year,
            userId,
        },
    });

    return {
        success: true,
        budget: {
            ...budget,
            amount: Number(budget.amount),
            createdAt: budget.createdAt.toISOString(),
            updatedAt: budget.updatedAt.toISOString(),
        },
    };
}

export async function updateBudget(
    budgetId: number,
    formData: FormData,
) {
    const session = await verifySession();
    const userId = Number(session.userId);

    const validatedFields = BudgetSchema.safeParse({
        name: formData.get("name"),
        category: formData.get("category"),
        amount: formData.get("amount"),
        month: formData.get("month"),
        year: formData.get("year"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const existingBudget = await prisma.budget.findFirst({
        where: { id: budgetId, userId },
    });

    if (!existingBudget) {
        return {
            errors: {
                form: ["Budget not found"],
            },
        };
    }

    const data = validatedFields.data;

    const duplicateBudget = await prisma.budget.findFirst({
        where: {
            userId,
            category: data.category,
            month: data.month,
            year: data.year,
            NOT: { id: budgetId },
        },
    });

    if (duplicateBudget) {
        return {
            errors: {
                category: ["A budget already exists for this category and month."],
            },
        };
    }

    const budget = await prisma.budget.update({
        where: { id: budgetId },
        data: {
            name: data.name || null,
            category: data.category,
            amount: new Prisma.Decimal(data.amount),
            month: data.month,
            year: data.year,
        },
    });

    return {
        success: true,
        budget: {
            ...budget,
            amount: Number(budget.amount),
            createdAt: budget.createdAt.toISOString(),
            updatedAt: budget.updatedAt.toISOString(),
        },
    };
}

export async function deleteBudget(budgetId: number) {
    const session = await verifySession();
    const userId = Number(session.userId);

    const budget = await prisma.budget.findFirst({
        where: { id: budgetId, userId },
        select: { id: true },
    });

    if (!budget) {
        return {
            success: false,
            error: "Budget not found",
        };
    }

    await prisma.budget.delete({
        where: { id: budgetId },
    });

    return {
        success: true,
    };
}