import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a calendar date string (YYYY-MM-DD or ISO string) accurately
 * using UTC date components so local browser timezone offsets never shift the day back.
 */
export function formatCalendarDate(
  isoDateStr: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }
): string {
  if (!isoDateStr) return "-";
  const str = typeof isoDateStr === "string" ? isoDateStr : isoDateStr.toISOString();
  const dateOnly = str.split("T")[0];
  const parts = dateOnly.split("-");
  if (parts.length !== 3) return str;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const utcDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
  return new Intl.DateTimeFormat("en-IN", { ...options, timeZone: "UTC" }).format(utcDate);
}

/**
 * Extract YYYY-MM-DD for date input defaults safely without timezone shifting
 */
export function toInputDate(isoDateStr: string | Date | null | undefined): string {
  if (!isoDateStr) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const str = typeof isoDateStr === "string" ? isoDateStr : isoDateStr.toISOString();
  return str.split("T")[0];
}