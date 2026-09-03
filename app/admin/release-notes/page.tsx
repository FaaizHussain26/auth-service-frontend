"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Plus } from "lucide-react";
import { useReleaseNotes } from "@/hooks/admin/useReleaseNotes";
import { useAllApplications } from "@/hooks/admin/useApplications";
import { useDebouncedValue } from "@/hooks/shared/useDebouncedValue";
import { Combobox } from "@/components/ui/Combobox";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { QueryState } from "@/components/ui/QueryState";
import { Pagination } from "@/components/ui/Pagination";
import { FilterField, FilterToolbar } from "@/components/ui/FilterToolbar";
import { ReleaseNoteModal } from "@/components/admin/release-notes/ReleaseNoteModal";
import { RELEASE_NOTE_STATUS_BADGE } from "@/lib/admin/constants";
import { formatDate } from "@/lib/utils";
import type { ReleaseNoteStatus } from "@/lib/admin/types";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "sending", label: "Sending" },
  { value: "sent", label: "Sent" },
];

export default function ReleaseNotesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const applications = useAllApplications();
  const applicationOptions = (applications.data?.data ?? [])
    .filter((app) => !app.isSystem)
    .map((app) => ({ value: app.id, label: app.name }));

  const query = useReleaseNotes({
    search: debouncedSearch || undefined,
    applicationId: applicationId || undefined,
    status: (status || undefined) as ReleaseNoteStatus | undefined,
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
    setStatus("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">Announce updates to the users of any integrated application.</p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New release note
        </Button>
      </div>

      <FilterToolbar
        search={search}
        onSearchChange={applyFilter(setSearch)}
        searchPlaceholder="Search release notes by subject…"
        totalLabel={query.data?.meta ? `${query.data.meta.total} total` : undefined}
        open={filtersOpen}
        onToggleOpen={() => setFiltersOpen((current) => !current)}
        title="Release Note Filters"
        onReset={resetFilters}
      >
        <FilterField label="Application">
          <Combobox value={applicationId} onValueChange={applyFilter(setApplicationId)} options={applicationOptions} placeholder="Select application" />
        </FilterField>
        <FilterField label="Status">
          <Combobox value={status} onValueChange={applyFilter(setStatus)} options={STATUS_OPTIONS} placeholder="Select status" />
        </FilterField>
      </FilterToolbar>

      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        isEmpty={(query.data?.data ?? []).length === 0}
        emptyIcon={Megaphone}
        emptyTitle="No release notes yet"
        emptyDescription="Announce a product update to the users of an application."
        emptyAction={<Button variant="secondary" onClick={() => setCreateOpen(true)}>New release note</Button>}
      >
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-surface-border text-xs font-semibold uppercase tracking-wide text-ink-500">
                <th className="px-5 py-3.5">Subject</th>
                <th className="px-5 py-3.5">Application</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Recipients</th>
                <th className="px-5 py-3.5">Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {(query.data?.data ?? []).map((note) => {
                const badge = RELEASE_NOTE_STATUS_BADGE[note.status] ?? { label: note.status, tone: "neutral" as const };
                return (
                  <tr
                    key={note.id}
                    onClick={() => router.push(`/admin/release-notes/${note.id}`)}
                    className="cursor-pointer hover:bg-surface-page"
                  >
                    <td className="px-5 py-3.5 font-medium text-ink-900">{note.subject}</td>
                    <td className="px-5 py-3.5 text-ink-700">{note.application?.name ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <Badge label={badge.label} tone={badge.tone} />
                    </td>
                    <td className="px-5 py-3.5 text-ink-700">
                      {note.status === "draft" ? "—" : `${note.deliveredCount}/${note.recipientCount}`}
                    </td>
                    <td className="px-5 py-3.5 text-ink-700">{note.sentAt ? formatDate(note.sentAt) : "—"}</td>
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

      <ReleaseNoteModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
