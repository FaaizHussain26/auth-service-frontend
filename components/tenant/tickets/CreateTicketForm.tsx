"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useMyApplications } from "@/hooks/tenant/useMyApplications";
import type { CreateTicketInput } from "@/lib/tenant/types";

const schema = z.object({
  applicationId: z.string().min(1, "Select an application"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
});

export function CreateTicketForm({
  submitting,
  onSubmit,
}: {
  submitting: boolean;
  onSubmit: (values: CreateTicketInput) => void;
}) {
  const myApplications = useMyApplications();
  const applicationOptions = (myApplications.data?.applications ?? []).map((app) => ({ value: app.id, label: app.name }));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(schema),
    defaultValues: { applicationId: "", subject: "", description: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field label="Application" htmlFor="applicationId" error={errors.applicationId?.message}>
        <Select
          id="applicationId"
          options={applicationOptions}
          placeholder={myApplications.isLoading ? "Loading…" : "Select an application"}
          disabled={myApplications.isLoading}
          {...register("applicationId")}
        />
      </Field>

      <Field label="Subject" htmlFor="subject" error={errors.subject?.message}>
        <Input id="subject" placeholder="Cannot invite new members" {...register("subject")} />
      </Field>

      <Field label="Description" htmlFor="description" error={errors.description?.message}>
        <Textarea id="description" className="h-32" placeholder="Describe the issue…" {...register("description")} />
      </Field>

      <div className="flex justify-end border-t border-surface-border pt-5">
        <Button type="submit" loading={submitting}>
          Submit ticket
        </Button>
      </div>
    </form>
  );
}
