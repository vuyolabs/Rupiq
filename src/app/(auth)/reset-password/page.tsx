"use client";

import { useActionState, Suspense, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { resetPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter,
} from "@/components/ui/card";

function ResetPasswordInner() {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  if (state?.success) {
    return (
      <>
        <CardHeader>
          <CardTitle>Password updated</CardTitle>
          <CardDescription>
            Your password has been reset and you are signed in.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/dashboard" className="w-full">
            <Button className="w-full">Go to dashboard</Button>
          </Link>
        </CardFooter>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Set a new password</CardTitle>
        <CardDescription>
          Choose a strong password for your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={8}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {mismatch && (
              <p className="text-sm text-destructive">Passwords do not match.</p>
            )}
          </div>

          {state?.error && !mismatch && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button
            type="submit"
            disabled={pending || mismatch}
            className="mt-2 w-full"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </>
  );
}

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  );
}