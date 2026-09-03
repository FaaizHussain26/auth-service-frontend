"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, TestTube2, Trash2 } from "lucide-react";
import {
  useDeleteReleaseNote,
  useReleaseNote,
  useSendReleaseNote,
  useSendTestReleaseNote,
  useUpdateReleaseNote,
} from "@/hooks/admin/useReleaseNotes";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { QueryState } from "@/components/ui/QueryState";
import { useToast } from "@/components/ui/toast-context";
import { ReleaseNoteForm } from "@/components/admin/release-notes/ReleaseNoteForm";
import { RELEASE_NOTE_STATUS_BADGE } from "@/lib/admin/constants";
import { formatDateTime } from "@/lib/utils";

export default function ReleaseNoteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { notify } = useToast();
  const query = useReleaseNote(params.id);
  const note = query.data?.data;

  const updateReleaseNote = useUpdateReleaseNote(params.id);
  const deleteReleaseNote = useDeleteReleaseNote();
  const sendTest = useSendTestReleaseNote(params.id);
  const sendNow = useSendReleaseNote(params.id);

  const badge = note ? (RELEASE_NOTE_STATUS_BADGE[note.status] ?? { label: note.status, tone: "neutral" as const }) : null;
  const isDraft = note?.status === "draft";

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/admin/release-notes")}
        className="flex items-center gap-1.5 text-sm font-medium text-ink-700 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to release notes
      </button>

      <QueryState isLoading={query.isLoading} isError={query.isError} error={query.error} onRetry={() => query.refetch()}>
        {note && badge ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-semibold text-ink-900">{note.subject}</h1>
                <Badge label={badge.label} tone={badge.tone} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  className="h-9 px-3 text-xs"
                  loading={sendTest.isPending}
                  onClick={() =>
                    sendTest.mutate(undefined, {
                      onSuccess: (res) => notify("success", `Test email sent to ${res.data.sentTo}.`),
                      onError: (error: Error) => notify("error", error.message),
                    })
                  }
                >
                  <TestTube2 className="h-3.5 w-3.5" />
                  Send test
                </Button>
                {isDraft ? (
                  <Button
                    className="h-9 px-3 text-xs"
                    loading={sendNow.isPending}
                    onClick={() =>
                      sendNow.mutate(undefined, {
                        onSuccess: () => notify("success", "Release note queued for sending."),
                        onError: (error: Error) => notify("error", error.message),
                      })
                    }
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send now
                  </Button>
                ) : null}
                <Button
                  variant="danger"
                  className="h-9 px-3 text-xs"
                  loading={deleteReleaseNote.isPending}
                  onClick={() =>
                    deleteReleaseNote.mutate(note.id, {
                      onSuccess: () => {
                        notify("success", "Release note deleted.");
                        router.push("/admin/release-notes");
                      },
                      onError: (error: Error) => notify("error", error.message),
                    })
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>

            {!isDraft ? (
              <Card className="grid grid-cols-1 gap-4 p-5 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Recipients</p>
                  <p className="mt-1 text-ink-900">{note.recipientCount}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Delivered / Failed</p>
                  <p className="mt-1 text-ink-900">
                    {note.deliveredCount} / {note.failedCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Sent at</p>
                  <p className="mt-1 text-ink-900">{note.sentAt ? formatDateTime(note.sentAt) : "—"}</p>
                </div>
              </Card>
            ) : null}

            {isDraft ? (
              <Card className="p-5">
                <ReleaseNoteForm
                  key={note.id}
                  defaultValues={{ applicationId: note.applicationId, subject: note.subject, contentHtml: note.contentHtml }}
                  submitLabel="Save changes"
                  submitting={updateReleaseNote.isPending}
                  onSubmit={(values) =>
                    updateReleaseNote.mutate(values, {
                      onSuccess: () => notify("success", "Release note updated."),
                      onError: (error: Error) => notify("error", error.message),
                    })
                  }
                />
              </Card>
            ) : (
              <Card className="space-y-1.5 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{note.application?.name ?? "Application"}</p>
                <div className="prose prose-sm max-w-none text-ink-700" dangerouslySetInnerHTML={{ __html: note.contentHtml }} />
              </Card>
            )}
          </div>
        ) : null}
      </QueryState>
    </div>
  );
}
