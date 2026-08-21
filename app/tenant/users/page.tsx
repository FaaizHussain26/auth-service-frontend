"use client";

import { useState } from "react";
import { Eye, Pencil, Play, Plus, ShieldBan, Users as UsersIcon } from "lucide-react";
import { useTenantUsers, useSuspendTenantUser, useActivateTenantUser, useTenantApplications } from "@/hooks/tenant/useTenantUsers";
import { useDebouncedValue } from "@/hooks/shared/useDebouncedValue";
import { useToast } from "@/components/ui/toast-context";
import { Combobox } from "@/components/ui/Combobox";
import { QueryState } from "@/components/ui/QueryState";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { FilterField, FilterToolbar } from "@/components/ui/FilterToolbar";
import { MemberEditModal } from "@/components/tenant/users/MemberEditModal";
import { MemberDetailModal } from "@/components/tenant/users/MemberDetailModal";
import { InviteMemberModal } from "@/components/tenant/users/InviteMemberModal";
import { USER_STATUS_BADGE, USER_STATUS_OPTIONS } from "@/lib/tenant/constants";
import { formatDate, fullName } from "@/lib/utils";
import type { Membership } from "@/lib/tenant/types";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editing, setEditing] = useState<Membership | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<Membership | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const { notify } = useToast();

  const tenantApplications = useTenantApplications();
  const applicationOptions = (tenantApplications.data?.data ?? [])
    .filter((app) => !app.hiddenFromPicker)
    .map((app) => ({ value: app.id, label: app.name }));

  const query = useTenantUsers({
    search: debouncedSearch || undefined,
    status: status || undefined,
    applicationId: applicationId || undefined,
    page,
    limit,
  });
  const members = query.data?.data ?? [];
  const suspend = useSuspendTenantUser();
  const activate = useActivateTenantUser();

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setApplicationId("");
    setPage(1);
  };

  const confirmToggle = () => {
    if (!pendingToggle) return;
    const name = fullName(pendingToggle.user.firstName, pendingToggle.user.lastName);
    if (pendingToggle.user.status === "active") {
      suspend.mutate(pendingToggle.user.id, {
        onSuccess: () => {
          notify("success", `${name} has been disabled.`);
          setPendingToggle(null);
        },
        onError: (error: Error) => notify("error", error.message),
      });
    } else {
      activate.mutate(pendingToggle.user.id, {
        onSuccess: () => {
          notify("success", `${name} has been enabled.`);
          setPendingToggle(null);
        },
        onError: (error: Error) => notify("error", error.message),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">Users who belong to your organization.</p>
        <Button onClick={() => setInviteOpen(true)}>
          <Plus className="h-4 w-4" />
          Invite user
        </Button>
      </div>

      <FilterToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search by name or email…"
        totalLabel={query.data?.meta ? `${query.data.meta.total} total users` : undefined}
        open={filtersOpen}
        onToggleOpen={() => setFiltersOpen((current) => !current)}
        title="User Filters"
        onReset={resetFilters}
      >
        <FilterField label="Status">
          <Combobox
            value={status}
            onValueChange={(next) => {
              setStatus(next);
              setPage(1);
            }}
            options={USER_STATUS_OPTIONS}
            placeholder="Select status"
          />
        </FilterField>
        <FilterField label="Application">
          <Combobox
            value={applicationId}
            onValueChange={(next) => {
              setApplicationId(next);
              setPage(1);
            }}
            options={applicationOptions}
            placeholder="Select application"
          />
        </FilterField>
      </FilterToolbar>

      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        isEmpty={members.length === 0}
        emptyIcon={UsersIcon}
        emptyTitle="No members yet"
        emptyDescription="Invite a member to get started."
        emptyAction={<Button variant="secondary" onClick={() => setInviteOpen(true)}>Invite user</Button>}
      >
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-surface-border text-xs font-semibold uppercase tracking-wide text-ink-500">
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Created</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {members.map((membership) => {
                const badge = USER_STATUS_BADGE[membership.user.status] ?? { label: membership.user.status, tone: "neutral" as const };
                return (
                  <tr key={membership.id} className="hover:bg-surface-page">
                    <td className="px-5 py-3.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar seed={membership.user.email} size={36} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink-900">{fullName(membership.user.firstName, membership.user.lastName)}</p>
                          <p className="truncate text-xs text-ink-500">{membership.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge label={badge.label} tone={badge.tone} />
                    </td>
                    <td className="px-5 py-3.5 text-ink-700">{formatDate(membership.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingUserId(membership.user.id)}
                          className="flex items-center gap-1.5 rounded-field px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-white"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => setEditing(membership)}
                          className="flex items-center gap-1.5 rounded-field px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        {membership.user.status === "active" ? (
                          <button
                            onClick={() => setPendingToggle(membership)}
                            className="flex items-center gap-1.5 rounded-field px-2.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger-bg"
                          >
                            <ShieldBan className="h-3.5 w-3.5" />
                            Disable
                          </button>
                        ) : (
                          <button
                            onClick={() => setPendingToggle(membership)}
                            className="flex items-center gap-1.5 rounded-field px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-white"
                          >
                            <Play className="h-3.5 w-3.5" />
                            Enable
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </QueryState>

      <Pagination
        meta={query.data?.meta}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={(next) => {
          setLimit(next);
          setPage(1);
        }}
      />

      <MemberEditModal membership={editing} onClose={() => setEditing(null)} />
      <MemberDetailModal userId={viewingUserId} onClose={() => setViewingUserId(null)} />
      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} />

      <Modal open={Boolean(pendingToggle)} onClose={() => setPendingToggle(null)} title={pendingToggle?.user.status === "active" ? "Disable user" : "Enable user"}>
        <p className="text-sm text-ink-700">
          {pendingToggle ? fullName(pendingToggle.user.firstName, pendingToggle.user.lastName) : ""}{" "}
          {pendingToggle?.user.status === "active"
            ? "will no longer be able to sign in."
            : "will be able to sign in again."}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPendingToggle(null)}>
            Cancel
          </Button>
          <Button
            variant={pendingToggle?.user.status === "active" ? "danger" : "primary"}
            loading={suspend.isPending || activate.isPending}
            onClick={confirmToggle}
          >
            {pendingToggle?.user.status === "active" ? "Disable" : "Enable"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
