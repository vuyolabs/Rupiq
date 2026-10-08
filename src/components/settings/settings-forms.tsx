"use client";

import { useActionState, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Loader2, Moon, Sun, Monitor, User, Palette, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateProfile } from "@/actions/settings";

interface ProfileFormProps {
  initialUser: {
    name: string | null;
    email: string;
  };
}

export function ProfileSettingsForm({ initialUser }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfile, undefined);

  useEffect(() => {
    if (state?.success) {
      toast.success("Profile updated successfully");
    }
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Profile Details</CardTitle>
        </div>
        <CardDescription>
          Manage your personal account name and view your registered email.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        <form action={action} className="flex flex-col gap-4 max-w-md">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initialUser.name ?? ""}
              placeholder="Your full name"
              required
            />
            {state?.errors?.name && (
              <p className="text-xs text-destructive">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="email">Email Address</Label>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" /> Read-only
              </span>
            </div>
            <Input
              id="email"
              type="email"
              value={initialUser.email}
              disabled
              readOnly
              className="bg-muted/50 text-muted-foreground cursor-not-allowed select-none"
            />
            <p className="text-[11px] text-muted-foreground">
              Your registered email address cannot be modified once created.
            </p>
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="w-fit cursor-pointer"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>Customize your theme preference.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-10 w-48 rounded-xl bg-muted animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Appearance</CardTitle>
        </div>
        <CardDescription>
          Customize the interface look & feel across all your devices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 max-w-md">
          <Button
            type="button"
            variant={theme === "light" ? "default" : "outline"}
            className="flex flex-col gap-2 h-20 items-center justify-center rounded-2xl cursor-pointer"
            onClick={() => {
              setTheme("light");
              toast.success("Theme set to Light");
            }}
          >
            <Sun className="h-5 w-5" />
            <span className="text-xs">Light</span>
          </Button>

          <Button
            type="button"
            variant={theme === "dark" ? "default" : "outline"}
            className="flex flex-col gap-2 h-20 items-center justify-center rounded-2xl cursor-pointer"
            onClick={() => {
              setTheme("dark");
              toast.success("Theme set to Dark");
            }}
          >
            <Moon className="h-5 w-5" />
            <span className="text-xs">Dark</span>
          </Button>

          <Button
            type="button"
            variant={theme === "system" ? "default" : "outline"}
            className="flex flex-col gap-2 h-20 items-center justify-center rounded-2xl cursor-pointer"
            onClick={() => {
              setTheme("system");
              toast.success("Theme set to System");
            }}
          >
            <Monitor className="h-5 w-5" />
            <span className="text-xs">System</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
