"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

export function PageSizeSelect({
  value,
  onValueChange,
}: {
  value: number;
  onValueChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="whitespace-nowrap text-xs text-ink-500">Rows per page</span>
      <SelectPrimitive.Root value={String(value)} onValueChange={(next) => onValueChange(Number(next))}>
        <SelectPrimitive.Trigger className="flex h-9 items-center justify-between gap-2 rounded-field border border-surface-border bg-white px-3 text-sm text-ink-900 outline-none transition-colors data-[state=open]:border-brand-600 data-[state=open]:ring-3 data-[state=open]:ring-brand-600/12">
          <SelectPrimitive.Value />
          <SelectPrimitive.Icon>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-500" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={6}
            className="z-[60] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-surface-border bg-white p-1.5 shadow-xl"
          >
            <SelectPrimitive.Viewport>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectPrimitive.Item
                  key={option}
                  value={String(option)}
                  className="flex cursor-pointer select-none items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-ink-900 outline-none data-[highlighted]:bg-surface-page data-[state=checked]:font-semibold"
                >
                  <SelectPrimitive.ItemText>{option}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <Check className="h-3.5 w-3.5 text-brand-600" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
