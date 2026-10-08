import z from "zod";
import { TRANSACTION_CATEGORIES } from "@/types/finance";

const TransactionCategorySchema = z.enum(TRANSACTION_CATEGORIES, {
    message: "Please select a valid category",
});

export const BudgetSchema = z.object({
    name: z
        .string()
        .trim()
        .max(100, "Name is too long")
        .optional()
        .or(z.literal("")),

    category: TransactionCategorySchema,

    amount: z.coerce
        .number()
        .positive("Budget must be greater than 0"),

    month: z.coerce
        .number()
        .int()
        .min(1)
        .max(12),

    year: z.coerce
        .number()
        .int()
        .min(2000)
        .max(2100),
});
