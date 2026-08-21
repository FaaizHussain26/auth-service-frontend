"use client";

import { useState } from "react";
import { Plus, Users as UsersIcon } from "lucide-react";
import { useUsers, useDisableUser, useEnableUser } from "@/hooks/admin/useUsers";
import { useAllTenants } from "@/hooks/admin/useTenants";
import { useAllApplications } from "@/hooks/admin/useApplications";
import { useDebouncedValue } from "@/hooks/shared/useDebouncedValue";
import { useToast } from "@/components/ui/toast-context";
import { Combobox } from "@/components/ui/Combobox";
import { Button } from "@/components/ui/Button";
import { QueryState } from "@/components/ui/QueryState";
import { Pagination } from "@/components/ui/Pagination";
import { FilterField, FilterToolbar } from "@/components/ui/FilterToolbar";
import { Modal } from "@/components/ui/Modal";
import { SecretModal } from "@/components/ui/SecretModal";
import { UserTable } from "@/components/admin/users/UserTable";
import { UserCreateModal } from "@/components/admin/users/UserCreateModal";
import { UserDetailModal } from "@/components/admin/users/UserDetailModal";
import { USER_STATUS_OPTIONS } from "@/lib/admin/constants";
import { fullName } from "@/lib/utils";
import type { User } from "@/lib/admin/types";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pendingDisable, setPendingDisable] = useState<User | null>(null);
  const [pendingEnable, setPendingEnable] = useState<User | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const { notify } = useToast();

  const tenants = useAllTenants();
  const tenantOptions = (tenants.data?.data ?? []).map((tenant) => ({ value: tenant.id, label: tenant.name }));
  const applications = useAllApplications();
  const applicationOptions = (applications.data?.data ?? []).map((app) => ({ value: app.id, label: app.name }));

  const query = useUsers({
    search: debouncedSearch || undefined,
    status: status || undefined,
    tenantId: tenantId || undefined,
    applicationId: applicationId || undefined,
    page,
    limit,
  });
  const disable = useDisableUser();
  const enable = useEnableUser();

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setTenantId("");
    setApplicationId("");
    setPage(1);
  };

  const confirmDisable = () => {
    if (!pendingDisable) return;
    disable.mutate(pendingDisable.id, {
      onSuccess: () => {
        notify("success", `${fullName(pendingDisable.firstName, pendingDisable.lastName)} has been disabled.`);
        setPendingDisable(null);
      },
      onError: (error: Error) => notify("error", error.message),
    });
  };

  const confirmEnable = () => {
    if (!pendingEnable) return;
    enable.mutate(pendingEnable.id, {
      onSuccess: () => {
        notify("success", `${fullName(pendingEnable.firstName, pendingEnable.lastName)} has been enabled.`);
        setPendingEnable(null);
      },
      onError: (error: Error) => notify("error", error.message),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-ink-900">Manage Users</h2>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add user
        </Button>
      </div>

      <FilterToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search users by name or email…"
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
        <FilterField label="Tenant">
          <Combobox
            value={tenantId}
            onValueChange={(next) => {
              setTenantId(next);
              setPage(1);
            }}
            options={tenantOptions}
            placeholder="Select tenant"
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
        isEmpty={(query.data?.data ?? []).length === 0}
        emptyIcon={UsersIcon}
        emptyTitle="No users yet"
        emptyDescription="Create the first user account for this platform."
        emptyAction={<Button variant="secondary" onClick={() => setCreateOpen(true)}>Add user</Button>}
      >
        <UserTable
          users={query.data?.data ?? []}
          onView={(selected) => setViewingUserId(selected.id)}
          onDisable={setPendingDisable}
          onEnable={setPendingEnable}
        />
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

      <UserCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(password) => {
          setCreateOpen(false);
          setTemporaryPassword(password);
        }}
      />

      <UserDetailModal key={viewingUserId ?? "none"} userId={viewingUserId} onClose={() => setViewingUserId(null)} />

      <SecretModal
        open={Boolean(temporaryPassword)}
        title="User created"
        description="Share this temporary password securely — it will not be shown again."
        items={temporaryPassword ? [{ label: "Temporary password", value: temporaryPassword }] : []}
        onDone={() => setTemporaryPassword(null)}
      />

      <Modal open={Boolean(pendingDisable)} onClose={() => setPendingDisable(null)} title="Disable user">
        <p className="text-sm text-ink-700">
          {pendingDisable ? fullName(pendingDisable.firstName, pendingDisable.lastName) : ""} will no longer be able to sign in.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPendingDisable(null)}>
            Cancel
          </Button>
          <Button variant="danger" loading={disable.isPending} onClick={confirmDisable}>
            Disable
          </Button>
        </div>
      </Modal>

      <Modal open={Boolean(pendingEnable)} onClose={() => setPendingEnable(null)} title="Enable user">
        <p className="text-sm text-ink-700">
          {pendingEnable ? fullName(pendingEnable.firstName, pendingEnable.lastName) : ""} will be able to sign in again.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPendingEnable(null)}>
            Cancel
          </Button>
          <Button loading={enable.isPending} onClick={confirmEnable}>
            Enable
          </Button>
        </div>
      </Modal>
    </div>
  );
}
