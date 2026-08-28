"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTicket } from "@/hooks/tenant/useTickets";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QueryState } from "@/components/ui/QueryState";
import { TicketCommentThread } from "@/components/tenant/tickets/TicketCommentThread";
import { TICKET_STATUS_BADGE } from "@/lib/tenant/constants";
import { formatDateTime, fullName } from "@/lib/utils";

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const query = useTicket(params.id);
  const ticket = query.data?.data;
  const badge = ticket ? (TICKET_STATUS_BADGE[ticket.status] ?? { label: ticket.status, tone: "neutral" as const }) : null;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/tenant/tickets")}
        className="flex items-center gap-1.5 text-sm font-medium text-ink-700 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tickets
      </button>

      <QueryState isLoading={query.isLoading} isError={query.isError} error={query.error} onRetry={() => query.refetch()}>
        {ticket && badge ? (
          <div className="space-y-6">
            <Card className="space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h1 className="text-lg font-semibold text-ink-900">{ticket.subject}</h1>
                  <p className="text-xs text-ink-500">{ticket.application?.name ?? "Unknown application"}</p>
                </div>
                <Badge label={badge.label} tone={badge.tone} />
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
