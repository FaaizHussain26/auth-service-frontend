import { Building2, Eye, Pencil, Play, ShieldBan, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { USER_STATUS_BADGE } from "@/lib/admin/constants";
import { formatDate } from "@/lib/utils";
import type { Tenant } from "@/lib/admin/types";

export function TenantCard({
  tenant,
  onView,
  onEdit,
  onSuspend,
  onActivate,
  onInvite,
}: {
  tenant: Tenant;
  onView: (tenant: Tenant) => void;
  onEdit: (tenant: Tenant) => void;
  onSuspend: (tenant: Tenant) => void;
  onActivate: (tenant: Tenant) => void;
  onInvite: (tenant: Tenant) => void;
}) {
  const badge = USER_STATUS_BADGE[tenant.status] ?? { label: tenant.status, tone: "neutral" as const };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-surface-border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">{tenant.name}</p>
            <p className="truncate text-xs text-ink-500">/{tenant.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {tenant.kind === "organization" ? (
            <button
              onClick={() => onInvite(tenant)}
              className="flex items-center gap-1 rounded-full border border-brand-600 px-2.5 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-100"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invite
            </button>
          ) : null}
          <Badge label={badge.label} tone={badge.tone} />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge label={tenant.kind} tone="neutral" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-surface-border pt-3">
        <span className="text-xs text-ink-500">Created {formatDate(tenant.createdAt)}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => onView(tenant)} className="flex items-center gap-1.5 rounded-field px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-surface-page">
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
          <button onClick={() => onEdit(tenant)} className="flex items-center gap-1.5 rounded-field px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-surface-page">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          {tenant.status === "active" ? (
            <button
              onClick={() => onSuspend(tenant)}
              className="flex items-center gap-1.5 rounded-field px-2.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger-bg"
            >
              <ShieldBan className="h-3.5 w-3.5" />
              Suspend
            </button>
          ) : null}
          {tenant.status === "suspended" ? (
            <button
              onClick={() => onActivate(tenant)}
              className="flex items-center gap-1.5 rounded-field px-2.5 py-1.5 text-xs font-semibold text-success hover:bg-success-bg"
            >
              <Play className="h-3.5 w-3.5" />
              Activate
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
