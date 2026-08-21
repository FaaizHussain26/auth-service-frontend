"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, Input } from "@/components/ui/Field";
import { Combobox } from "@/components/ui/Combobox";
import { ApplicationRolePicker } from "./ApplicationRolePicker";
import { Button } from "@/components/ui/Button";
import { MEMBERSHIP_ROLE_OPTIONS } from "@/lib/admin/constants";
import type { InviteMemberInput } from "@/lib/admin/types";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["admin", "member"]),
  applications: z.array(
    z.object({
      applicationId: z.string(),
      roleId: z.string().min(1, "Choose a role"),
      roleName: z.string().optional(),
    }),
  ),
});

type FormValues = z.infer<typeof schema>;

export function InviteMemberForm({
  tenantId,
  applicationOptions,
  submitting,
  onSubmit,
}: {
  tenantId: string;
  applicationOptions: Array<{ value: string; label: string }>;
  submitting: boolean;
  onSubmit: (values: InviteMemberInput) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", role: "member", applications: [] },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Email address" htmlFor="invite-email" error={errors.email?.message}>
        <Input id="invite-email" type="email" placeholder="teammate@acme.com" {...register("email")} />
      </Field>
      <Field label="Role" htmlFor="invite-role">
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Combobox value={field.value} onValueChange={field.onChange} options={MEMBERSHIP_ROLE_OPTIONS} placeholder="Select role" />
          )}
        />
      </Field>
      {applicationOptions.length ? (
        <Field
          label="Application access"
          hint="Only applications this tenant already has access to. Pick a role for each app you grant."
          error={errors.applications ? "Choose a role for every selected application" : undefined}
        >
          <Controller
            control={control}
            name="applications"
            render={({ field }) => (
              <ApplicationRolePicker tenantId={tenantId} options={applicationOptions} values={field.value} onChange={field.onChange} placeholder="Search applications…" />
            )}
          />
        </Field>
      ) : (
        <p className="rounded-field bg-surface-page px-4 py-3 text-xs text-ink-700">
          This tenant doesn&apos;t have access to any applications yet, so the invited member won&apos;t either.
        </p>
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={submitting}>
          Send invitation
        </Button>
      </div>
    </form>
  );
}
