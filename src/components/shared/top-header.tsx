"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/accounts": "Accounts",
  "/budgets": "Budgets",
  "/goals": "Goals",
  "/reports": "Reports",
  "/settings": "Settings",
};

// Standard shadcn sidebar header: trigger + vertical separator + breadcrumb
export function TopHeader() {
  const pathname = usePathname();

  const currentPage =
    ROUTE_LABELS[pathname] ??
    Object.entries(ROUTE_LABELS).find(([key]) => pathname.startsWith(`${key}/`))?.[1] ??
    "Dashboard";

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4 md:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Rupiq</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
