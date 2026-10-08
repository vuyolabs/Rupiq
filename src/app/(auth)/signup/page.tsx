"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState, Suspense } from "react";

import { signup, signInWithGoogle } from "@/actions/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function SignupFormContent() {
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const [state, action, pending] = useActionState(signup, undefined);
  const [showPassword, setShowPassword] = useState(false);

  if (state?.message) {
    return (
      <>
        <CardHeader>
          <CardTitle>Check your inbox</CardTitle>
          <CardDescription>{state.message}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link
            href="/login"
            className="text-sm font-medium text-foreground hover:underline"
          >
            Back to sign in
          </Link>
        </CardFooter>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Start tracking your finances in a few seconds
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {oauthError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
            {oauthError}
          </div>
        )}

        {/* Google OAuth Button */}
        <form action={signInWithGoogle}>
          <Button
            variant="outline"
            type="submit"
            className="w-full flex items-center justify-center gap-2 h-10 cursor-pointer"
          >
            <GoogleIcon />
            <span>Sign up with Google</span>
          </Button>
        </form>

        <div className="relative flex items-center justify-center">
          <Separator className="w-full" />
          <span className="absolute bg-card px-2 text-xs text-muted-foreground uppercase">
            Or continue with email
          </span>
        </div>

        <form action={action} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Jane Doe"
              autoComplete="name"
              required
            />
            {state?.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            {state?.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {state?.errors?.password && (
              <div className="text-sm text-destructive">
                <p>Password must:</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  {state.errors.password.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Submit */}
          <Button disabled={pending} type="submit" className="mt-2 w-full cursor-pointer">
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>}>
      <SignupFormContent />
    </Suspense>
  );
}