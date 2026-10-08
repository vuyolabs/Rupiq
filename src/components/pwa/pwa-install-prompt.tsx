"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem("rupiq-pwa-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  if (!isVisible || isDismissed || !deferredPrompt) {
    return null;
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem("rupiq-pwa-dismissed", "true");
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-2xl border border-primary/20 bg-background/95 p-3.5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300 max-w-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Download className="h-5 w-5" />
      </div>
      <div className="flex flex-col min-w-0">
        <p className="text-xs font-semibold text-foreground leading-tight">
          Install Rupiq App
        </p>
        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
          Access your finances instantly from your home screen.
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
        <Button
          size="sm"
          onClick={handleInstall}
          className="rounded-xl text-xs font-medium cursor-pointer shadow-xs"
        >
          Install
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </div>
  );
}
