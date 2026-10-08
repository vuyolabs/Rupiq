"use client";
import { toInputDate } from "@/lib/utils";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";

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

import { createTransaction, updateTransaction } from "@/actions/transactions";
import {
  accountTypeLabel,
  categoriesForType,
  categoryMeta,
  defaultCategoryForType,
  type Account,
  type Transaction,
  type TransactionCategory,
  type TransactionType,
} from "@/types/finance";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface TransactionDialogProps {
  transaction?: Transaction;
  accounts: Account[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Popular suggested vendors by category for fast auto-complete / datalist selection
const VENDOR_SUGGESTIONS: Partial<Record<TransactionCategory, string[]>> = {
  STREAMING_OTT: [
    "Netflix",
    "Amazon Prime Video",
    "JioHotstar / Disney+ Hotstar",
    "SonyLIV",
    "Zee5",
    "YouTube Premium",
    "Apple TV+",
    "JioCinema",
  ],
  MOBILE_RECHARGE: [
    "Jio Prepaid Recharge",
    "Airtel Thanks Recharge",
    "Vi (Vodafone Idea)",
    "Tata Play DTH",
    "Airtel Digital TV",
    "BSNL Mobile",
  ],
  ONLINE_SHOPPING: [
    "Amazon",
    "Flipkart",
    "Meesho",
    "Myntra",
    "Ajio",
    "Nykaa",
    "Tata CLiQ",
  ],
  GROCERIES: [
    "Zepto",
    "Blinkit",
    "Swiggy Instamart",
    "DMart Ready",
    "BigBasket / BB Daily",
    "Nature's Basket",
    "Local Kirana / Supermarket",
  ],
  FOOD: [
    "Zomato",
    "Swiggy",
    "McDonald's",
    "Domino's Pizza",
    "KFC",
    "Subway",
    "Burger King",
    "Local Restaurant",
  ],
  SNACKS_TEA: [
    "Chai Point",
    "Chaayos",
    "Starbucks",
    "Third Wave Coffee",
    "Local Tea Stall",
    "Bakery & Sweets",
  ],
  SUBSCRIPTION: [
    "Spotify Premium",
    "Apple iCloud+",
    "Google One",
    "ChatGPT Plus",
    "Midjourney",
    "Notion",
    "Microsoft 365",
  ],
  TRANSPORTATION: [
    "Uber",
    "Ola Cabs",
    "Rapido",
    "Indian Oil Fuel",
    "Bharat Petroleum",
    "Metro Card Recharge",
    "FASTag Recharge",
  ],
};

export function TransactionDialog({
  transaction,
  accounts,
  open,
  onOpenChange,
}: TransactionDialogProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [type, setType] = useState<TransactionType>(
    transaction?.type ?? "DEBIT",
  );
  const [category, setCategory] = useState<TransactionCategory>(
    transaction?.category ?? defaultCategoryForType("DEBIT"),
  );

  // Only offer categories that make sense for the chosen type. When editing,
  // keep the saved category visible even if it predates this rule.
  const categoryOptions = categoriesForType(type);
  if (
    transaction &&
    transaction.type === type &&
    !categoryOptions.includes(transaction.category)
  ) {
    categoryOptions.unshift(transaction.category);
  }

  function handleTypeChange(next: TransactionType) {
    setType(next);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.type;
      delete next.category;
      return next;
    });
    if (!categoriesForType(next).includes(category)) {
      setCategory(defaultCategoryForType(next));
    }
  }

  const categoryItems = Object.fromEntries(
    categoryOptions.map((c) => [c, categoryMeta[c].label]),
  );
  const accountItems = Object.fromEntries(
    accounts.map((a) => [String(a.id), a.name]),
  );
  const [accountId, setAccountId] = useState<string>(
    transaction
      ? String(transaction.accountId)
      : accounts[0]
        ? String(accounts[0].id)
        : "",
  );
  const [merchantInput, setMerchantInput] = useState<string>(
    transaction?.merchant ?? "",
  );

  const isEdit = !!transaction;

  const defaultDate = toInputDate(transaction?.occurredAt);

  const suggestions = VENDOR_SUGGESTIONS[category as TransactionCategory] || [];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    formData.set("type", type);
    formData.set("category", category);
    formData.set(
      "accountId",
      accountId || (accounts[0] ? String(accounts[0].id) : ""),
    );
    formData.set("merchant", merchantInput.trim());

    startTransition(async () => {
      const result = isEdit
        ? await updateTransaction(transaction.id, formData)
        : await createTransaction(formData);

      if (result && "errors" in result && result.errors) {
        setErrors(result.errors as Record<string, string[]>);
        const firstErr = Object.values(result.errors)[0]?.[0];
        toast.error(
          firstErr ??
            (isEdit
              ? "Failed to update transaction"
              : "Failed to create transaction"),
        );
        return;
      }

      setErrors({});
      onOpenChange(false);
      toast.success(isEdit ? "Transaction updated" : "Transaction added");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {isEdit ? "Edit transaction" : "Add transaction"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="category" value={category} />
          <input
            type="hidden"
            name="accountId"
            value={accountId || (accounts[0] ? String(accounts[0].id) : "")}
          />

          <div className="grid grid-cols-2 gap-3">
            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tx-amount">Amount (INR)</Label>
              <Input
                id="tx-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                defaultValue={transaction?.amount}
                required
                aria-invalid={!!errors.amount}
                className="rounded-xl"
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount[0]}</p>
              )}
            </div>

            {/* Type: segmented toggle so the choice is always visible */}
            <div className="flex flex-col gap-1.5">
              <Label id="tx-type-label">Type</Label>
              <div
                role="radiogroup"
                aria-labelledby="tx-type-label"
                className="grid h-9 grid-cols-2 gap-1 rounded-xl bg-muted p-1"
              >
                {(
                  [
                    { value: "DEBIT", label: "Expense", Icon: ArrowUpRight },
                    { value: "CREDIT", label: "Income", Icon: ArrowDownLeft },
                  ] as const
                ).map(({ value, label, Icon }) => {
                  const active = type === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => handleTypeChange(value)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                        active
                          ? value === "CREDIT"
                            ? "bg-background text-emerald-600 shadow-sm dark:text-emerald-400"
                            : "bg-background text-rose-600 shadow-sm dark:text-rose-400"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  );
                })}
              </div>
              {errors.type?.[0] && (
                <p className="text-xs text-destructive">{errors.type[0]}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tx-category">
              {type === "CREDIT" ? "Income source" : "Spending category"}
            </Label>
            <Select
              value={category}
              items={categoryItems}
              onValueChange={(v: string | null) =>
                v && setCategory(v as TransactionCategory)
              }
            >
              <SelectTrigger
                id="tx-category"
                aria-invalid={!!errors.category?.[0]}
                className="w-full rounded-xl"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((key) => {
                  const meta = categoryMeta[key];
                  const Icon = meta.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {meta.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.category?.[0] && (
              <p className="text-xs text-destructive">{errors.category[0]}</p>
            )}
          </div>

          {/* Account */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tx-account">Account</Label>
            {accounts.length === 0 ? (
              <p className="text-xs text-destructive">
                No accounts found. Please create an account first in the
                Accounts tab.
              </p>
            ) : (
              <Select
                value={accountId || String(accounts[0]?.id)}
                items={accountItems}
                onValueChange={(v: string | null) => v && setAccountId(v)}
              >
                <SelectTrigger id="tx-account" className="w-full rounded-xl">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      <span className="flex items-center gap-2">
                        {a.name}
                        <span className="text-muted-foreground text-xs">
                          {accountTypeLabel[a.type]}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.accountId && (
              <p className="text-xs text-destructive">{errors.accountId[0]}</p>
            )}
          </div>

          {/* Merchant / Vendor using Shadcn Combobox */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="tx-merchant">Merchant / Vendor</Label>
              <span className="text-[11px] text-muted-foreground">
                Search, pick or type custom
              </span>
            </div>
            <Combobox
              options={suggestions.map((s) => ({ value: s, label: s }))}
              value={merchantInput}
              onChange={(v) => setMerchantInput(v)}
              placeholder="Search or select merchant..."
              searchPlaceholder="Type vendor name..."
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tx-desc">
              Description{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="tx-desc"
              name="description"
              placeholder="Short note (e.g. Monthly premium plan, Order #12948)"
              defaultValue={transaction?.description ?? ""}
              className="rounded-xl"
            />
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tx-date">Date</Label>
            <Input
              id="tx-date"
              name="occurredAt"
              type="date"
              defaultValue={defaultDate}
              required
              aria-invalid={!!errors.occurredAt}
              className="rounded-xl"
            />
            {errors.occurredAt && (
              <p className="text-xs text-destructive">{errors.occurredAt[0]}</p>
            )}
          </div>

          {errors.form && (
            <p className="text-xs text-destructive">{errors.form[0]}</p>
          )}

          <DialogFooter className="mt-2">
            <Button
              type="submit"
              disabled={isPending || accounts.length === 0}
              className="rounded-xl w-full sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Add transaction"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
