import React from "react";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textClassName?: string;
}

export function AppLogo({
  className,
  size = "md",
  showText = true,
  textClassName,
}: AppLogoProps) {
  const sizeMap = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
    xl: "h-14 w-14",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Modern Gradient Hex / Diamond Vault Emblem */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/75 text-primary-foreground shadow-md transition-all hover:shadow-primary/20 hover:scale-105",
          sizeMap[size]
        )}
      >
        {/* Geometric Financial Prism Icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("text-primary-foreground drop-shadow-xs", iconSizes[size])}
        >
          {/* Isometric Diamond / Prism */}
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
          {/* Inner spark dot */}
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      </div>

      {showText && (
        <span
          className={cn(
            "font-bold tracking-tight text-foreground text-base sm:text-lg flex items-center gap-1",
            textClassName
          )}
        >
          <span>Finance</span>
          <span className="text-primary font-extrabold">Manager</span>
        </span>
      )}
    </div>
  );
}