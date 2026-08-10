"use client";

import { KeyRound, RefreshCcw, ShieldCheck, ShieldOff } from "lucide-react";
import { useSigningKeys, usePromoteKey, useRetireKey, useRotateKey } from "@/hooks/useKeys";
import { useToast } from "@/components/ui/toast-context";
import { QueryState } from "@/components/ui/QueryState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { KEY_STATUS_BADGE } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export default function KeysPage() {
  const { notify } = useToast();
  const keys = useSigningKeys();
  const rotate = useRotateKey();
  const promote = usePromoteKey();
  const retire = useRetireKey();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">Signing keys used to issue and verify access and ID tokens.</p>
        <Button
          loading={rotate.isPending}
          onClick={() =>
            rotate.mutate(undefined, {
              onSuccess: () => notify("success", "A new signing key was generated with status \"next\"."),
              onError: (error: Error) => notify("error", error.message),
            })
          }
        >
          <RefreshCcw className="h-4 w-4" />
          Rotate key
        </Button>
      </div>

      <QueryState
        isLoading={keys.isLoading}
        isError={keys.isError}
        error={keys.error}
        onRetry={() => keys.refetch()}
        isEmpty={(keys.data?.data ?? []).length === 0}
        emptyIcon={KeyRound}
        emptyTitle="No signing keys"
        emptyDescription="Rotate to generate the first signing key for this identity provider."
      >
        <Card className="divide-y divide-surface-border">
          {(keys.data?.data ?? []).map((key) => {
            const badge = KEY_STATUS_BADGE[key.status] ?? { label: key.status, tone: "neutral" as const };
            return (
              <div key={key.kid} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm text-ink-900">{key.kid}</p>
                    <p className="truncate text-xs text-ink-500">
                      {key.alg} · created {formatDateTime(key.createdAt)}
                      {key.retiredAt ? ` · retired ${formatDateTime(key.retiredAt)}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge label={badge.label} tone={badge.tone} />
                  {key.status === "next" ? (
                    <Button
                      variant="secondary"
                      className="h-9 px-3 text-xs"
                      loading={promote.isPending}
                      onClick={() =>
                        promote.mutate(key.kid, {
                          onSuccess: () => notify("success", `${key.kid} is now the current signing key.`),
                          onError: (error: Error) => notify("error", error.message),
                        })
                      }
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Promote
                    </Button>
                  ) : null}
                  {key.status === "next" ? (
                    <Button
                      variant="danger"
                      className="h-9 px-3 text-xs"
                      loading={retire.isPending}
                      onClick={() =>
                        retire.mutate(key.kid, {
                          onSuccess: () => notify("success", `${key.kid} has been retired.`),
                          onError: (error: Error) => notify("error", error.message),
                        })
                      }
                    >
                      <ShieldOff className="h-3.5 w-3.5" />
                      Retire
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </Card>
      </QueryState>
    </div>
  );
}
