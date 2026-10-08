"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Building, Hash, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { createAccount, updateAccount } from "@/actions/accounts";
import { accountTypeLabel, type Account, type AccountType } from "@/types/finance";

const accountTypes: AccountType[] = ["BANK", "CREDIT_CARD", "WALLET", "OTHER"];

interface AccountDialogProps {
  account?: Account;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDialog({ account, open, onOpenChange }: AccountDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [type, setType] = useState<string>(account?.type ?? "BANK");

  const isEdit = !!account;
  const isCreditCard = type === "CREDIT_CARD";
  const isBank = type === "BANK";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("type", type);

    startTransition(async () => {
      const result = isEdit
        ? await updateAccount(account.id, formData)
        : await createAccount(formData);

      if ("errors" in result && result.errors) {
        setErrors(result.errors as Record<string, string[]>);
        const firstErr = Object.values(result.errors)[0]?.[0];
        toast.error(firstErr ?? (isEdit ? "Failed to update account" : "Failed to create account"));
        return;
      }

      setErrors({});
      onOpenChange(false);
      toast.success(isEdit ? "Account updated" : "Account created");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {isEdit ? "Edit account" : "Add account"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="type" value={type} />

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="acc-name">Account Name / Bank</Label>
            <Input
              id="acc-name"
              name="name"
              placeholder={
                isCreditCard
                  ? "e.g. Slice Rupay Credit Card"
                  : isBank
                  ? "e.g. HDFC Salary Account, ICICI Savings"
                  : "e.g. Petty Cash, Paytm Wallet"
              }
              defaultValue={account?.name}
              required
              aria-invalid={!!errors.name}
              className="rounded-xl"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="acc-type">Account Type</Label>
            <Select value={type} items={accountTypeLabel} onValueChange={(v: string | null) => v && setType(v)}>
              <SelectTrigger id="acc-type" className="w-full rounded-xl">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {accountTypeLabel[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-destructive">{errors.type[0]}</p>}
          </div>

          {/* Account Balance / Owed Bill */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="acc-balance">
              {isCreditCard ? "Outstanding Bill / Owed Balance" : "Current Available Balance"}
            </Label>
            <Input
              id="acc-balance"
              name="balance"
              type="number"
              step="0.01"
              placeholder={isCreditCard ? "0.00 (Amount you currently owe)" : "0.00"}
              defaultValue={account?.balance ?? 0}
              required
              aria-invalid={!!errors.balance}
              className="rounded-xl"
            />
            <p className="text-[11px] text-muted-foreground">
              {isCreditCard
                ? "Enter the outstanding bill amount you currently owe. Enter 0 if no debt."
                : "Enter current available funds in this account."}
            </p>
            {errors.balance && <p className="text-xs text-destructive">{errors.balance[0]}</p>}
          </div>

          {/* Bank Identifiers (Account Number, IFSC, Branch) */}
          <div className="pt-2 border-t border-border/60 flex flex-col gap-3">
            <span className="text-xs font-semibold text-muted-foreground">
              Banking Information <span className="text-[10px] font-normal">(optional metadata)</span>
            </span>

            {/* Account Number */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="acc-num" className="text-xs flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                Account Number
              </Label>
              <Input
                id="acc-num"
                name="accountNumber"
                placeholder={isCreditCard ? "e.g. Last 4 digits (•••• 4321)" : "e.g. 50100234891234"}
                defaultValue={account?.accountNumber ?? ""}
                className="rounded-xl font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* IFSC Code */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="acc-ifsc" className="text-xs flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-muted-foreground" />
                  IFSC Code
                </Label>
                <Input
                  id="acc-ifsc"
                  name="ifsc"
                  placeholder="e.g. HDFC0000123"
                  defaultValue={account?.ifsc ?? ""}
                  className="rounded-xl uppercase text-xs font-mono"
                  aria-invalid={!!errors.ifsc}
                />
                {errors.ifsc && (
                  <p className="text-xs text-destructive">{errors.ifsc[0]}</p>
                )}
              </div>

              {/* Branch */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="acc-branch" className="text-xs flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Branch
                </Label>
                <Input
                  id="acc-branch"
                  name="branch"
                  placeholder="e.g. Indiranagar, MG Road"
                  defaultValue={account?.branch ?? ""}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {errors.form && <p className="text-xs text-destructive">{errors.form[0]}</p>}

          <DialogFooter className="mt-2">
            <Button type="submit" disabled={isPending} className="rounded-xl w-full sm:w-auto">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Add account"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}