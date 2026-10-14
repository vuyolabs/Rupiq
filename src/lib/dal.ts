import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { createClient } from "@/lib/supabase/server";

type AppUser = {
    id: number;
    name: string;
    email: string;
};

const userSelect = { id: true, name: true, email: true } as const;

/**
 * Resolves the signed-in Supabase user to the app's `User` row,
 * creating it (or linking a pre-existing row by email) on first sign-in.
 * Returns null when nobody is signed in.
 */
export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    const claims = data?.claims;

    if (error || !claims?.sub || !claims.email) {
        return null;
    }

    const authId = claims.sub;
    const existing = await prisma.user.findUnique({
        where: { authId },
        select: userSelect,
    });
    if (existing) return existing;

    const email = claims.email.toLowerCase();
    const meta = (claims.user_metadata ?? {}) as Record<string, unknown>;
    const name =
        (typeof meta.full_name === "string" && meta.full_name) ||
        (typeof meta.name === "string" && meta.name) ||
        email.split("@")[0];

    // Supabase only issues a session for a verified email,
    // so linking an existing row with the same email is safe.
    return prisma.user.upsert({
        where: { email },
        update: { authId },
        create: { authId, email, name },
        select: userSelect,
    });
});

export const verifySession = cache(async () => {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return {
        isAuth: true,
        userId: String(user.id),
    };
});

// Errors propagate (instead of returning null) so a DB outage shows an error
// page rather than bouncing between /login and /dashboard.
export const getUser = getCurrentUser;
