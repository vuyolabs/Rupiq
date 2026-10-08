"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FinancialReportData {
  period: { month: number; year: number };
  summary: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
  };
  categorySpending: { category: string; amount: number }[];
  budgets: {
    id: number;
    name: string | null;
    category: string;
    budget: number;
    spent: number;
    remaining: number;
    utilization: number;
  }[];
  accounts: {
    id: number;
    name: string;
    type: string;
    balance: number;
  }[];
  goals: {
    id: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    remainingAmount: number;
    progress: number;
    targetDate: Date | string | null;
  }[];
  transactions: {
    id: number;
    amount: number;
    type: string;
    category: string;
    merchant: string | null;
    description: string | null;
    occurredAt: string;
  }[];
}

export function ReportExportButton({
  report,
  monthName,
  year,
}: {
  report: FinancialReportData;
  monthName: string;
  year: number;
}) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<"pdf" | "excel" | null>(null);

  // Section inclusion options
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeCategorySpending, setIncludeCategorySpending] = useState(true);
  const [includeBudgets, setIncludeBudgets] = useState(true);
  const [includeGoals, setIncludeGoals] = useState(true);
  const [includeTransactions, setIncludeTransactions] = useState(true);
  const [includeAccounts, setIncludeAccounts] = useState(true);

  const formatCurrency = (val: number) => {
    const formatted = new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(Math.abs(val));
    return val < 0 ? `- INR ${formatted}` : `INR ${formatted}`;
  };

  function handleExcelExport() {
    try {
      setIsExporting("excel");
      const wb = XLSX.utils.book_new();

      if (includeSummary) {
        const summaryRows = [
          ["Financial Statement Summary", `${monthName} ${year}`],
          [],
          ["Metric", "Value"],
          ["Total Income (INR)", report.summary.income],
          ["Total Expenses (INR)", report.summary.expenses],
          ["Net Savings (INR)", report.summary.savings],
          ["Savings Rate (%)", Number(report.summary.savingsRate.toFixed(1))],
        ];
        const ws = XLSX.utils.aoa_to_sheet(summaryRows);
        XLSX.utils.book_append_sheet(wb, ws, "Summary");
      }

      if (includeCategorySpending && report.categorySpending.length) {
        const rows = [
          ["Category", "Amount Spent (INR)"],
          ...report.categorySpending.map((c) => [c.category, c.amount]),
        ];
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "Category Spending");
      }

      if (includeBudgets && report.budgets.length) {
        const rows = [
          ["Budget Name", "Category", "Budget Limit (INR)", "Spent (INR)", "Remaining (INR)", "Utilization (%)"],
          ...report.budgets.map((b) => [
            b.name || b.category,
            b.category,
            b.budget,
            b.spent,
            b.remaining,
            Number(b.utilization.toFixed(1)),
          ]),
        ];
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "Budgets");
      }

      if (includeGoals && report.goals.length) {
        const rows = [
          ["Goal Name", "Target Amount (INR)", "Saved So Far (INR)", "Remaining (INR)", "Progress (%)", "Target Date"],
          ...report.goals.map((g) => [
            g.name,
            g.targetAmount,
            g.currentAmount,
            g.remainingAmount,
            Number(g.progress.toFixed(1)),
            g.targetDate ? new Date(g.targetDate).toLocaleDateString("en-IN") : "N/A",
          ]),
        ];
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "Goals");
      }

      if (includeTransactions && report.transactions.length) {
        const rows = [
          ["ID", "Date", "Type", "Category", "Merchant / Detail", "Amount (INR)"],
          ...report.transactions.map((t) => [
            t.id,
            new Date(t.occurredAt).toLocaleDateString("en-IN"),
            t.type,
            t.category,
            t.merchant || t.description || "-",
            t.amount,
          ]),
        ];
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      }

      if (includeAccounts && report.accounts.length) {
        const rows = [
          ["Account Name", "Account Type", "Current Balance (INR)"],
          ...report.accounts.map((a) => [a.name, a.type, a.balance]),
        ];
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "Accounts");
      }

      XLSX.writeFile(wb, `Finance_Statement_${monthName}_${year}.xlsx`);
      toast.success("Excel statement exported successfully");
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate Excel statement");
    } finally {
      setIsExporting(null);
    }
  }

  function handlePDFExport() {
    try {
      setIsExporting("pdf");
      const doc = new jsPDF();

      // Brand Header Accent Bar
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("FINANCE STATEMENT REPORT", 14, 16);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`PERIOD: ${monthName.toUpperCase()} ${year}`, 150, 16);

      let currentY = 32;

      // 1. Executive Summary Table
      if (includeSummary) {
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("1. Executive Summary", 14, currentY);

        autoTable(doc, {
          startY: currentY + 3,
          head: [["Financial Metric", "Amount (INR)"]],
          body: [
            ["Total Monthly Income", formatCurrency(report.summary.income)],
            ["Total Monthly Expenses", formatCurrency(report.summary.expenses)],
            ["Net Savings", formatCurrency(report.summary.savings)],
            ["Savings Rate", `${report.summary.savingsRate.toFixed(1)}%`],
          ],
          theme: "grid",
          headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
          styles: { font: "helvetica", fontSize: 9 },
        });

        currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      }

      // 2. Budgets
      if (includeBudgets) {
        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        }

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("2. Budget Utilization", 14, currentY);

        const budgetBody = report.budgets.length
          ? report.budgets.map((b) => [
              b.name || b.category,
              b.category,
              formatCurrency(b.budget),
              formatCurrency(b.spent),
              formatCurrency(b.remaining),
              `${Math.round(b.utilization)}%`,
            ])
          : [["No active budgets configured for this month", "-", "-", "-", "-", "-"]];

        autoTable(doc, {
          startY: currentY + 3,
          head: [["Budget Name", "Category", "Limit", "Spent", "Remaining", "Used"]],
          body: budgetBody,
          theme: "striped",
          headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
          styles: { font: "helvetica", fontSize: 8.5 },
        });

        currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      }

      // 3. Category Spending Breakdown
      if (includeCategorySpending) {
        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        }

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("3. Category Spending Breakdown", 14, currentY);

        const catBody = report.categorySpending.length
          ? report.categorySpending.map((c) => [
              c.category,
              formatCurrency(c.amount),
              `${report.summary.expenses > 0 ? ((c.amount / report.summary.expenses) * 100).toFixed(1) : "0"}%`,
            ])
          : [["No spending recorded", "-", "-"]];

        autoTable(doc, {
          startY: currentY + 3,
          head: [["Category", "Amount Spent", "Share of Total Expenses"]],
          body: catBody,
          theme: "striped",
          headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
          styles: { font: "helvetica", fontSize: 8.5 },
        });

        currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      }

      // 4. Goals
      if (includeGoals && report.goals.length) {
        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        }

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("4. Financial Savings Goals", 14, currentY);

        autoTable(doc, {
          startY: currentY + 3,
          head: [["Goal Name", "Target Amount", "Current Savings", "Remaining", "Progress"]],
          body: report.goals.map((g) => [
            g.name,
            formatCurrency(g.targetAmount),
            formatCurrency(g.currentAmount),
            formatCurrency(g.remainingAmount),
            `${Math.round(g.progress)}%`,
          ]),
          theme: "striped",
          headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
          styles: { font: "helvetica", fontSize: 8.5 },
        });

        currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      }

      // 5. Itemized Transactions (Always start on fresh page)
      if (includeTransactions && report.transactions.length) {
        doc.addPage();
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Itemized Transactions Ledger", 14, 20);

        autoTable(doc, {
          startY: 25,
          head: [["Date", "Type", "Category", "Merchant / Note", "Amount"]],
          body: report.transactions.map((t) => [
            new Date(t.occurredAt).toLocaleDateString("en-IN"),
            t.type === "CREDIT" ? "Income" : "Expense",
            t.category,
            t.merchant || t.description || "-",
            formatCurrency(t.amount),
          ]),
          theme: "striped",
          headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
          styles: { font: "helvetica", fontSize: 8 },
        });
      }

      // Footer page numbering
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Finance Manager Statement  |  Generated on ${new Date().toLocaleDateString("en-IN")}  |  Page ${i} of ${totalPages}`,
          14,
          290
        );
      }

      doc.save(`Finance_Statement_${monthName}_${year}.pdf`);
      toast.success("PDF statement exported successfully");
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF statement");
    } finally {
      setIsExporting(null);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <span>Export Statement</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Financial Statement</DialogTitle>
            <DialogDescription>
              Select the sections to include in your statement report for {monthName} {year}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sec-summary"
                checked={includeSummary}
                onCheckedChange={(v) => setIncludeSummary(!!v)}
              />
              <Label htmlFor="sec-summary" className="text-sm font-medium cursor-pointer">
                Financial Summary (Income, Expenses, Savings)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sec-categories"
                checked={includeCategorySpending}
                onCheckedChange={(v) => setIncludeCategorySpending(!!v)}
              />
              <Label htmlFor="sec-categories" className="text-sm font-medium cursor-pointer">
                Category Spending Distribution
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sec-budgets"
                checked={includeBudgets}
                onCheckedChange={(v) => setIncludeBudgets(!!v)}
              />
              <Label htmlFor="sec-budgets" className="text-sm font-medium cursor-pointer">
                Monthly Budgets & Utilization
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sec-goals"
                checked={includeGoals}
                onCheckedChange={(v) => setIncludeGoals(!!v)}
              />
              <Label htmlFor="sec-goals" className="text-sm font-medium cursor-pointer">
                Savings Goals Progress
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sec-transactions"
                checked={includeTransactions}
                onCheckedChange={(v) => setIncludeTransactions(!!v)}
              />
              <Label htmlFor="sec-transactions" className="text-sm font-medium cursor-pointer">
                Itemized Transactions Ledger
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sec-accounts"
                checked={includeAccounts}
                onCheckedChange={(v) => setIncludeAccounts(!!v)}
              />
              <Label htmlFor="sec-accounts" className="text-sm font-medium cursor-pointer">
                Connected Accounts & Balances
              </Label>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleExcelExport}
              disabled={!!isExporting}
              className="w-full sm:w-auto gap-2"
            >
              {isExporting === "excel" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              )}
              Export Excel (.xlsx)
            </Button>

            <Button
              onClick={handlePDFExport}
              disabled={!!isExporting}
              className="w-full sm:w-auto gap-2"
            >
              {isExporting === "pdf" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 text-red-400" />
              )}
              Generate PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}