"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BudgetDialog } from "./budget-dialog";

export function AddBudgetButton({ month, year }: { month?: number; year?: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add budget
      </Button>
      {/* Keyed by period so the preselected month follows the month being viewed */}
      <BudgetDialog
        key={`${month}-${year}`}
        open={open}
        onOpenChange={setOpen}
        defaultMonth={month}
        defaultYear={year}
      />
    </>
  );
}
