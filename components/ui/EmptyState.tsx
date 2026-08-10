import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-surface-border bg-white px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-ink-500">{description}</p> : null}
      {action}
    </div>
  );
}
