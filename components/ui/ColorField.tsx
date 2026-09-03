"use client";

import { cn } from "@/lib/utils";

export function ColorField({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-field border border-surface-border bg-white px-3 py-1.5">
      <input
        id={id}
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-8 shrink-0 cursor-pointer appearance-none rounded-md border-0 bg-transparent p-0"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn("h-9 w-full border-0 bg-transparent text-sm text-ink-900 outline-none")}
        placeholder="#000000"
      />
    </div>
  );
}
