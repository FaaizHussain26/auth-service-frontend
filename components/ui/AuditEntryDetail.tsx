interface AuditEntryDetailProps {
  entry: {
    actorId: string | null;
    actorEmail: string | null;
    actorName: string | null;
    tenantId: string | null;
    targetType: string | null;
    targetId: string | null;
    targetEmail: string | null;
    targetName: string | null;
    ip: string | null;
    userAgent: string | null;
    method: string | null;
    path: string | null;
    data: Record<string, unknown> | null;
  };
  /** Omit on the tenant zone's audit page — every row there is already scoped to one tenant. */
  showTenant?: boolean;
}

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <span className="w-20 shrink-0 text-ink-500">{label}</span>
      <span className="min-w-0 break-all font-mono text-ink-900">{value}</span>
    </div>
  );
}

function identityLabel(id: string | null, email: string | null, name: string | null, typeLabel?: string | null): string | null {
  if (!id) return null;
  const prefix = typeLabel ? `${typeLabel} ` : "";
  const display = name || email;
  return display ? `${prefix}${display} (${id})` : `${prefix}${id}`;
}

/** Short who/what label for a collapsed audit-log row — resolved identity when known, else the raw type. */
export function auditIdentitySummary(email: string | null, name: string | null, typeLabel: string | null): string {
  return name || email || typeLabel || "?";
}

/** The "who/where/how" detail behind a collapsed audit-log row. */
export function AuditEntryDetail({ entry, showTenant }: AuditEntryDetailProps) {
  const hasData = Boolean(entry.data && Object.keys(entry.data).length > 0);
  const request = [entry.method, entry.path].filter(Boolean).join(" ") || null;
  const hasAnyDetail =
    entry.actorId || (showTenant && entry.tenantId) || entry.targetId || entry.ip || request || entry.userAgent || hasData;

  return (
    <div className="space-y-2 border-t border-surface-border bg-surface-page px-4 py-3 text-xs">
      {!hasAnyDetail ? (
        <p className="text-ink-500">
          No additional detail recorded for this event — it happened before request tracking was added.
        </p>
      ) : (
        <>
          <Row label="Actor" value={identityLabel(entry.actorId, entry.actorEmail, entry.actorName)} />
          {showTenant ? <Row label="Tenant" value={entry.tenantId} /> : null}
          <Row label="Target" value={identityLabel(entry.targetId, entry.targetEmail, entry.targetName, entry.targetType ?? "?")} />
          <Row label="IP" value={entry.ip} />
          <Row label="Request" value={request} />
          <Row label="Client" value={entry.userAgent} />
          {hasData ? (
            <div className="flex gap-2">
              <span className="w-20 shrink-0 text-ink-500">Data</span>
              <pre className="min-w-0 flex-1 overflow-x-auto rounded-field bg-white p-2 font-mono text-ink-900">
                {JSON.stringify(entry.data, null, 2)}
              </pre>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
