import React from "react";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textClassName?: string;
}

/**
 * Brand mark: a geometric "R" monogram for Rupiq. Solid theme colours only, no SVG
 * gradient ids, so several logos can render on one page and it follows the primary
 * colour in light and dark mode.
 */
export function AppLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-full shrink-0", className)}
    >
      <rect width="36" height="36" rx="10" className="fill-primary" />

      {/* "R" monogram: stem, bowl and leg */}
      <path
        d="M12.5 27V9H18a4.75 4.75 0 0 1 0 9.5h-5.5M17.5 18.5 23.5 27"
        className="stroke-primary-foreground"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AppLogo({
  className,
  size = "md",
  showText = true,
  textClassName,
}: AppLogoProps) {
  const iconSizeMap = {
    sm: "size-7",
    md: "size-8",
    lg: "size-9",
    xl: "size-11",
  };

  // Wordmark sized so its cap height sits comfortably against the mark
  const titleSizeMap = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-3xl",
  };

  return (
    <div className={cn("inline-flex items-center gap-2 select-none", className)}>
      <div className={cn(iconSizeMap[size], "shrink-0 rounded-[28%] shadow-sm shadow-primary/30")}>
        <AppLogoIcon />
      </div>

      {showText && (
        <span
          className={cn(
            "font-heading font-bold leading-none tracking-tight text-foreground",
            titleSizeMap[size],
            textClassName
          )}
        >
          Rupiq
        </span>
      )}
    </div>
  );
}
