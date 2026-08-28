"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LifeBuoy } from "lucide-react";
import { useTickets } from "@/hooks/admin/useTickets";
import { useAllTenants } from "@/hooks/admin/useTenants";
import { useAllApplications } from "@/hooks/admin/useApplications";
import { useDebouncedValue } from "@/hooks/shared/useDebouncedValue";
import { Combobox } from "@/components/ui/Combobox";
import { Input } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { QueryState } from "@/components/ui/QueryState";
import { Pagination } from "@/components/ui/Pagination";
import { FilterField, FilterToolbar } from "@/components/ui/FilterToolbar";
import { TICKET_STATUS_BADGE } from "@/lib/admin/constants";
import { formatDate } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function AdminTicketsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const tenants = useAllTenants();
  const tenantOptions = (tenants.data?.data ?? []).map((tenant) => ({ value: tenant.id, label: tenant.name }));
  const applications = useAllApplications();
  const applicationOptions = (applications.data?.data ?? []).map((app) => ({ value: app.id, label: app.name }));

  const query = useTickets({
    search: debouncedSearch || undefined,
    status: status || undefined,
    tenantId: tenantId || undefined,
    applicationId: applicationId || undefined,
    from: from ? new Date(from).toISOString() : undefined,
    to: to ? new Date(to).toISOString() : undefined,
    page,
    limit,
  });

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setTenantId("");
    setApplicationId("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-500">Support tickets raised by tenant users, across every tenant.</p>

      <FilterToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search tickets by subject…"
        totalLabel={query.data?.meta ? `${query.data.meta.total} total tickets` : undefined}
        open={filtersOpen}
        onToggleOpen={() => setFiltersOpen((current) => !current)}
        title="Ticket Filters"
        onReset={resetFilters}
      >
        <FilterField label="Status">
          <Combobox
            value={status}
            onValueChange={(next) => {
              setStatus(next);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
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
        <FilterField label="From">
          <Input
            type="datetime-local"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
            }}
          />
        </FilterField>
        <FilterField label="To">
          <Input
            type="datetime-local"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
          />
        </FilterField>
      </FilterToolbar>

      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        isEmpty={(query.data?.data ?? []).length === 0}
        emptyIcon={LifeBuoy}
        emptyTitle="No tickets yet"
        emptyDescription="Tickets raised by tenant users will show up here."
      >
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-surface-border text-xs font-semibold uppercase tracking-wide text-ink-500">
                <th className="px-5 py-3.5">Subject</th>
                <th className="px-5 py-3.5">Tenant</th>
                <th className="px-5 py-3.5">Application</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {(query.data?.data ?? []).map((ticket) => {
                const badge = TICKET_STATUS_BADGE[ticket.status] ?? { label: ticket.status, tone: "neutral" as const };
                return (
                  <tr
                    key={ticket.id}
                    onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                    className="cursor-pointer hover:bg-surface-page"
                  >
                    <td className="px-5 py-3.5 font-medium text-ink-900">{ticket.subject}</td>
                    <td className="px-5 py-3.5 text-ink-700">{ticket.tenant?.name ?? "—"}</td>
                    <td className="px-5 py-3.5 text-ink-700">{ticket.application?.name ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <Badge label={badge.label} tone={badge.tone} />
                    </td>
                    <td className="px-5 py-3.5 text-ink-700">{formatDate(ticket.createdAt)}</td>
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
    </div>
  );
}
