"use client";

import { Search } from "lucide-react";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full max-w-sm min-w-[220px]">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={50}
        className="h-11 w-full rounded-full border border-surface-border bg-white pl-10 pr-3.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-500 focus:border-brand-600 focus:ring-3 focus:ring-brand-600/12"
      />
    </div>
  );
}
