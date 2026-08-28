"use client";

import { Modal } from "@/components/ui/Modal";
import { CreateTicketForm } from "./CreateTicketForm";
import { useCreateTicket } from "@/hooks/tenant/useTickets";
import { useToast } from "@/components/ui/toast-context";
import type { CreateTicketInput } from "@/lib/tenant/types";

export function CreateTicketModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notify } = useToast();
  const createTicket = useCreateTicket();

  const onSubmit = (values: CreateTicketInput) => {
    createTicket.mutate(values, {
      onSuccess: () => {
        notify("success", "Your ticket has been submitted.");
        onClose();
      },
      onError: (error: Error) => notify("error", error.message),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="New support ticket" width="max-w-lg">
      <CreateTicketForm submitting={createTicket.isPending} onSubmit={onSubmit} />
    </Modal>
  );
}
