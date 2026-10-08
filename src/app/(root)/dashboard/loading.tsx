import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* 1. Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>

      {/* 2. Multi-module glance cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>

      {/* 3. Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="lg:col-span-2 h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>

      {/* 4. Table */}
      <Skeleton className="h-96 w-full" />
    </div>
  );
}