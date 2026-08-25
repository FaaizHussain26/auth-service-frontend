import { Boxes, Ban, Eye, Lock, Pencil, Play } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { USER_STATUS_BADGE } from "@/lib/admin/constants";
import type { Application } from "@/lib/admin/types";

export function ApplicationCard({
  application,
  onView,
  onEdit,
  onDisable,
  onActivate,
}: {
  application: Application;
  onView: (application: Application) => void;
  onEdit: (application: Application) => void;
  onDisable: (application: Application) => void;
  onActivate: (application: Application) => void;
}) {
  const badge = USER_STATUS_BADGE[application.status] ?? { label: application.status, tone: "neutral" as const };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-surface-border bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <Boxes className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900">{application.name}</p>
          <p className="truncate text-xs text-ink-500">{application.clientId}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {application.isSystem ? <Badge label="System" tone="neutral" /> : null}
        <Badge label={badge.label} tone={badge.tone} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge label={application.clientType} tone="brand" />
        {application.scopes.slice(0, 4).map((scope) => (
          <Badge key={scope} label={scope} tone="neutral" />
        ))}
        {application.scopes.length > 4 ? <Badge label={`+${application.scopes.length - 4}`} tone="neutral" /> : null}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-surface-border pt-3">
        <button
          onClick={() => onView(application)}
          className="flex items-center gap-1.5 rounded-field px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-surface-page"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </button>
        <button
          onClick={() => onEdit(application)}
          className="flex items-center gap-1.5 rounded-field px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-surface-page"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        {application.isSystem ? (
          <span
            title="Platform-critical application — can't be disabled from the console."
            className="flex items-center gap-1.5 rounded-field px-2.5 py-1.5 text-xs font-semibold text-ink-400"
          >
            <Lock className="h-3.5 w-3.5" />
            Protected
          </span>
        ) : application.status === "active" ? (
          <button
            onClick={() => onDisable(application)}
            className="flex items-center gap-1.5 rounded-field px-2.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger-bg"
          >
            <Ban className="h-3.5 w-3.5" />
            Disable
          </button>
        ) : (
          <button
            onClick={() => onActivate(application)}
            className="flex items-center gap-1.5 rounded-field px-2.5 py-1.5 text-xs font-semibold text-success hover:bg-success-bg"
          >
            <Play className="h-3.5 w-3.5" />
            Activate
          </button>
        )}
      </div>
    </div>
  );
}
