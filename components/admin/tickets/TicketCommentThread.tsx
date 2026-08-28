"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast-context";
import { useAddTicketComment, useTicketComments } from "@/hooks/admin/useTickets";
import { formatDateTime, fullName } from "@/lib/utils";
import type { TicketComment } from "@/lib/admin/types";

const AUTHOR_LABEL: Record<TicketComment["authorType"], string> = {
  tenant_user: "Tenant",
  admin: "You",
};

export function TicketCommentThread({ ticketId }: { ticketId: string }) {
  const [body, setBody] = useState("");
  const { notify } = useToast();
  const comments = useTicketComments(ticketId);
  const addComment = useAddTicketComment(ticketId);

  const submit = () => {
    if (!body.trim()) return;
    addComment.mutate(body, {
      onSuccess: () => setBody(""),
      onError: (error: Error) => notify("error", error.message),
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-ink-900">Conversation</h3>

      <div className="space-y-4">
        {(comments.data?.data ?? []).map((comment) => {
          const isSelf = comment.authorType === "admin";
          return (
            <div key={comment.id} className={`flex gap-3 ${isSelf ? "flex-row-reverse" : ""}`}>
              <Avatar seed={comment.authorUser?.email ?? comment.authorUserId} size={32} />
              <div
                className={`min-w-0 max-w-[75%] rounded-2xl p-3.5 ${
                  isSelf
                    ? "rounded-tr-sm bg-brand-600 text-white"
                    : "rounded-tl-sm border border-surface-border bg-white text-ink-700"
                }`}
              >
                <div className={`mb-1 flex items-center gap-2 text-xs ${isSelf ? "flex-row-reverse" : ""}`}>
                  <span className={`font-semibold ${isSelf ? "text-white" : "text-ink-900"}`}>
                    {isSelf
                      ? AUTHOR_LABEL[comment.authorType]
                      : fullName(comment.authorUser?.firstName, comment.authorUser?.lastName) || comment.authorUser?.email}
                  </span>
                  <span className={isSelf ? "text-white/70" : "text-ink-500"}>{formatDateTime(comment.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm">{comment.body}</p>
              </div>
            </div>
          );
        })}
        {comments.data?.data.length === 0 ? <p className="text-sm text-ink-500">No replies yet.</p> : null}
      </div>

      <div className="flex gap-2 border-t border-surface-border pt-4">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write a reply…"
          className="h-20"
        />
        <Button onClick={submit} loading={addComment.isPending} className="self-end">
          <Send className="h-4 w-4" />
          Send
        </Button>
      </div>
    </div>
  );
}
