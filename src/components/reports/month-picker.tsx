"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

interface MonthPickerProps {
  month: number;
  year: number;
}

export function MonthPicker({ month, year }: MonthPickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(newMonth: number, newYear: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", String(newMonth));
    params.set("year", String(newYear));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={String(month)}
        onValueChange={(v: string | null) => {
          if (v) navigate(Number(v), year);
        }}
      >
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m, i) => (
            <SelectItem key={i + 1} value={String(i + 1)}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(year)}
        onValueChange={(v: string | null) => {
          if (v) navigate(month, Number(v));
        }}
      >
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}