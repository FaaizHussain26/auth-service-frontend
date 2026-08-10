"use client";

import { Filter } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { SearchInput } from "./SearchInput";

export function FilterToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  totalLabel,
  open,
  onToggleOpen,
  title,
  onReset,
  children,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  totalLabel?: string;
  open: boolean;
  onToggleOpen: () => void;
  title: string;
  onReset: () => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={onSearchChange} placeholder={searchPlaceholder} />
        {totalLabel ? <p className="whitespace-nowrap text-sm text-ink-500">{totalLabel}</p> : null}
        <Button variant="outline" className="ml-auto rounded-full" onClick={onToggleOpen}>
          <Filter className="h-4 w-4" />
          {open ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {open ? (
        <Card className="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-ink-900">{title}</h3>
            <Button variant="outline" className="h-9 px-3 text-xs" onClick={onReset}>
              Reset Filters
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
        </Card>
      ) : null}
    </div>
  );
}

export function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-700">{label}</p>
      {children}
    </div>
  );
}
