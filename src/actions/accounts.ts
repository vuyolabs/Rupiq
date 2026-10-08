"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";

const AccountTypeSchema = z.enum([
    "BANK",
    "CASH",
    "CREDIT_CARD",
    "WALLET",
    "OTHER",
]);

const CreateAccountSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Account name is required")
        .max(100, "Account name is too long"),
    type: AccountTypeSchema,
    balance: z.coerce.number().finite("Invalid balance"),
    accountNumber: z
        .string()
        .trim()
        .optional()
        .nullable()
        .refine(
            (val) => !val || /^[0-9]{9,18}$|^[•\*\s\d\-]{4,20}$/.test(val),
            "Account number must be 9 to 18 digits (or last 4 digits for cards)"
        ),
    ifsc: z
        .string()
        .trim()
        .optional()
        .nullable()
        .refine(
            (val) => !val || /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(val),
            "Invalid IFSC format (e.g. HDFC0000123: 4 letters, '0', 6 alphanumeric characters)"
        ),
    branch: z
        .string()
        .trim()
        .max(100, "Branch name cannot exceed 100 characters")
        .optional()
        .nullable(),
});

const UpdateAccountSchema = CreateAccountSchema;

export async function getAccounts() {
    const session = await verifySession();
    const accounts = await prisma.account.findMany({
        where: { userId: Number(session.userId) },
        orderBy: { createdAt: "desc" },
    });

    return accounts.map((a) => ({
        ...a,
        balance: Number(a.balance),
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
    }));
}

export async function getAccount(accountId: number) {
    const session = await verifySession();
    const a = await prisma.account.findFirst({
        where: { id: accountId, userId: Number(session.userId) },
    });
    if (!a) return null;

    return {
        ...a,
        balance: Number(a.balance),
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
    };
}

export async function createAccount(formData: FormData) {
    const session = await verifySession();
    const userId = Number(session.userId);

    const validatedFields = CreateAccountSchema.safeParse({
        name: formData.get("name"),
        type: formData.get("type"),
        balance: formData.get("balance"),
        accountNumber: formData.get("accountNumber") || null,
        ifsc: formData.get("ifsc") || null,
        branch: formData.get("branch") || null,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const data = validatedFields.data;

    const account = await prisma.account.create({
        data: {
            name: data.name,
            type: data.type,
            balance: new Prisma.Decimal(data.balance),
            accountNumber: data.accountNumber ? data.accountNumber.trim() : null,
            ifsc: data.ifsc ? data.ifsc.trim().toUpperCase() : null,
            branch: data.branch ? data.branch.trim() : null,
            userId,
        },
    });

    return {
        success: true,
        account: {
            ...account,
            balance: Number(account.balance),
            createdAt: account.createdAt.toISOString(),
            updatedAt: account.updatedAt.toISOString(),
        },
    };
}

export async function updateAccount(
    accountId: number,
    formData: FormData,
) {
    const session = await verifySession();
    const userId = Number(session.userId);

    const validatedFields = UpdateAccountSchema.safeParse({
        name: formData.get("name"),
        type: formData.get("type"),
        balance: formData.get("balance"),
        accountNumber: formData.get("accountNumber") || null,
        ifsc: formData.get("ifsc") || null,
        branch: formData.get("branch") || null,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const existingAccount = await prisma.account.findFirst({
        where: { id: accountId, userId },
    });

    if (!existingAccount) {
        return {
            errors: {
                form: ["Account not found"],
            },
        };
    }

    const data = validatedFields.data;

    const account = await prisma.account.update({
        where: { id: accountId },
        data: {
            name: data.name,
            type: data.type,
            balance: new Prisma.Decimal(data.balance),
            accountNumber: data.accountNumber ? data.accountNumber.trim() : null,
            ifsc: data.ifsc ? data.ifsc.trim().toUpperCase() : null,
            branch: data.branch ? data.branch.trim() : null,
        },
    });

    return {
        success: true,
        account: {
            ...account,
            balance: Number(account.balance),
            createdAt: account.createdAt.toISOString(),
            updatedAt: account.updatedAt.toISOString(),
        },
    };
}

export async function deleteAccount(accountId: number) {
    const session = await verifySession();
    const userId = Number(session.userId);

    const account = await prisma.account.findFirst({
        where: { id: accountId, userId },
        select: { id: true },
    });

    if (!account) {
        return {
            success: false,
            error: "Account not found",
        };
    }

    const transactionCount = await prisma.transaction.count({
        where: { accountId, userId },
    });

    if (transactionCount > 0) {
        return {
            success: false,
            error: "Cannot delete an account that has transactions.",
        };
    }

    await prisma.account.delete({
        where: { id: accountId },
    });

    return {
        success: true,
    };
}