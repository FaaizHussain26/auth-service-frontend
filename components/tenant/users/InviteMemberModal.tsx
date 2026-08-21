"use client";

import { Modal } from "@/components/ui/Modal";
import { InviteMemberForm } from "./InviteMemberForm";
import { useInviteTenantUser, useTenantApplications } from "@/hooks/tenant/useTenantUsers";
import { useToast } from "@/components/ui/toast-context";

export function InviteMemberModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notify } = useToast();
  const tenantApplications = useTenantApplications();
  const inviteMember = useInviteTenantUser();

  const applicationOptions = (tenantApplications.data?.data ?? [])
    .filter((app) => !app.hiddenFromPicker)
    .map((app) => ({ value: app.id, label: app.name }));

  return (
    <Modal open={open} onClose={onClose} title="Invite a member">
      <InviteMemberForm
        applicationOptions={applicationOptions}
        submitting={inviteMember.isPending}
        onSubmit={(values) =>
          inviteMember.mutate(values, {
            onSuccess: () => {
              notify("success", `Invitation sent to ${values.email}.`);
              onClose();
            },
            onError: (error: Error) => notify("error", error.message),
          })
        }
      />
    </Modal>
  );
}
