"use client";

import type { ReactNode } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxOption {
  value: string;
  label: string;
  /** Optional trailing badge/marker rendered next to the label in the open list. */
  indicator?: ReactNode;
}

const CLEAR_VALUE = "__combobox_clear__";

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly ComboboxOption[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <SelectPrimitive.Root
      value={value || CLEAR_VALUE}
      onValueChange={(next) => onValueChange(next === CLEAR_VALUE ? "" : next)}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-field border border-surface-border bg-white px-3.5 text-sm text-ink-900 outline-none transition-colors data-[state=open]:border-brand-600 data-[state=open]:ring-3 data-[state=open]:ring-brand-600/12",
          className,
        )}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon>
          <ChevronDown className="h-4 w-4 shrink-0 text-ink-500" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-[60] max-h-72 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-surface-border bg-white p-1.5 shadow-xl"
        >
          <SelectPrimitive.Viewport>
            <SelectPrimitive.Item
              value={CLEAR_VALUE}
              className="flex cursor-pointer select-none items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-ink-500 outline-none data-[highlighted]:bg-surface-page"
            >
              <SelectPrimitive.ItemText>{placeholder}</SelectPrimitive.ItemText>
            </SelectPrimitive.Item>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="flex cursor-pointer select-none items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-ink-900 outline-none data-[highlighted]:bg-surface-page data-[state=checked]:font-semibold"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  {option.indicator}
                </span>
                <SelectPrimitive.ItemIndicator>
                  <Check className="h-4 w-4 text-brand-600" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
