"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, Input } from "@/components/ui/Field";
import { Combobox } from "@/components/ui/Combobox";
import { Button } from "@/components/ui/Button";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { useAllApplications } from "@/hooks/admin/useApplications";
import type { CreateReleaseNoteInput } from "@/lib/admin/types";

const schema = z.object({
  applicationId: z.string().min(1, "Select an application"),
  subject: z.string().min(1, "Subject is required"),
  contentHtml: z.string().min(1, "Content is required"),
});

export type ReleaseNoteFormValues = z.infer<typeof schema>;

export function ReleaseNoteForm({
  defaultValues,
  submitLabel,
  submitting,
  onSubmit,
}: {
  defaultValues?: Partial<ReleaseNoteFormValues>;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: CreateReleaseNoteInput) => void;
}) {
  const applications = useAllApplications();
  const applicationOptions = (applications.data?.data ?? [])
    .filter((app) => !app.isSystem)
    .map((app) => ({ value: app.id, label: app.name }));

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ReleaseNoteFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { applicationId: "", subject: "", contentHtml: "", ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field label="Application" htmlFor="applicationId" error={errors.applicationId?.message}>
        <Controller
          control={control}
          name="applicationId"
          render={({ field }) => (
            <Combobox value={field.value} onValueChange={field.onChange} options={applicationOptions} placeholder="Select application" />
          )}
        />
      </Field>

      <Field label="Subject" htmlFor="subject" error={errors.subject?.message}>
        <Input id="subject" placeholder="New: dark mode is here" {...register("subject")} />
      </Field>

      <Field label="Content" error={errors.contentHtml?.message}>
        <Controller
          control={control}
          name="contentHtml"
          render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
        />
      </Field>

      <div className="flex justify-end border-t border-surface-border pt-5">
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
