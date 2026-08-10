"use client";

import { Plus, X } from "lucide-react";
import { Input } from "./Field";
import { Button } from "./Button";

export function StringListInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const entries = values.length ? values : [""];

  const updateAt = (index: number, next: string) => {
    onChange(entries.map((entry, entryIndex) => (entryIndex === index ? next : entry)));
  };

  const removeAt = (index: number) => {
    onChange(entries.filter((_, entryIndex) => entryIndex !== index));
  };

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => (
        <div key={index} className="flex gap-2">
          <Input value={entry} placeholder={placeholder} onChange={(event) => updateAt(index, event.target.value)} />
          <button
            type="button"
            onClick={() => removeAt(index)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-field border border-surface-border text-ink-500 hover:bg-surface-page"
            aria-label="Remove"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="secondary" className="h-9 px-3 text-xs" onClick={() => onChange([...entries, ""])}>
        <Plus className="h-3.5 w-3.5" />
        Add another
      </Button>
    </div>
  );
}
