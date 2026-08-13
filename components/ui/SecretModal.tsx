"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { useToast } from "./toast-context";

interface SecretItem {
  label: string;
  value: string;
}

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // Clipboard API unavailable or blocked (older browser, permissions
    // policy) — fall back to the legacy selection-based copy.
    try {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
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
  const { notify } = useToast();
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const handleCopy = async (item: SecretItem) => {
    const ok = await copyToClipboard(item.value);
    if (!ok) {
      notify("error", `Couldn't copy ${item.label.toLowerCase()} — copy it manually instead.`);
      return;
    }
    setCopiedLabel(item.label);
    setTimeout(() => setCopiedLabel((current) => (current === item.label ? null : current)), 1500);
  };

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
                onClick={() => handleCopy(item)}
                className="text-ink-500 hover:text-ink-900"
                aria-label={`Copy ${item.label}`}
              >
                {copiedLabel === item.label ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
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
