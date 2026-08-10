"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

export function MultiSelectChips({
  options,
  values,
  onChange,
  placeholder = "Type to search…",
}: {
  options: readonly Option[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.filter((option) => values.includes(option.value));
  const available = options.filter(
    (option) => !values.includes(option.value) && option.label.toLowerCase().includes(query.toLowerCase()),
  );

  const add = (value: string) => {
    onChange([...values, value]);
    setQuery("");
  };

  const remove = (value: string) => {
    onChange(values.filter((entry) => entry !== value));
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-field border border-surface-border bg-white px-2.5 py-1.5 focus-within:border-brand-600 focus-within:ring-3 focus-within:ring-brand-600/12">
        {selected.map((option) => (
          <span key={option.value} className="flex items-center gap-1 rounded-full bg-brand-100 py-1 pl-2.5 pr-1.5 text-xs font-medium text-brand-700">
            {option.label}
            <button type="button" onClick={() => remove(option.value)} className="rounded-full p-0.5 hover:bg-brand-600/20" aria-label={`Remove ${option.label}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder={selected.length ? "" : placeholder}
          className="h-7 min-w-[120px] flex-1 border-none bg-transparent px-1 text-sm text-ink-900 outline-none placeholder:text-ink-500"
        />
      </div>

      {open && available.length ? (
        <div className="absolute z-[60] mt-1.5 max-h-56 w-full overflow-y-auto rounded-2xl border border-surface-border bg-white p-1.5 shadow-xl">
          {available.map((option) => (
            <button
              key={option.value}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => add(option.value)}
              className={cn("flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-ink-900 hover:bg-surface-page")}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
