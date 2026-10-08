import { CategoryChart } from "@/components/dashboard/category-chart";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { StatCards } from "@/components/dashboard/stat-cards";
import { TransactionsTable } from "@/components/dashboard/transactions/data-table";
import { DashboardBudgets } from "@/components/dashboard/dashboard-budgets";
import { DashboardGoals } from "@/components/dashboard/dashboard-goals";
import { getFullDashboardData } from "@/actions/transactions";

export default async function Dashboard() {
  const {
    initialPaginatedTx,
    analytics,
    accounts,
    budgets,
    goals,
  } = await getFullDashboardData();

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Global Stat Summary (one row of four) */}
      <StatCards accounts={accounts} yearlyData={analytics.yearlyData} />

      {/* 2. Analytics Charts (Weekly / Monthly / Yearly switchable) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <OverviewChart
          monthlyData={analytics.overviewData}
          weeklyData={analytics.weeklyData} yearlyData={analytics.yearlyData}
        />
        <CategoryChart data={analytics.categoryData} />
      </div>

      {/* 3. Budgets & Goals glance cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DashboardBudgets budgets={budgets} categorySpending={analytics.categorySpending} />
        <DashboardGoals goals={goals} />
      </div>

      {/* 4. Server-Side Paginated Transactions Table */}
      <TransactionsTable
        initialData={initialPaginatedTx.data}
        initialTotal={initialPaginatedTx.meta.total}
        accounts={accounts}
      />
    </div>
  );
}
