import { AiAdvisorDrawer } from "@/components/ai/ai-advisor-drawer";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { TopHeader } from "@/components/shared/top-header";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <TopHeader />
        <main className="flex flex-1 flex-col gap-4 px-4 pt-0 pb-4 md:px-6">{children}</main>
        <AiAdvisorDrawer />
      </SidebarInset>
    </SidebarProvider>
  );
}