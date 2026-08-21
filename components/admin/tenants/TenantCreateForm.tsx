"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, Input } from "@/components/ui/Field";
import { Select } from "@/components/ui/Field";
import { MultiSelectChips } from "@/components/ui/MultiSelectChips";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAllApplications } from "@/hooks/admin/useApplications";
import { TENANT_KIND_OPTIONS } from "@/lib/admin/constants";
import type { CreateTenantInput } from "@/lib/admin/types";

const schema = z.object({
  name: z.string().min(1, "Tenant name is required"),
  kind: z.enum(["organization", "individual"]),
  applicationIds: z.array(z.string()).min(1, "Select at least one application"),
  firstUserEmail: z.string().email("Enter a valid email address"),
  firstUserFirstName: z.string().optional(),
  firstUserLastName: z.string().optional(),
  firstUserPhoneNumber: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function TenantCreateForm({ submitting, onSubmit }: { submitting: boolean; onSubmit: (values: CreateTenantInput) => void }) {
  const applications = useAllApplications();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      kind: "organization",
      applicationIds: [],
      firstUserEmail: "",
      firstUserFirstName: "",
      firstUserLastName: "",
      firstUserPhoneNumber: "",
      contactEmail: "",
      phoneNumber: "",
      website: "",
      address: "",
    },
  });

  const appOptions = (applications.data?.data ?? [])
    .filter((app) => !app.hiddenFromPicker)
    .map((app) => ({ value: app.id, label: app.name }));

  const submit = (values: FormValues) =>
    onSubmit({
      name: values.name,
      kind: values.kind,
      applicationIds: values.applicationIds,
      firstUser: {
        email: values.firstUserEmail,
        firstName: values.firstUserFirstName || undefined,
        lastName: values.firstUserLastName || undefined,
        phoneNumber: values.firstUserPhoneNumber || undefined,
      },
      contactEmail: values.contactEmail || undefined,
      phoneNumber: values.phoneNumber || undefined,
      website: values.website || undefined,
      address: values.address || undefined,
    });

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Tenant name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" placeholder="Acme Inc" {...register("name")} />
        </Field>
        <Field label="Kind" htmlFor="kind">
          <Select id="kind" options={TENANT_KIND_OPTIONS} {...register("kind")} />
        </Field>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink-900">First admin user</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Email address" htmlFor="firstUserEmail" error={errors.firstUserEmail?.message}>
            <Input id="firstUserEmail" type="email" placeholder="owner@acme.com" {...register("firstUserEmail")} />
          </Field>
          <Field label="Phone number" htmlFor="firstUserPhoneNumber">
            <Input id="firstUserPhoneNumber" placeholder="+1 (555) 000-0000" {...register("firstUserPhoneNumber")} />
          </Field>
          <Field label="First name" htmlFor="firstUserFirstName">
            <Input id="firstUserFirstName" placeholder="Jane" {...register("firstUserFirstName")} />
          </Field>
          <Field label="Last name" htmlFor="firstUserLastName">
            <Input id="firstUserLastName" placeholder="Doe" {...register("firstUserLastName")} />
          </Field>
        </div>
      </div>

      <Field label="Grant access to applications" error={errors.applicationIds?.message} hint="At least one application is required.">
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

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink-900">Organization details (optional)</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Contact email" htmlFor="contactEmail" error={errors.contactEmail?.message}>
            <Input id="contactEmail" type="email" placeholder="billing@acme.com" {...register("contactEmail")} />
          </Field>
          <Field label="Phone number" htmlFor="phoneNumber">
            <Input id="phoneNumber" placeholder="+1 (555) 000-0000" {...register("phoneNumber")} />
          </Field>
          <Field label="Website" htmlFor="website">
            <Input id="website" placeholder="https://acme.com" {...register("website")} />
          </Field>
          <Field label="Address" htmlFor="address">
            <Input id="address" placeholder="123 Market St, San Francisco, CA" {...register("address")} />
          </Field>
        </div>
      </div>

      <div className="rounded-field bg-surface-page px-4 py-3 text-xs text-ink-700">
        A temporary password is generated for the first admin user and emailed to them.
      </div>

      <div className="flex justify-end border-t border-surface-border pt-5">
        <Button type="submit" loading={submitting}>
          Create tenant
        </Button>
      </div>
    </form>
  );
}
