"use client";

import { Modal } from "@/components/ui/Modal";
import { ApplicationForm } from "./ApplicationForm";
import { useApplication, useCreateApplication, useUpdateApplication } from "@/hooks/admin/useApplications";
import { useToast } from "@/components/ui/toast-context";
import type { Application, CreateApplicationResult } from "@/lib/admin/types";

export function ApplicationModal({
  open,
  application: initialApplication,
  onClose,
  onCreated,
}: {
  open: boolean;
  application: Application | null;
  onClose: () => void;
  onCreated: (result: CreateApplicationResult) => void;
}) {
  const { notify } = useToast();
  const createApplication = useCreateApplication();
  const freshApplication = useApplication(initialApplication?.id);
  const application = freshApplication.data?.data ?? initialApplication;
  const updateApplication = useUpdateApplication(application?.id ?? "");

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-2xl"
      title={application ? `Edit ${application.name}` : "Register a new application"}
    >
      {!application ? (
        <p className="mb-5 text-sm text-ink-500">Applications are OIDC clients that can request sign-in through Syncora.</p>
      ) : null}

      <ApplicationForm
        key={application?.id ?? "new"}
        existingClientId={application?.clientId}
        submitLabel={application ? "Save changes" : "Create application"}
        submitting={application ? updateApplication.isPending : createApplication.isPending}
        locked={application?.isSystem}
        defaultValues={
          application
            ? {
                name: application.name,
                clientType: application.clientType,
                redirectUris: application.redirectUris.length ? application.redirectUris : [""],
                postLogoutRedirectUris: application.postLogoutRedirectUris.length ? application.postLogoutRedirectUris : [""],
                grantTypes: application.grantTypes,
                scopes: application.scopes,
                resourceIndicator: application.resourceIndicator ?? "",
                webhookUrl: application.webhookUrl ?? "",
                baseDomain: application.baseDomain ?? "",
                logoUrl: application.logoUrl ?? "",
                rolesEndpointPath: application.rolesEndpointPath ?? "",
              }
            : undefined
        }
        onSubmit={(values) =>
          application
            ? updateApplication.mutate(values, {
                onSuccess: () => {
                  notify("success", "Application updated.");
                  onClose();
                },
                onError: (error: Error) => notify("error", error.message),
              })
            : createApplication.mutate(values, {
                onSuccess: (created) => {
                  notify("success", `${created.data.application.name} was created.`);
                  onCreated(created.data);
                },
                onError: (error: Error) => notify("error", error.message),
              })
        }
      />
    </Modal>
  );
}
