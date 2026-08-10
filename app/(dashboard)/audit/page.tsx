"use client";

import { useState } from "react";
import { ScrollText } from "lucide-react";
import { useAuditLog } from "@/hooks/useAudit";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { SearchInput } from "@/components/ui/SearchInput";
import { QueryState } from "@/components/ui/QueryState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";
import type { AuditLogEntry } from "@/lib/types";

export default function AuditPage() {
  const [eventFilter, setEventFilter] = useState("");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const debouncedEvent = useDebouncedValue(eventFilter);

  const query = useAuditLog({ event: debouncedEvent || undefined, cursor });
  const page = query.data?.data ?? [];
  const allEntries = cursor ? [...entries, ...page] : page;
  const lastId = page.at(-1)?.id;

  const loadMore = () => {
    if (!lastId) return;
    setEntries(allEntries);
    setCursor(lastId);
  };

  const resetFilter = (value: string) => {
    setEntries([]);
    setCursor(undefined);
    setEventFilter(value);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-500">Platform-wide audit trail of administrative actions.</p>

      <SearchInput value={eventFilter} onChange={resetFilter} placeholder="Filter by event, e.g. tenant.created…" />

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
