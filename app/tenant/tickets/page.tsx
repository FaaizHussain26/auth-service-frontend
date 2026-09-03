"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LifeBuoy, Plus } from "lucide-react";
import { useTickets } from "@/hooks/tenant/useTickets";
import { useMyApplications } from "@/hooks/tenant/useMyApplications";
import { useDebouncedValue } from "@/hooks/shared/useDebouncedValue";
import { Combobox } from "@/components/ui/Combobox";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { QueryState } from "@/components/ui/QueryState";
import { Pagination } from "@/components/ui/Pagination";
import { FilterField, FilterToolbar } from "@/components/ui/FilterToolbar";
import { CreateTicketModal } from "@/components/tenant/tickets/CreateTicketModal";
import { TICKET_STATUS_BADGE } from "@/lib/tenant/constants";
import { formatDate } from "@/lib/utils";

export default function TicketsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const myApplications = useMyApplications();
  const applicationOptions = (myApplications.data?.applications ?? []).map((app) => ({ value: app.id, label: app.name }));

  const query = useTickets({
    search: debouncedSearch || undefined,
    applicationId: applicationId || undefined,
    from: from ? new Date(from).toISOString() : undefined,
    to: to ? new Date(to).toISOString() : undefined,
    page,
    limit,
  });

  const applyFilter = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setApplicationId("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">Raise an issue or question for the Syncora team.</p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New ticket
        </Button>
      </div>

      <FilterToolbar
        search={search}
        onSearchChange={applyFilter(setSearch)}
        searchPlaceholder="Search tickets by subject…"
        totalLabel={query.data?.meta ? `${query.data.meta.total} total tickets` : undefined}
        open={filtersOpen}
        onToggleOpen={() => setFiltersOpen((current) => !current)}
        title="Ticket Filters"
        onReset={resetFilters}
      >
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
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        isEmpty={(query.data?.data ?? []).length === 0}
        emptyIcon={LifeBuoy}
        emptyTitle="No tickets yet"
        emptyDescription="Raise a ticket if you run into an issue or have a question."
        emptyAction={<Button variant="secondary" onClick={() => setCreateOpen(true)}>New ticket</Button>}
      >
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-surface-border text-xs font-semibold uppercase tracking-wide text-ink-500">
                <th className="px-5 py-3.5">Subject</th>
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
                    onClick={() => router.push(`/tenant/tickets/${ticket.id}`)}
                    className="cursor-pointer hover:bg-surface-page"
                  >
                    <td className="px-5 py-3.5 font-medium text-ink-900">{ticket.subject}</td>
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

      <CreateTicketModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
