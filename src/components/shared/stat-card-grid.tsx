import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface StatCardItem {
  label: string;
  value: string;
  icon: LucideIcon;
  subtitle?: string;
}

/**
 * The app-wide KPI row: four shadcn cards in one row with a soft primary tint.
 * Card spacing is left to the Card defaults; never override --card-spacing here.
 */
export function StatCardGrid({ items }: { items: StatCardItem[] }) {
  return (
    // Grid set inline so the one-row layout never depends on a (possibly stale) stylesheet
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        gap: "1rem",
      }}
    >
      {items.map(({ label, value, icon: Icon, subtitle }) => (
        <Card key={label} className="min-w-0 bg-linear-to-t from-primary/10 to-card">
          <CardHeader>
            <CardDescription>{label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">{value}</CardTitle>
            <CardAction>
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Icon className="size-4" />
              </div>
            </CardAction>
          </CardHeader>
          {subtitle && (
            <CardFooter className="text-sm text-muted-foreground">{subtitle}</CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
