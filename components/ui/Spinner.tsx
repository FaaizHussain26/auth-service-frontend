import { Loader2 } from "lucide-react";

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-500">
      <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
