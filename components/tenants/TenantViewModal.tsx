"use client";

import { Boxes, Users } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { Badge } from "@/components/ui/Badge";
import { useTenant } from "@/hooks/useTenants";
import { USER_STATUS_BADGE } from "@/lib/constants";

export function TenantViewModal({ tenantId, onClose }: { tenantId: string | null; onClose: () => void }) {
  const tenant = useTenant(tenantId ?? undefined);

  const badge = tenant.data ? USER_STATUS_BADGE[tenant.data.data.status] ?? { label: tenant.data.data.status, tone: "neutral" as const } : null;

  return (
    <Modal open={Boolean(tenantId)} onClose={onClose} width="max-w-xl" title={tenant.data ? tenant.data.data.name : "Tenant"}>
      {tenant.isLoading ? <Spinner /> : null}
      {tenant.isError ? <ErrorState message={tenant.error.message} onRetry={() => tenant.refetch()} /> : null}

      {tenant.data ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-ink-500">/{tenant.data.data.slug}</p>
            {badge ? <Badge label={badge.label} tone={badge.tone} /> : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-surface-page p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-600">
                <Boxes className="h-4 w-4" />
              </div>
              <div>
                <p className="text-lg font-semibold text-ink-900">{tenant.data.data.totalApplications}</p>
                <p className="text-xs text-ink-500">Total Applications</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-surface-page p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-600">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-lg font-semibold text-ink-900">{tenant.data.data.totalUsers}</p>
                <p className="text-xs text-ink-500">Total Users</p>
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <Detail label="Kind" value={tenant.data.data.kind} />
            <Detail label="Contact email" value={tenant.data.data.contactEmail ?? "—"} />
            <Detail label="Phone number" value={tenant.data.data.phoneNumber ?? "—"} />
            <Detail label="Website" value={tenant.data.data.website ?? "—"} />
            <Detail label="Address" value={tenant.data.data.address ?? "—"} />
          </dl>

          <div>
            <dt className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">Applications</dt>
            {tenant.data.data.applications.length ? (
              <div className="flex flex-wrap gap-1.5">
                {tenant.data.data.applications.map((application) => (
                  <Badge key={application.id} label={application.name} tone="brand" />
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500">No applications granted.</p>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-1 text-ink-900">{value}</dd>
    </div>
  );
}
