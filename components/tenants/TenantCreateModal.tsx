"use client";

import { Modal } from "@/components/ui/Modal";
import { TenantCreateForm } from "./TenantCreateForm";
import { useCreateTenant } from "@/hooks/useTenants";
import { useToast } from "@/components/ui/toast-context";

export function TenantCreateModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (temporaryPassword: string) => void;
}) {
  const { notify } = useToast();
  const createTenant = useCreateTenant();

  return (
    <Modal open={open} onClose={onClose} width="max-w-2xl" title="Provision a new tenant">
      <p className="mb-5 text-sm text-ink-500">This creates the tenant, its database, and a first admin user.</p>
      <div className="max-h-[65vh] overflow-y-auto pr-1">
        <TenantCreateForm
          submitting={createTenant.isPending}
          onSubmit={(values) =>
            createTenant.mutate(values, {
              onSuccess: (created) => {
                notify("success", `${created.data.tenant.name} was provisioned.`);
                onCreated(created.data.temporaryPassword);
              },
              onError: (error: Error) => notify("error", error.message),
            })
          }
        />
      </div>
    </Modal>
  );
}
