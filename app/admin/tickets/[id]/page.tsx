"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTicket, useUpdateTicketStatus } from "@/hooks/admin/useTickets";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Field";
import { QueryState } from "@/components/ui/QueryState";
import { useToast } from "@/components/ui/toast-context";
import { TicketCommentThread } from "@/components/admin/tickets/TicketCommentThread";
import { TICKET_STATUS_BADGE } from "@/lib/admin/constants";
import { formatDateTime, fullName } from "@/lib/utils";
import type { TicketStatus } from "@/lib/admin/types";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function AdminTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { notify } = useToast();
  const query = useTicket(params.id);
  const updateStatus = useUpdateTicketStatus(params.id);
  const ticket = query.data?.data;
  const badge = ticket ? (TICKET_STATUS_BADGE[ticket.status] ?? { label: ticket.status, tone: "neutral" as const }) : null;

  const onStatusChange = (status: TicketStatus) => {
    updateStatus.mutate(status, {
      onSuccess: () => notify("success", "Ticket status updated."),
      onError: (error: Error) => notify("error", error.message),
    });
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/admin/tickets")}
        className="flex items-center gap-1.5 text-sm font-medium text-ink-700 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tickets
      </button>

      <QueryState isLoading={query.isLoading} isError={query.isError} error={query.error} onRetry={() => query.refetch()}>
        {ticket && badge ? (
          <div className="space-y-6">
            <Card className="space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-lg font-semibold text-ink-900">{ticket.subject}</h1>
                  <p className="text-xs text-ink-500">
                    {ticket.tenant?.name ?? "Unknown tenant"} · {ticket.application?.name ?? "Unknown application"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge label={badge.label} tone={badge.tone} />
                  <Select
                    aria-label="Update status"
                    className="h-9 w-40"
                    value={ticket.status}
                    disabled={updateStatus.isPending}
                    options={STATUS_OPTIONS}
                    onChange={(event) => onStatusChange(event.target.value as TicketStatus)}
                  />
                </div>
              </div>
              <p className="text-xs text-ink-500">
                Opened by {fullName(ticket.createdByUser?.firstName, ticket.createdByUser?.lastName) || ticket.createdByUser?.email} on{" "}
                {formatDateTime(ticket.createdAt)}
              </p>
              <p className="whitespace-pre-wrap text-sm text-ink-700">{ticket.description}</p>
            </Card>

            <Card className="p-5">
              <TicketCommentThread ticketId={ticket.id} />
            </Card>
          </div>
        ) : null}
      </QueryState>
    </div>
  );
}
