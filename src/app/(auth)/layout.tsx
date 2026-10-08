import { AppLogo } from "@/components/shared/app-logo";
import { Card } from "@/components/ui/card";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 py-8"
      style={{
        backgroundImage:
          "radial-gradient(color-mix(in oklch, var(--foreground) 15%, transparent) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        {/* 2-Column Brand Header */}
        <AppLogo size="lg" />

        {/* Auth Card */}
        <Card className="w-full shadow-2xl border-border/80 rounded-2xl">{children}</Card>
      </div>
    </main>
  );
}