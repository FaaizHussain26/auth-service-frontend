"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { ReleaseNoteForm } from "./ReleaseNoteForm";
import { useCreateReleaseNote } from "@/hooks/admin/useReleaseNotes";
import { useToast } from "@/components/ui/toast-context";

export function ReleaseNoteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { notify } = useToast();
  const createReleaseNote = useCreateReleaseNote();

  return (
    <Modal open={open} onClose={onClose} width="max-w-3xl" title="New release note">
      <p className="mb-5 text-sm text-ink-500">
        Saved as a draft first — you can preview and send a test before sending it to everyone.
      </p>
      <ReleaseNoteForm
        submitLabel="Save draft"
        submitting={createReleaseNote.isPending}
        onSubmit={(values) =>
          createReleaseNote.mutate(values, {
            onSuccess: (created) => {
              notify("success", "Release note draft created.");
              onClose();
              router.push(`/admin/release-notes/${created.data.id}`);
            },
            onError: (error: Error) => notify("error", error.message),
          })
        }
      />
    </Modal>
  );
}
