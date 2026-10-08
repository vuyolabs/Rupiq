"use server";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { GoalSchema } from "@/schemas/goals";

export async function getGoals() {
    const session = await verifySession();
    return prisma.financialGoal.findMany({
        where: { userId: Number(session.userId) },
        orderBy: { targetDate: "asc" },
    });
}

export async function getGoal(goalId: number) {
    const session = await verifySession();
    return prisma.financialGoal.findFirst({
        where: { id: goalId, userId: Number(session.userId) },
    });
}

export async function createGoal(formData: FormData) {
    const session = await verifySession();
    const userId = Number(session.userId);

    const rawTargetDate = formData.get("targetDate");

    const validatedFields = GoalSchema.safeParse({
        name: formData.get("name"),
        targetAmount: formData.get("targetAmount"),
        currentAmount: formData.get("currentAmount") || 0,
        targetDate: rawTargetDate ? rawTargetDate : null,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const data = validatedFields.data;

    if (data.currentAmount > data.targetAmount) {
        return {
            errors: {
                currentAmount: ["Current amount cannot exceed target amount."],
            },
        };
    }

    const goal = await prisma.financialGoal.create({
        data: {
            name: data.name,
            targetAmount: new Prisma.Decimal(data.targetAmount),
            currentAmount: new Prisma.Decimal(data.currentAmount),
            targetDate: data.targetDate,
            userId,
        },
    });

    return {
        success: true,
        goal: {
            ...goal,
            targetAmount: Number(goal.targetAmount),
            currentAmount: Number(goal.currentAmount),
            targetDate: goal.targetDate ? goal.targetDate.toISOString() : null,
            createdAt: goal.createdAt.toISOString(),
            updatedAt: goal.updatedAt.toISOString(),
        },
    };
}

export async function updateGoal(
    goalId: number,
    formData: FormData,
) {
    const session = await verifySession();
    const userId = Number(session.userId);

    const rawTargetDate = formData.get("targetDate");

    const validatedFields = GoalSchema.safeParse({
        name: formData.get("name"),
        targetAmount: formData.get("targetAmount"),
        currentAmount: formData.get("currentAmount") || 0,
        targetDate: rawTargetDate ? rawTargetDate : null,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const existingGoal = await prisma.financialGoal.findFirst({
        where: { id: goalId, userId },
    });

    if (!existingGoal) {
        return {
            errors: {
                form: ["Goal not found"],
            },
        };
    }

    const data = validatedFields.data;

    if (data.currentAmount > data.targetAmount) {
        return {
            errors: {
                currentAmount: ["Current amount cannot exceed target amount."],
            },
        };
    }

    const goal = await prisma.financialGoal.update({
        where: { id: goalId },
        data: {
            name: data.name,
            targetAmount: new Prisma.Decimal(data.targetAmount),
            currentAmount: new Prisma.Decimal(data.currentAmount),
            targetDate: data.targetDate,
        },
    });

    return {
        success: true,
        goal: {
            ...goal,
            targetAmount: Number(goal.targetAmount),
            currentAmount: Number(goal.currentAmount),
            targetDate: goal.targetDate ? goal.targetDate.toISOString() : null,
            createdAt: goal.createdAt.toISOString(),
            updatedAt: goal.updatedAt.toISOString(),
        },
    };
}

export async function deleteGoal(goalId: number) {
    const session = await verifySession();
    const userId = Number(session.userId);

    const goal = await prisma.financialGoal.findFirst({
        where: { id: goalId, userId },
        select: { id: true },
    });

    if (!goal) {
        return {
            success: false,
            error: "Goal not found",
        };
    }

    await prisma.financialGoal.delete({
        where: { id: goalId },
    });

    return {
        success: true,
    };
}