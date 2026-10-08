import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}