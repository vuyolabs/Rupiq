"use server";

import { SignupFormSchema, FormState, LoginFormSchema } from "@/lib/definitions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";

async function getAppUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email, password } = validatedFields.data;
  const supabase = await createClient();
  const appUrl = await getAppUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${appUrl}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return { errors: { email: [error.message] } };
  }

  // Supabase returns a user with no identities when the email is already registered
  if (data.user && data.user.identities?.length === 0) {
    return { errors: { email: ["An account with this email already exists"] } };
  }

  // Email confirmation enabled: no session until the link is clicked
  if (!data.session) {
    return { message: `We sent a confirmation link to ${email}. Click it to activate your account.` };
  }

  redirect("/dashboard");
}

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(validatedFields.data);

  if (error) {
    const message =
      error.code === "email_not_confirmed"
        ? "Please confirm your email first — check your inbox for the link."
        : "Invalid email or password";
    return { errors: { email: [message] } };
  }

  redirect("/dashboard");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const appUrl = await getAppUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/auth/callback?next=/dashboard`,
    },
  });

  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Google sign in is unavailable")}`);
  }

  redirect(data.url);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ─── Password Reset ────────────────────────────────────────────────────────────

const ForgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
});

export async function requestPasswordReset(
  _state: { success?: boolean; error?: string } | undefined,
  formData: FormData,
): Promise<{ success?: boolean; error?: string }> {
  const parsed = ForgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid email" };
  }

  const supabase = await createClient();
  const appUrl = await getAppUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
  });

  // Rate-limit errors are worth surfacing; anything else stays silent (no user enumeration)
  if (error?.status === 429) {
    return { error: "Too many requests. Please wait a minute and try again." };
  }

  return { success: true };
}

const ResetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Must contain at least one letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
});

export async function resetPassword(
  _state: { success?: boolean; error?: string } | undefined,
  formData: FormData,
): Promise<{ success?: boolean; error?: string }> {
  const parsed = ResetPasswordSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  // The recovery link signs the user in via /auth/callback before landing here
  if (!data?.claims?.sub) {
    return { error: "This link is invalid or has expired. Please request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
