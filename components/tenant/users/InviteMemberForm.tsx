"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, Input } from "@/components/ui/Field";
import { ApplicationRolePicker } from "./ApplicationRolePicker";
import { Button } from "@/components/ui/Button";
import type { InviteMemberInput } from "@/lib/tenant/types";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
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
  applicationOptions,
  submitting,
  onSubmit,
}: {
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
    defaultValues: { email: "", applications: [] },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Email address" htmlFor="invite-email" error={errors.email?.message}>
        <Input id="invite-email" type="email" placeholder="teammate@acme.com" {...register("email")} />
      </Field>
      {applicationOptions.length ? (
        <Field
          label="Application access"
          hint="Only applications your organization already has access to. Pick a role for each app you grant."
          error={errors.applications ? "Choose a role for every selected application" : undefined}
        >
          <Controller
            control={control}
            name="applications"
            render={({ field }) => (
              <ApplicationRolePicker options={applicationOptions} values={field.value} onChange={field.onChange} placeholder="Search applications…" />
            )}
          />
        </Field>
      ) : (
        <p className="rounded-field bg-surface-page px-4 py-3 text-xs text-ink-700">
          Your organization doesn&apos;t have access to any applications yet, so the invited member won&apos;t either.
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
