"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Field, Input } from "@/components/ui/Field";
import { MultiSelectChips } from "@/components/ui/MultiSelectChips";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/toast-context";
import {
  useGrantTenantUserApplication,
  useRevokeTenantUserApplication,
  useTenantApplications,
  useTenantUserDetail,
  useUpdateTenantUser,
} from "@/hooks/tenant/useTenantUsers";
import { USER_STATUS_BADGE } from "@/lib/tenant/constants";
import { fullName } from "@/lib/utils";
import type { Membership } from "@/lib/tenant/types";

const schema = z.object({
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function MemberEditModal({ membership, onClose }: { membership: Membership | null; onClose: () => void }) {
  const { notify } = useToast();
  const userId = membership?.user.id ?? "";
  const updateUser = useUpdateTenantUser(userId);
  const detail = useTenantUserDetail(membership?.user.id);
  const tenantApplications = useTenantApplications();
  const grantApplication = useGrantTenantUserApplication(userId);
  const revokeApplication = useRevokeTenantUserApplication(userId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!membership) return;
    reset({
      firstName: membership.user.firstName ?? "",
      middleName: membership.user.middleName ?? "",
      lastName: membership.user.lastName ?? "",
      phoneNumber: membership.user.phoneNumber ?? "",
    });
  }, [membership, reset]);

  if (!membership) return null;
  const badge = USER_STATUS_BADGE[membership.user.status] ?? { label: membership.user.status, tone: "neutral" as const };

  const applicationOptions = (tenantApplications.data?.data ?? [])
    .filter((app) => !app.hiddenFromPicker)
    .map((app) => ({ value: app.id, label: app.name }));
  const grantedIds = (detail.data?.data.applications ?? []).map((app) => app.id);

  const handleApplicationsChange = (nextIds: string[]) => {
    const added = nextIds.filter((id) => !grantedIds.includes(id));
    const removed = grantedIds.filter((id) => !nextIds.includes(id));
    added.forEach((applicationId) =>
      grantApplication.mutate(applicationId, {
        onError: (error: Error) => notify("error", error.message),
      }),
    );
    removed.forEach((applicationId) =>
      revokeApplication.mutate(applicationId, {
        onError: (error: Error) => notify("error", error.message),
      }),
    );
  };

  return (
    <Modal open={Boolean(membership)} onClose={onClose} width="max-w-lg" title={fullName(membership.user.firstName, membership.user.lastName)}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-ink-500">{membership.user.email}</p>
          <Badge label={badge.label} tone={badge.tone} />
        </div>

        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) =>
            updateUser.mutate(values, {
              onSuccess: () => notify("success", "Profile updated."),
              onError: (error: Error) => notify("error", error.message),
            }),
          )}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First name" htmlFor="firstName" error={errors.firstName?.message}>
              <Input id="firstName" {...register("firstName")} />
            </Field>
            <Field label="Last name" htmlFor="lastName" error={errors.lastName?.message}>
              <Input id="lastName" {...register("lastName")} />
            </Field>
          </div>
          <Field label="Phone number" htmlFor="phoneNumber" error={errors.phoneNumber?.message}>
            <Input id="phoneNumber" {...register("phoneNumber")} />
          </Field>
          <div className="flex justify-end">
            <Button type="submit" loading={updateUser.isPending}>
              Save profile
            </Button>
          </div>
        </form>

        <div className="border-t border-surface-border pt-5">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-700">Applications</p>
          {detail.isLoading || tenantApplications.isLoading ? (
            <Spinner />
          ) : (
            <MultiSelectChips
              options={applicationOptions}
              values={grantedIds}
              onChange={handleApplicationsChange}
              placeholder="Search applications…"
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
