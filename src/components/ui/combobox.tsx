"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  allowCustom?: boolean;
  className?: string;
}

export function Combobox({
  options = [],
  value,
  onChange,
  placeholder = "Select vendor or merchant...",
  searchPlaceholder = "Search or type new vendor...",
  allowCustom = true,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedOption = options.find(
    (opt) => opt.value.toLowerCase() === value?.toLowerCase()
  );

  const displayLabel = selectedOption ? selectedOption.label : value || "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between rounded-xl h-10 text-xs font-normal bg-card border-input hover:bg-muted/40",
              !value && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <span className="truncate">{displayLabel || placeholder}</span>
        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="w-[--anchor-width] min-w-[280px] p-0 rounded-2xl shadow-xl border border-border">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty className="py-2.5 px-3 text-xs text-muted-foreground text-center">
              {search.trim() ? (
                <button
                  type="button"
                  onClick={() => {
                    onChange(search.trim());
                    setOpen(false);
                    setSearch("");
                  }}
                  className="flex items-center justify-center gap-1.5 w-full py-1 text-primary hover:underline font-medium cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Use custom &quot;{search.trim()}&quot;</span>
                </button>
              ) : (
                "No suggestions found."
              )}
            </CommandEmpty>

            <CommandGroup heading="Suggested Vendors">
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : opt.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="flex items-center justify-between"
                >
                  <span>{opt.label}</span>
                  <Check
                    className={cn(
                      "h-3.5 w-3.5 text-primary",
                      value?.toLowerCase() === opt.value.toLowerCase()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>

            {allowCustom && search.trim() && !options.some(o => o.value.toLowerCase() === search.trim().toLowerCase()) && (
              <CommandGroup heading="Custom Vendor">
                <CommandItem
                  value={search.trim()}
                  onSelect={() => {
                    onChange(search.trim());
                    setOpen(false);
                    setSearch("");
                  }}
                  className="text-primary font-medium flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add &quot;{search.trim()}&quot;</span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}