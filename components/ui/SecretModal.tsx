"use client";

import { Copy } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface SecretItem {
  label: string;
  value: string;
}

export function SecretModal({
  open,
  title,
  description,
  items,
  onDone,
}: {
  open: boolean;
  title: string;
  description: string;
  items: SecretItem[];
  onDone: () => void;
}) {
  return (
    <Modal open={open} onClose={onDone} title={title}>
      <p className="mb-4 text-sm text-ink-700">{description}</p>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-700">{item.label}</p>
            <div className="flex items-center gap-2 rounded-field border border-surface-border bg-surface-page px-3.5 py-2.5">
              <code className="flex-1 truncate text-xs text-ink-900">{item.value}</code>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(item.value)}
                className="text-ink-500 hover:text-ink-900"
                aria-label={`Copy ${item.label}`}
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onDone}>Done</Button>
      </div>
    </Modal>
  );
}
