"use client";

import { useState } from "react";
import { ScrollText } from "lucide-react";
import { useAuditLog } from "@/hooks/admin/useAudit";
import { useAllTenants } from "@/hooks/admin/useTenants";
import { useAllApplications } from "@/hooks/admin/useApplications";
import { useAllUsers } from "@/hooks/admin/useUsers";
import { Combobox } from "@/components/ui/Combobox";
import { Input } from "@/components/ui/Field";
import { FilterField, FilterToolbar } from "@/components/ui/FilterToolbar";
import { QueryState } from "@/components/ui/QueryState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDateTime, fullName } from "@/lib/utils";
import type { AuditLogEntry } from "@/lib/admin/types";

export default function AuditPage() {
  const [eventFilter, setEventFilter] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [userId, setUserId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);

  const tenants = useAllTenants();
  const tenantOptions = (tenants.data?.data ?? []).map((tenant) => ({ value: tenant.id, label: tenant.name }));
  const applications = useAllApplications();
  const applicationOptions = (applications.data?.data ?? []).map((app) => ({ value: app.id, label: app.name }));
  const users = useAllUsers();
  const userOptions = (users.data?.data ?? []).map((user) => ({
    value: user.id,
    label: `${fullName(user.firstName, user.lastName)} (${user.email})`,
  }));

  const query = useAuditLog({
    event: eventFilter || undefined,
    tenantId: tenantId || undefined,
    userId: userId || undefined,
    applicationId: applicationId || undefined,
    from: from ? new Date(from).toISOString() : undefined,
    to: to ? new Date(to).toISOString() : undefined,
    cursor,
  });
  const page = query.data?.data ?? [];
  const allEntries = cursor ? [...entries, ...page] : page;
  const lastId = page.at(-1)?.id;

  const loadMore = () => {
    if (!lastId) return;
    setEntries(allEntries);
    setCursor(lastId);
  };

  const applyFilter = (setter: (value: string) => void) => (value: string) => {
    setEntries([]);
    setCursor(undefined);
    setter(value);
  };

  const resetFilters = () => {
    setEntries([]);
    setCursor(undefined);
    setEventFilter("");
    setTenantId("");
    setUserId("");
    setApplicationId("");
    setFrom("");
    setTo("");
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-500">Platform-wide audit trail of administrative actions.</p>

      <FilterToolbar
        search={eventFilter}
        onSearchChange={applyFilter(setEventFilter)}
        searchPlaceholder="Filter by event, e.g. tenant.created…"
        open={filtersOpen}
        onToggleOpen={() => setFiltersOpen((current) => !current)}
        title="Audit Filters"
        onReset={resetFilters}
      >
        <FilterField label="Tenant">
          <Combobox value={tenantId} onValueChange={applyFilter(setTenantId)} options={tenantOptions} placeholder="Select tenant" />
        </FilterField>
        <FilterField label="User">
          <Combobox value={userId} onValueChange={applyFilter(setUserId)} options={userOptions} placeholder="Select user" />
        </FilterField>
        <FilterField label="Application">
          <Combobox
            value={applicationId}
            onValueChange={applyFilter(setApplicationId)}
            options={applicationOptions}
            placeholder="Select application"
          />
        </FilterField>
        <FilterField label="From">
          <Input type="datetime-local" value={from} onChange={(event) => applyFilter(setFrom)(event.target.value)} />
        </FilterField>
        <FilterField label="To">
          <Input type="datetime-local" value={to} onChange={(event) => applyFilter(setTo)(event.target.value)} />
        </FilterField>
      </FilterToolbar>

      <QueryState
        isLoading={query.isLoading && !cursor}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        isEmpty={allEntries.length === 0}
        emptyIcon={ScrollText}
        emptyTitle="No audit events"
        emptyDescription="Administrative actions will appear here as they happen."
      >
        <Card className="divide-y divide-surface-border">
          {allEntries.map((entry, index) => (
            <div key={entry.id ?? index} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink-900">{entry.event}</p>
                <p className="truncate text-xs text-ink-500">
                  {entry.actorType}
                  {entry.targetType ? ` → ${entry.targetType}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-xs text-ink-500">{formatDateTime(entry.occurredAt)}</span>
            </div>
          ))}
        </Card>
      </QueryState>

      {lastId ? (
        <div className="flex justify-center">
          <Button variant="secondary" loading={query.isFetching} onClick={loadMore}>
            Load more
          </Button>
        </div>
      ) : null}
    </div>
  );
}
