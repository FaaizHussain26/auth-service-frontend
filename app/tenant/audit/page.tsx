"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, ScrollText } from "lucide-react";
import { useTenantAuditLog } from "@/hooks/tenant/useTenantAudit";
import { useTenantUsers } from "@/hooks/tenant/useTenantUsers";
import { Combobox } from "@/components/ui/Combobox";
import { Input } from "@/components/ui/Field";
import { FilterField, FilterToolbar } from "@/components/ui/FilterToolbar";
import { QueryState } from "@/components/ui/QueryState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AuditEntryDetail, auditIdentitySummary } from "@/components/ui/AuditEntryDetail";
import { formatDateTime, fullName } from "@/lib/utils";
import type { AuditLogEntry } from "@/lib/tenant/types";

export default function AuditPage() {
  const [eventFilter, setEventFilter] = useState("");
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const users = useTenantUsers({ all: true });
  const userOptions = (users.data?.data ?? []).map((membership) => ({
    value: membership.user.id,
    label: `${fullName(membership.user.firstName, membership.user.lastName)} (${membership.user.email})`,
  }));

  const query = useTenantAuditLog({
    event: eventFilter || undefined,
    userId: userId || undefined,
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
    setUserId("");
    setFrom("");
    setTo("");
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-500">Audit trail for this organization and its members.</p>

      <FilterToolbar
        search={eventFilter}
        onSearchChange={applyFilter(setEventFilter)}
        searchPlaceholder="Filter by event, e.g. user.suspended…"
        open={filtersOpen}
        onToggleOpen={() => setFiltersOpen((current) => !current)}
        title="Audit Filters"
        onReset={resetFilters}
      >
        <FilterField label="User">
          <Combobox value={userId} onValueChange={applyFilter(setUserId)} options={userOptions} placeholder="Select user" />
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
        emptyDescription="Activity in your organization will appear here as it happens."
      >
        <Card className="divide-y divide-surface-border">
          {allEntries.map((entry, index) => {
            const rowId = entry.id ?? index;
            const isExpanded = expandedId === rowId;
            return (
              <div key={rowId}>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : rowId)}
                  className="flex w-full flex-wrap items-center justify-between gap-2 p-4 text-left text-sm hover:bg-surface-page"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-500" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-500" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink-900">{entry.event}</p>
                      <p className="truncate text-xs text-ink-500">
                        {auditIdentitySummary(entry.actorEmail, entry.actorName, entry.actorType)}
                        {entry.targetType ? ` → ${auditIdentitySummary(entry.targetEmail, entry.targetName, entry.targetType)}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-ink-500">{formatDateTime(entry.occurredAt)}</span>
                </button>
                {isExpanded ? <AuditEntryDetail entry={entry} /> : null}
              </div>
            );
          })}
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
