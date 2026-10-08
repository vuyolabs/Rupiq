"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { requestPasswordReset } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter,
} from "@/components/ui/card";

export default function ForgotPassword() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);

  if (state?.success) {
    return (
      <>
        <CardHeader>
          <CardTitle>Check your inbox</CardTitle>
          <CardDescription>
            If an account with that email exists, we sent a password reset link.
          </CardDescription>
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
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          Enter your email and we will send you a link to reset it.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={action} className="flex flex-col gap-4">
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
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" disabled={pending} className="mt-2 w-full">
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </>
  );
}