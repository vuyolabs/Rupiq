import { getFinancialReport } from "@/actions/reports";
import { ReportSummary } from "@/components/reports/report-summary";
import { ReportBudgets } from "@/components/reports/report-budgets";
import { ReportGoals } from "@/components/reports/report-goals";
import { MonthPicker } from "@/components/reports/month-picker";
import { ReportExportButton } from "@/components/reports/report-export-button";
import { ReportDataViewer } from "@/components/reports/report-data-viewer";
import { Suspense } from "react";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const now = new Date();
  const month = params.month ? Number(params.month) : now.getMonth() + 1;
  const year = params.year ? Number(params.year) : now.getFullYear();

  const report = await getFinancialReport({ month, year });
  const monthName = MONTH_NAMES[month - 1];

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Month Selector and Export Dialog */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports & Statements</h1>
          <p className="text-muted-foreground">
            Complete financial breakdown and statement for {monthName} {year}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Suspense>
            <MonthPicker month={month} year={year} />
          </Suspense>

          <ReportExportButton
            report={report}
            monthName={monthName}
            year={year}
          />
        </div>
      </div>

      {/* KPI Stat Cards */}
      <ReportSummary
        income={report.summary.income}
        expenses={report.summary.expenses}
        savings={report.summary.savings}
        savingsRate={report.summary.savingsRate}
      />

      {/* Visual Glance Grid (Budgets & Goals) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReportBudgets budgets={report.budgets} />
        <ReportGoals goals={report.goals} />
      </div>

      {/* Interactive Tabbed Data Breakdown Tables */}
      <ReportDataViewer report={report} />
    </div>
  );
}