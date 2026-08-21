"use client";

import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { InviteMemberForm } from "./InviteMemberForm";
import { useInviteTenantMember, useTenant } from "@/hooks/admin/useTenants";
import { useToast } from "@/components/ui/toast-context";
import type { Tenant } from "@/lib/admin/types";

export function TenantInviteModal({ tenant, onClose }: { tenant: Tenant | null; onClose: () => void }) {
  const { notify } = useToast();
  const detail = useTenant(tenant?.id);
  const inviteMember = useInviteTenantMember(tenant?.id ?? "");

  const applicationOptions = (detail.data?.data.applications ?? [])
    .filter((application) => !application.hiddenFromPicker)
    .map((application) => ({
      value: application.id,
      label: application.name,
    }));

  return (
    <Modal open={Boolean(tenant)} onClose={onClose} title={tenant ? `Invite to ${tenant.name}` : "Invite member"}>
      {detail.isLoading ? <Spinner /> : null}
      {detail.isError ? <ErrorState message={detail.error.message} onRetry={() => detail.refetch()} /> : null}

      {!detail.isLoading && !detail.isError ? (
        <InviteMemberForm
          tenantId={tenant?.id ?? ""}
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
      ) : null}
    </Modal>
  );
}
