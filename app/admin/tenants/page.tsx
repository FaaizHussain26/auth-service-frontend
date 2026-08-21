"use client";

import { useState } from "react";
import { Building2, Plus } from "lucide-react";
import { useActivateTenant, useSuspendTenant, useTenants } from "@/hooks/admin/useTenants";
import { useAllApplications } from "@/hooks/admin/useApplications";
import { useDebouncedValue } from "@/hooks/shared/useDebouncedValue";
import { Combobox } from "@/components/ui/Combobox";
import { Button } from "@/components/ui/Button";
import { QueryState } from "@/components/ui/QueryState";
import { Pagination } from "@/components/ui/Pagination";
import { FilterField, FilterToolbar } from "@/components/ui/FilterToolbar";
import { Modal } from "@/components/ui/Modal";
import { SecretModal } from "@/components/ui/SecretModal";
import { useToast } from "@/components/ui/toast-context";
import { TenantCard } from "@/components/admin/tenants/TenantCard";
import { TenantCreateModal } from "@/components/admin/tenants/TenantCreateModal";
import { TenantViewModal } from "@/components/admin/tenants/TenantViewModal";
import { TenantEditModal } from "@/components/admin/tenants/TenantEditModal";
import { TenantInviteModal } from "@/components/admin/tenants/TenantInviteModal";
import { TENANT_KIND_OPTIONS, TENANT_STATUS_OPTIONS } from "@/lib/admin/constants";
import type { Tenant } from "@/lib/admin/types";

export default function TenantsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [kind, setKind] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewingTenantId, setViewingTenantId] = useState<string | null>(null);
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const [invitingTenant, setInvitingTenant] = useState<Tenant | null>(null);
  const [pendingSuspend, setPendingSuspend] = useState<Tenant | null>(null);
  const [provisionResult, setProvisionResult] = useState<{ temporaryPassword: string | null; emailSent: boolean; domains: string[] } | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const { notify } = useToast();

  const applications = useAllApplications();
  const applicationOptions = (applications.data?.data ?? []).map((app) => ({ value: app.id, label: app.name }));

  const query = useTenants({
    search: debouncedSearch || undefined,
    status: status || undefined,
    kind: kind || undefined,
    applicationId: applicationId || undefined,
    page,
    limit,
  });
  const suspendTenant = useSuspendTenant();
  const activateTenant = useActivateTenant();

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setKind("");
    setApplicationId("");
    setPage(1);
  };

  const confirmSuspend = () => {
    if (!pendingSuspend) return;
    suspendTenant.mutate(pendingSuspend.id, {
      onSuccess: () => {
        notify("success", `${pendingSuspend.name} has been suspended.`);
        setPendingSuspend(null);
      },
      onError: (error: Error) => notify("error", error.message),
    });
  };

  const activateSelected = (tenant: Tenant) => {
    activateTenant.mutate(tenant.id, {
      onSuccess: () => notify("success", `${tenant.name} has been activated.`),
      onError: (error: Error) => notify("error", error.message),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">Provision and manage tenant organizations on this platform.</p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New tenant
        </Button>
      </div>

      <FilterToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search by name or slug…"
        totalLabel={query.data?.meta ? `${query.data.meta.total} total tenants` : undefined}
        open={filtersOpen}
        onToggleOpen={() => setFiltersOpen((current) => !current)}
        title="Tenant Filters"
        onReset={resetFilters}
      >
        <FilterField label="Status">
          <Combobox
            value={status}
            onValueChange={(next) => {
              setStatus(next);
              setPage(1);
            }}
            options={TENANT_STATUS_OPTIONS}
            placeholder="Select status"
          />
        </FilterField>
        <FilterField label="Kind">
          <Combobox
            value={kind}
            onValueChange={(next) => {
              setKind(next);
              setPage(1);
            }}
            options={TENANT_KIND_OPTIONS}
            placeholder="Select kind"
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
        emptyIcon={Building2}
        emptyTitle="No tenants yet"
        emptyDescription="Provision your first tenant organization to onboard a customer."
        emptyAction={<Button variant="secondary" onClick={() => setCreateOpen(true)}>Create tenant</Button>}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(query.data?.data ?? []).map((tenant) => (
            <TenantCard
              key={tenant.id}
              tenant={tenant}
              onView={(selected) => setViewingTenantId(selected.id)}
              onEdit={(selected) => setEditingTenantId(selected.id)}
              onSuspend={setPendingSuspend}
              onActivate={activateSelected}
              onInvite={setInvitingTenant}
            />
          ))}
        </div>
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

      <TenantCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(result) => {
          setCreateOpen(false);
          setProvisionResult(result);
        }}
      />

      <TenantViewModal key={`view-${viewingTenantId ?? "none"}`} tenantId={viewingTenantId} onClose={() => setViewingTenantId(null)} />

      <TenantEditModal key={`edit-${editingTenantId ?? "none"}`} tenantId={editingTenantId} onClose={() => setEditingTenantId(null)} />

      <TenantInviteModal tenant={invitingTenant} onClose={() => setInvitingTenant(null)} />

      <SecretModal
        open={Boolean(provisionResult)}
        title="Tenant provisioned"
        description={
          provisionResult?.emailSent
            ? "The first admin user's temporary password was emailed to them directly — it is not shown here."
            : "We couldn't email the welcome message, so here's the temporary password to share with the admin yourself. It will not be shown again."
        }
        items={
          provisionResult
            ? [
                ...provisionResult.domains.map((domain, index) => ({
                  label: provisionResult.domains.length > 1 ? `Tenant URL ${index + 1}` : "Tenant URL",
                  value: domain,
                })),
                ...(provisionResult.temporaryPassword
                  ? [{ label: "Temporary password", value: provisionResult.temporaryPassword }]
                  : []),
              ]
            : []
        }
        onDone={() => setProvisionResult(null)}
      />

      <Modal open={Boolean(pendingSuspend)} onClose={() => setPendingSuspend(null)} title="Suspend tenant">
        <p className="text-sm text-ink-700">
          {pendingSuspend?.name} and its members will lose access until reactivated.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPendingSuspend(null)}>
            Cancel
          </Button>
          <Button variant="danger" loading={suspendTenant.isPending} onClick={confirmSuspend}>
            Suspend
          </Button>
        </div>
      </Modal>
    </div>
  );
}
