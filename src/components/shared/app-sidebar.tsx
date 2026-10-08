"use client";
import { AppLogo } from "@/components/shared/app-logo";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ArrowLeftRight,
  ChevronsUpDown,
  Landmark,
  LayoutDashboard,
  LogOut,
  PieChart,
  PiggyBank,
  Settings,
  Target,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppSidebarProps } from "@/types/user";
import { logout } from "@/actions/auth";

const navOverview = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    title: "Accounts",
    url: "/accounts",
    icon: Landmark,
  },
];

const navPlanning = [
  {
    title: "Budgets",
    url: "/budgets",
    icon: PiggyBank,
  },
  {
    title: "Goals",
    url: "/goals",
    icon: Target,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: PieChart,
  },
];

export function AppSidebar({ user }: { user: AppSidebarProps }) {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  const initials = (user?.name || "User")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navGroups = [
    { label: "Overview", items: navOverview },
    { label: "Planning", items: navPlanning },
  ];

  return (
    <Sidebar
      variant="floating"
      className="*:data-[slot=sidebar-inner]:rounded-4xl *:data-[slot=sidebar-inner]:overflow-hidden"
    >
      {/* Header */}
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/dashboard"
              className="flex w-full items-center gap-3 rounded-3xl px-2 py-1.5 transition-colors hover:bg-sidebar-accent"
            >
              <AppLogo size="md" />
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map(({ title, url, icon: Icon }) => {
                  const isActive = pathname === url || pathname.startsWith(`${url}/`);
                  return (
                    <SidebarMenuItem key={title}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={<Link href={url} />}
                        className="h-10 gap-3 px-2 data-active:font-semibold"
                      >
                        {/* Icon tile mirrors the stat-card icon treatment */}
                        <span
                          className={
                            isActive
                              ? "flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20"
                              : "flex size-7 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground transition-colors group-hover/menu-button:text-primary"
                          }
                        >
                          <Icon />
                        </span>
                        <span>{title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="rounded-3xl"
                  />
                }
              >
                <Avatar className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-primary/20">
                  <AvatarFallback className="rounded-full bg-primary text-primary-foreground font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col overflow-hidden text-left">
                  <span className="truncate text-sm font-medium">
                    {user.name}
                  </span>

                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>

                <ChevronsUpDown className="ml-auto h-4 w-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-56"
                side={isMobile ? "bottom" : "right"}
                align="end"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-9 w-9 rounded-full border border-border/60 overflow-hidden bg-muted">
                        <AvatarFallback className="rounded-full bg-primary/10 text-primary font-bold text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col overflow-hidden text-left">
                        <span className="truncate text-sm font-semibold">
                          {user.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem render={<Link href="/settings" />}>
                  <Settings />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={logout}>
                  <LogOut />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
