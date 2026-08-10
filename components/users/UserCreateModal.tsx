"use client";

import { Modal } from "@/components/ui/Modal";
import { UserForm } from "./UserForm";
import { useCreateUser } from "@/hooks/useUsers";
import { useToast } from "@/components/ui/toast-context";
import { fullName } from "@/lib/utils";

export function UserCreateModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (temporaryPassword: string) => void;
}) {
  const { notify } = useToast();
  const createUser = useCreateUser();

  return (
    <Modal open={open} onClose={onClose} title="Add user">
      <p className="mb-5 text-sm text-ink-500">Create a new account on this platform.</p>
      <UserForm
        submitting={createUser.isPending}
        onSubmit={(values) =>
          createUser.mutate(values, {
            onSuccess: (created) => {
              notify("success", `${fullName(created.data.user.firstName, created.data.user.lastName) || created.data.user.email} was created.`);
              onCreated(created.data.temporaryPassword);
            },
            onError: (error: Error) => notify("error", error.message),
          })
        }
      />
    </Modal>
  );
}
