"use client";

import { useState } from "react";
import { KeyRound, Monitor } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Pagination } from "@/components/ui/Pagination";
import {
  useForceTenantUserPasswordReset,
  useRevokeTenantUserSession,
  useTenantUserDetail,
  useTenantUserSessions,
} from "@/hooks/tenant/useTenantUsers";
import { useToast } from "@/components/ui/toast-context";
import { USER_STATUS_BADGE } from "@/lib/tenant/constants";
import { formatDateTime, fullName } from "@/lib/utils";

export function MemberDetailModal({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const { notify } = useToast();
  const user = useTenantUserDetail(userId ?? undefined);
  const [sessionsPage, setSessionsPage] = useState(1);
  const sessions = useTenantUserSessions(userId ?? undefined, { limit: 10, page: sessionsPage, sortBy: "createdAt", sortOrder: "DESC" });
  const forceReset = useForceTenantUserPasswordReset();
  const revokeSession = useRevokeTenantUserSession(userId ?? "");

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
            <Detail label="Role" value={user.data.data.membership.role} capitalize />
            <Detail label="Last login" value={formatDateTime(user.data.data.lastLoginAt)} />
            <Detail label="Created" value={formatDateTime(user.data.data.createdAt)} />
          </dl>

          <div className="border-t border-surface-border pt-5">
            <h3 className="mb-3 text-sm font-semibold text-ink-900">Applications</h3>
            {user.data.data.applications.length === 0 ? (
              <p className="text-sm text-ink-500">No application access granted.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {user.data.data.applications.map((application) => (
                  <Badge key={application.id} label={application.name} tone="brand" />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-surface-border pt-5">
            <Button
              variant="secondary"
              loading={forceReset.isPending}
              onClick={() =>
                forceReset.mutate(userId as string, {
                  onSuccess: () => notify("success", "Password reset enforced. They must set a new password to sign in again."),
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
    </Modal>
  );
}

function Detail({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className={`mt-1 text-ink-900${capitalize ? " capitalize" : ""}`}>{value}</dd>
    </div>
  );
}
