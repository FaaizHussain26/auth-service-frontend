"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, Input, Select } from "@/components/ui/Field";
import { MultiSelectChips } from "@/components/ui/MultiSelectChips";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAllApplications } from "@/hooks/useApplications";
import { TENANT_KIND_OPTIONS } from "@/lib/constants";
import type { TenantDetail, UpdateTenantInput } from "@/lib/types";

const schema = z.object({
  name: z.string().min(1, "Tenant name is required"),
  kind: z.enum(["organization", "individual"]),
  contactEmail: z.string().email().optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  applicationIds: z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

export function TenantUpdateForm({
  tenant,
  submitting,
  onSubmit,
}: {
  tenant: TenantDetail;
  submitting: boolean;
  onSubmit: (values: UpdateTenantInput) => void;
}) {
  const applications = useAllApplications();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: tenant.name,
      kind: tenant.kind,
      contactEmail: tenant.contactEmail ?? "",
      phoneNumber: tenant.phoneNumber ?? "",
      website: tenant.website ?? "",
      address: tenant.address ?? "",
      applicationIds: tenant.applications.map((application) => application.id),
    },
  });

  const appOptions = (applications.data?.data ?? []).map((app) => ({ value: app.id, label: app.name }));

  const submit = (values: FormValues) =>
    onSubmit({
      name: values.name,
      kind: values.kind,
      contactEmail: values.contactEmail || undefined,
      phoneNumber: values.phoneNumber || undefined,
      website: values.website || undefined,
      address: values.address || undefined,
      applicationIds: values.applicationIds,
    });

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Tenant name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" {...register("name")} />
        </Field>
        <Field label="Kind" htmlFor="kind" hint="Kind can't be changed after a tenant is created.">
          <Select id="kind" options={TENANT_KIND_OPTIONS} disabled {...register("kind")} />
        </Field>
        <Field label="Contact email" htmlFor="contactEmail" error={errors.contactEmail?.message}>
          <Input id="contactEmail" type="email" {...register("contactEmail")} />
        </Field>
        <Field label="Phone number" htmlFor="phoneNumber">
          <Input id="phoneNumber" {...register("phoneNumber")} />
        </Field>
        <Field label="Website" htmlFor="website">
          <Input id="website" {...register("website")} />
        </Field>
        <Field label="Address" htmlFor="address">
          <Input id="address" {...register("address")} />
        </Field>
      </div>

      <Field label="Applications">
        {applications.isLoading ? <Spinner /> : null}
        {!applications.isLoading ? (
          <Controller
            control={control}
            name="applicationIds"
            render={({ field }) => (
              <MultiSelectChips options={appOptions} values={field.value} onChange={field.onChange} placeholder="Search applications…" />
            )}
          />
        ) : null}
      </Field>

      <div className="flex justify-end border-t border-surface-border pt-5">
        <Button type="submit" loading={submitting}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
