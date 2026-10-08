import { z } from "zod";
import { TRANSACTION_CATEGORIES } from "@/types/finance";

export const TransactionCategorySchema = z.enum(TRANSACTION_CATEGORIES);

export const TransactionTypeSchema = z.enum([
    "CREDIT",
    "DEBIT",
]);

export const CreateTransactionSchema = z.object({
    amount: z.coerce
        .number({ message: "Please enter a valid amount" })
        .positive("Amount must be greater than 0"),

    type: TransactionTypeSchema,

    category: TransactionCategorySchema,

    merchant: z
        .string()
        .trim()
        .max(100, "Merchant name is too long")
        .nullish()
        .transform((v) => v || null),

    description: z
        .string()
        .trim()
        .max(500, "Description is too long")
        .nullish()
        .transform((v) => v || null),

    emoji: z
        .string()
        .trim()
        .max(10, "Emoji is too long")
        .nullish()
        .transform((v) => v || null),

    occurredAt: z.preprocess((val) => {
        if (!val) return new Date();
        if (typeof val === "string") {
            if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                return new Date(`${val}T12:00:00`);
            }
            const d = new Date(val);
            return isNaN(d.getTime()) ? undefined : d;
        }
        if (val instanceof Date) {
            return val;
        }
        return val;
    }, z.date({ message: "Please enter a valid date" })),

    accountId: z.coerce
        .number({ message: "Please select an account" })
        .int()
        .positive("Please select a valid account"),
});

export type CreateTransactionInput = z.infer<
    typeof CreateTransactionSchema
>;

export const UpdateTransactionSchema = CreateTransactionSchema;