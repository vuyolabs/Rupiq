import z from "zod";

export const GoalSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Goal name is required")
        .max(100, "Goal name is too long"),

    targetAmount: z.coerce
        .number()
        .positive("Target amount must be greater than 0"),

    currentAmount: z.coerce
        .number()
        .min(0, "Current amount cannot be negative"),

    targetDate: z
        .coerce
        .date()
        .optional()
        .nullable(),
});