"use client";

import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { TenantUpdateForm } from "./TenantUpdateForm";
import { useTenant, useUpdateTenant } from "@/hooks/admin/useTenants";
import { useToast } from "@/components/ui/toast-context";

export function TenantEditModal({ tenantId, onClose }: { tenantId: string | null; onClose: () => void }) {
  const { notify } = useToast();
  const tenant = useTenant(tenantId ?? undefined);
  const updateTenant = useUpdateTenant(tenantId ?? "");

  return (
    <Modal open={Boolean(tenantId)} onClose={onClose} width="max-w-xl" title={tenant.data ? `Edit ${tenant.data.data.name}` : "Edit tenant"}>
      {tenant.isLoading ? <Spinner /> : null}
      {tenant.isError ? <ErrorState message={tenant.error.message} onRetry={() => tenant.refetch()} /> : null}

      {tenant.data ? (
        <TenantUpdateForm
          tenant={tenant.data.data}
          submitting={updateTenant.isPending}
          onSubmit={(values) =>
            updateTenant.mutate(values, {
              onSuccess: () => {
                notify("success", "Tenant updated.");
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
