"use client";

import { useState } from "react";
import { Boxes, Plus } from "lucide-react";
import { useActivateApplication, useApplications, useDisableApplication } from "@/hooks/admin/useApplications";
import { useDebouncedValue } from "@/hooks/shared/useDebouncedValue";
import { useToast } from "@/components/ui/toast-context";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { QueryState } from "@/components/ui/QueryState";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { SecretModal } from "@/components/ui/SecretModal";
import { ApplicationCard } from "@/components/admin/applications/ApplicationCard";
import { ApplicationModal } from "@/components/admin/applications/ApplicationModal";
import { ApplicationViewModal } from "@/components/admin/applications/ApplicationViewModal";
import type { Application, CreateApplicationResult } from "@/lib/admin/types";

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pendingDisable, setPendingDisable] = useState<Application | null>(null);
  const [viewingApplicationId, setViewingApplicationId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [createdSecret, setCreatedSecret] = useState<CreateApplicationResult | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const { notify } = useToast();

  const query = useApplications({ search: debouncedSearch || undefined, page, limit });
  const disable = useDisableApplication();
  const activate = useActivateApplication();

  const openCreate = () => {
    setEditingApplication(null);
    setFormOpen(true);
  };

  const openEdit = (application: Application) => {
    setEditingApplication(application);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingApplication(null);
  };

  const confirmDisable = () => {
    if (!pendingDisable) return;
    disable.mutate(pendingDisable.id, {
      onSuccess: () => {
        notify("success", `${pendingDisable.name} has been disabled.`);
        setPendingDisable(null);
      },
      onError: (error: Error) => notify("error", error.message),
    });
  };

  const activateApplication = (application: Application) => {
    activate.mutate(application.id, {
      onSuccess: () => notify("success", `${application.name} has been activated.`),
      onError: (error: Error) => notify("error", error.message),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">Manage the OIDC clients registered against this identity provider.</p>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New application
        </Button>
      </div>

      <div className="flex gap-3">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by name or client ID…"
        />
      </div>

      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        isEmpty={(query.data?.data ?? []).length === 0}
        emptyIcon={Boxes}
        emptyTitle="No applications yet"
        emptyDescription="Register your first OIDC client to let an application sign users in through Syncora."
        emptyAction={<Button variant="secondary" onClick={openCreate}>Create application</Button>}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(query.data?.data ?? []).map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onView={(selected) => setViewingApplicationId(selected.id)}
              onEdit={openEdit}
              onDisable={setPendingDisable}
              onActivate={activateApplication}
            />
          ))}
        </div>
      </QueryState>

      <Pagination
        meta={query.data?.meta}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={(next) => {
          setLimit(next);
          setPage(1);
        }}
      />

      <ApplicationModal
        open={formOpen}
        application={editingApplication}
        onClose={closeForm}
        onCreated={(result) => {
          closeForm();
          setCreatedSecret(result);
        }}
      />

      <ApplicationViewModal
        key={viewingApplicationId ?? "none"}
        applicationId={viewingApplicationId}
        onClose={() => setViewingApplicationId(null)}
      />

      <SecretModal
        open={Boolean(createdSecret)}
        title="Application created"
        description="Store these values now — the client secret is only shown once and cannot be retrieved again."
        items={[
          ...(createdSecret?.clientSecret ? [{ label: "Client secret", value: createdSecret.clientSecret }] : []),
          ...(createdSecret?.webhookSecret ? [{ label: "Webhook secret", value: createdSecret.webhookSecret }] : []),
        ]}
        onDone={() => setCreatedSecret(null)}
      />

      <Modal open={Boolean(pendingDisable)} onClose={() => setPendingDisable(null)} title="Disable application">
        <p className="text-sm text-ink-700">
          {pendingDisable?.name} will no longer be able to complete sign-in. Existing tokens already issued keep working until they expire.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPendingDisable(null)}>
            Cancel
          </Button>
          <Button variant="danger" loading={disable.isPending} onClick={confirmDisable}>
            Disable
          </Button>
        </div>
      </Modal>
    </div>
  );
}
