"use client";

import { useState } from "react";
import { Building2, KeyRound, Monitor, ShieldBan } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Pagination } from "@/components/ui/Pagination";
import { useDisableUser, useForcePasswordReset, useRevokeUserSession, useUser, useUserSessions } from "@/hooks/useUsers";
import { useToast } from "@/components/ui/toast-context";
import { USER_STATUS_BADGE } from "@/lib/constants";
import { formatDateTime, fullName } from "@/lib/utils";

export function UserDetailModal({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const { notify } = useToast();
  const user = useUser(userId ?? undefined);
  const [sessionsPage, setSessionsPage] = useState(1);
  const sessions = useUserSessions(userId ?? undefined, { limit: 10, page: sessionsPage, sortBy: "createdAt", sortOrder: "DESC" });
  const disable = useDisableUser();
  const forceReset = useForcePasswordReset();
  const revokeSession = useRevokeUserSession(userId ?? "");
  const [confirmDisable, setConfirmDisable] = useState(false);

  const badge = user.data ? USER_STATUS_BADGE[user.data.data.status] ?? { label: user.data.data.status, tone: "neutral" as const } : null;

  return (
    <Modal open={Boolean(userId)} onClose={onClose} width="max-w-xl" title={user.data ? fullName(user.data.data.firstName, user.data.data.lastName) : "User"}>
      {user.isLoading ? <Spinner /> : null}
      {user.isError ? <ErrorState message={user.error.message} onRetry={() => user.refetch()} /> : null}

      {user.data ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar seed={user.data.data.email} size={48} />
              <p className="truncate text-sm text-ink-500">{user.data.data.email}</p>
            </div>
            {badge ? <Badge label={badge.label} tone={badge.tone} /> : null}
          </div>

          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <Detail label="Phone number" value={user.data.data.phoneNumber ?? "—"} />
            <Detail label="Superadmin" value={user.data.data.isSuperadmin ? "Yes" : "No"} />
            <Detail label="Last login" value={formatDateTime(user.data.data.lastLoginAt)} />
            <Detail label="Created" value={formatDateTime(user.data.data.createdAt)} />
          </dl>

          <div className="border-t border-surface-border pt-5">
            <h3 className="mb-3 text-sm font-semibold text-ink-900">Tenant access</h3>
            {user.data.data.memberships.length === 0 ? (
              <p className="text-sm text-ink-500">This user does not belong to any tenant.</p>
            ) : (
              <ul className="space-y-3">
                {user.data.data.memberships.map((membership) => {
                  const tenantBadge = USER_STATUS_BADGE[membership.tenant.status] ?? {
                    label: membership.tenant.status,
                    tone: "neutral" as const,
                  };
                  return (
                    <li key={membership.id} className="rounded-2xl border border-surface-border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <Building2 className="h-4 w-4 shrink-0 text-ink-500" />
                          <p className="truncate text-sm font-semibold text-ink-900">{membership.tenant.name}</p>
                          <Badge label={membership.role} tone="neutral" />
                        </div>
                        <Badge label={tenantBadge.label} tone={tenantBadge.tone} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {membership.applications.length === 0 ? (
                          <p className="text-xs text-ink-500">No application access granted.</p>
                        ) : (
                          membership.applications.map((application) => (
                            <Badge key={application.id} label={application.name} tone="brand" />
                          ))
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex gap-2 border-t border-surface-border pt-5">
            {user.data.data.status === "active" ? (
              <Button variant="danger" onClick={() => setConfirmDisable(true)}>
                <ShieldBan className="h-4 w-4" />
                Disable user
              </Button>
            ) : null}
            <Button
              variant="secondary"
              loading={forceReset.isPending}
              onClick={() =>
                forceReset.mutate(userId as string, {
                  onSuccess: () => notify("success", "Password reset forced. The user must set a new password to sign in again."),
                  onError: (error: Error) => notify("error", error.message),
                })
              }
            >
              <KeyRound className="h-4 w-4" />
              Force password reset
            </Button>
          </div>

          <div className="border-t border-surface-border pt-5">
            <h3 className="mb-3 text-sm font-semibold text-ink-900">Active sessions</h3>
            {sessions.isLoading ? <Spinner /> : null}
            {!sessions.isLoading && !(sessions.data?.data ?? []).length ? (
              <p className="py-4 text-center text-sm text-ink-500">No sessions recorded.</p>
            ) : null}
            {!sessions.isLoading && (sessions.data?.data ?? []).length ? (
              <ul className="divide-y divide-surface-border">
                {(sessions.data?.data ?? []).map((session) => (
                  <li key={session.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <div className="flex items-center gap-2.5">
                      <Monitor className="h-4 w-4 text-ink-500" />
                      <div>
                        <p className="font-medium text-ink-900">Expires {formatDateTime(session.expiresAt)}</p>
                        <p className="text-xs text-ink-500">Created {formatDateTime(session.createdAt)}</p>
                      </div>
                    </div>
                    {session.revokedAt ? (
                      <Badge label="Revoked" tone="neutral" />
                    ) : (
                      <button
                        onClick={() =>
                          revokeSession.mutate(session.id, {
                            onSuccess: () => notify("success", "Session revoked."),
                            onError: (error: Error) => notify("error", error.message),
                          })
                        }
                        className="text-xs font-semibold text-danger hover:underline"
                      >
                        Revoke
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}

            <Pagination meta={sessions.data?.meta} onPageChange={setSessionsPage} />
          </div>
        </div>
      ) : null}

      <Modal open={confirmDisable} onClose={() => setConfirmDisable(false)} title="Disable user">
        <p className="text-sm text-ink-700">This user will immediately lose the ability to sign in.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDisable(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={disable.isPending}
            onClick={() =>
              disable.mutate(userId as string, {
                onSuccess: () => {
                  notify("success", "User disabled.");
                  setConfirmDisable(false);
                },
                onError: (error: Error) => notify("error", error.message),
              })
            }
          >
            Disable
          </Button>
        </div>
      </Modal>
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
