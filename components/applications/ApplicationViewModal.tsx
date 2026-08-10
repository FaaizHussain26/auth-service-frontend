"use client";

import { KeyRound, Play } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useActivateApplication, useApplication, useRotateApplicationSecret } from "@/hooks/useApplications";
import { useToast } from "@/components/ui/toast-context";
import { USER_STATUS_BADGE } from "@/lib/constants";

export function ApplicationViewModal({ applicationId, onClose }: { applicationId: string | null; onClose: () => void }) {
  const { notify } = useToast();
  const application = useApplication(applicationId ?? undefined);
  const rotateSecret = useRotateApplicationSecret();
  const activateApplication = useActivateApplication();

  const app = application.data?.data;
  const badge = app ? USER_STATUS_BADGE[app.status] ?? { label: app.status, tone: "neutral" as const } : null;

  return (
    <Modal open={Boolean(applicationId)} onClose={onClose} width="max-w-xl" title={app ? app.name : "Application"}>
      {application.isLoading ? <Spinner /> : null}
      {application.isError ? <ErrorState message={application.error.message} onRetry={() => application.refetch()} /> : null}

      {app ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-ink-500">{app.clientId}</p>
            <div className="flex flex-wrap items-center gap-2">
              {badge ? <Badge label={badge.label} tone={badge.tone} /> : null}
              {app.status === "disabled" ? (
                <Button
                  variant="secondary"
                  className="h-9 px-3 text-xs"
                  loading={activateApplication.isPending}
                  onClick={() =>
                    activateApplication.mutate(app.id, {
                      onSuccess: () => notify("success", `${app.name} has been activated.`),
                      onError: (error: Error) => notify("error", error.message),
                    })
                  }
                >
                  <Play className="h-3.5 w-3.5" />
                  Activate
                </Button>
              ) : null}
              {app.clientType === "confidential" ? (
                <Button
                  variant="secondary"
                  className="h-9 px-3 text-xs"
                  loading={rotateSecret.isPending}
                  onClick={() =>
                    rotateSecret.mutate(app.id, {
                      onSuccess: (res) => notify("success", `New secret: ${res.data.clientSecret}`),
                      onError: (error: Error) => notify("error", error.message),
                    })
                  }
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Rotate secret
                </Button>
              ) : null}
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <Detail label="Client type" value={app.clientType} />
            <Detail label="Resource indicator" value={app.resourceIndicator || "—"} />
            <Detail label="Webhook URL" value={app.webhookUrl || "—"} />
          </dl>

          <ListDetail label="Grant types" values={app.grantTypes} />
          <ListDetail label="Scopes" values={app.scopes} />
          <ListDetail label="Redirect URIs" values={app.redirectUris} />
          <ListDetail label="Post-logout redirect URIs" values={app.postLogoutRedirectUris} />
        </div>
      ) : null}
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-1 truncate text-ink-900">{value}</dd>
    </div>
  );
}

function ListDetail({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <dt className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</dt>
      {values.length ? (
        <div className="flex flex-wrap gap-1.5">
          {values.map((value) => (
            <Badge key={value} label={value} tone="neutral" />
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-500">—</p>
      )}
    </div>
  );
}
