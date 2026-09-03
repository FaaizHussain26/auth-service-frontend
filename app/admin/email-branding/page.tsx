"use client";

import { useState, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Combobox } from "@/components/ui/Combobox";
import { Field, Input } from "@/components/ui/Field";
import { ColorField } from "@/components/ui/ColorField";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { LogoUpload } from "@/components/ui/LogoUpload";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/toast-context";
import { useAllApplications, useUploadApplicationLogo } from "@/hooks/admin/useApplications";
import { useEmailBranding, useSaveEmailBranding } from "@/hooks/admin/useEmailBranding";
import { usePlatformEmailBranding, useSavePlatformEmailBranding, useUploadPlatformLogo } from "@/hooks/admin/usePlatformEmailBranding";
import { EmailPreview } from "@/components/admin/email-branding/EmailPreview";
import type { BrandingFields, UpsertBrandingInput } from "@/lib/admin/types";

const PLATFORM_VALUE = "__platform__";

const schema = z.object({
  fromName: z.string().min(1, "From name is required"),
  fromAddress: z.string().email("Enter a valid email address"),
  replyToAddress: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  companyName: z.string().min(1, "Company name is required"),
  primaryColor: z.string().min(1),
  secondaryColor: z.string().min(1),
  buttonLabel: z.string().optional(),
  buttonUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  footerHtml: z.string().min(1, "Footer is required"),
});

type FormValues = z.infer<typeof schema>;

export default function EmailBrandingPage() {
  const { notify } = useToast();
  const [target, setTarget] = useState("");
  const isPlatform = target === PLATFORM_VALUE;
  const applicationId = !isPlatform ? target || undefined : undefined;

  const applications = useAllApplications();
  const applicationOptions = [
    { value: PLATFORM_VALUE, label: "myaccount (Platform)" },
    ...(applications.data?.data ?? []).filter((app) => !app.isSystem).map((app) => ({ value: app.id, label: app.name })),
  ];

  const appSettings = useEmailBranding(applicationId);
  const saveAppBranding = useSaveEmailBranding(applicationId ?? "");
  const uploadAppLogo = useUploadApplicationLogo(applicationId ?? "");

  const platformSettings = usePlatformEmailBranding(isPlatform);
  const savePlatformBranding = useSavePlatformEmailBranding();
  const uploadPlatformLogo = useUploadPlatformLogo();

  const query = isPlatform ? platformSettings : appSettings;

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-500">
        Customize the look and feel of myaccount's own emails (password reset, invitations, tickets) and of the
        release-note emails sent on behalf of each application.
      </p>

      <Field label="Application">
        <Combobox value={target} onValueChange={setTarget} options={applicationOptions} placeholder="Select an application" />
      </Field>

      {!target ? (
        <Card className="p-8 text-center text-sm text-ink-500">Select an application to configure its email branding.</Card>
      ) : query.isLoading ? (
        <Card className="flex justify-center p-8">
          <Spinner />
        </Card>
      ) : query.data ? (
        isPlatform ? (
          <EmailBrandingEditor
            key="platform"
            initial={platformSettings.data!.data}
            saving={savePlatformBranding.isPending}
            onSave={(values) =>
              savePlatformBranding.mutate(values, {
                onSuccess: () => notify("success", "Branding changes saved."),
                onError: (error: Error) => notify("error", error.message),
              })
            }
            logoSlot={
              <LogoUpload upload={uploadPlatformLogo} currentLogoUrl={platformSettings.data!.data.logoUrl} />
            }
            logoHint="Used across every myaccount-branded email — password reset, invitations, and support tickets."
          />
        ) : (
          <EmailBrandingEditor
            key={target}
            initial={appSettings.data!.data}
            saving={saveAppBranding.isPending}
            onSave={(values) =>
              saveAppBranding.mutate(values, {
                onSuccess: () => notify("success", "Branding changes saved."),
                onError: (error: Error) => notify("error", error.message),
              })
            }
            logoSlot={<LogoUpload upload={uploadAppLogo} currentLogoUrl={appSettings.data!.data.logoUrl} />}
            logoHint="Shared with the application itself — also shown on the tenant dashboard's app launcher."
          />
        )
      ) : null}
    </div>
  );
}

function EmailBrandingEditor({
  initial,
  saving,
  onSave,
  logoSlot,
  logoHint,
}: {
  initial: BrandingFields;
  saving: boolean;
  onSave: (values: UpsertBrandingInput) => void;
  logoSlot: ReactNode;
  logoHint: string;
}) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fromName: initial.fromName,
      fromAddress: initial.fromAddress,
      replyToAddress: initial.replyToAddress ?? "",
      companyName: initial.companyName,
      primaryColor: initial.primaryColor,
      secondaryColor: initial.secondaryColor,
      buttonLabel: initial.buttonLabel ?? "",
      buttonUrl: initial.buttonUrl ?? "",
      footerHtml: initial.footerHtml,
    },
  });

  const preview = useWatch({ control });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="space-y-5 p-6">
        <div>
          <h2 className="text-base font-semibold text-ink-900">Email Branding</h2>
          <p className="mt-1 text-sm text-ink-500">Customize the look and feel of all system-generated email communications.</p>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-700">Organization logo</p>
          {logoSlot}
          <p className="mt-1.5 text-xs text-ink-500">{logoHint}</p>
        </div>

        <form
          className="space-y-5"
          onSubmit={handleSubmit((values) =>
            onSave({
              ...values,
              replyToAddress: values.replyToAddress || undefined,
              buttonLabel: values.buttonLabel || undefined,
              buttonUrl: values.buttonUrl || undefined,
            }),
          )}
        >
          <Field label="Company name" htmlFor="companyName" error={errors.companyName?.message}>
            <Input id="companyName" {...register("companyName")} />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="From name" htmlFor="fromName" error={errors.fromName?.message}>
              <Input id="fromName" placeholder="Calendax" {...register("fromName")} />
            </Field>
            <Field
              label="From address"
              htmlFor="fromAddress"
              error={errors.fromAddress?.message}
              hint="Must be on a domain verified with AWS SES."
            >
              <Input id="fromAddress" placeholder="no-reply@reply.calendax.com" {...register("fromAddress")} />
            </Field>
          </div>

          <Field label="Reply-to address" htmlFor="replyToAddress" error={errors.replyToAddress?.message}>
            <Input id="replyToAddress" placeholder="support@calendax.com" {...register("replyToAddress")} />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Primary color" htmlFor="primaryColor">
              <Controller
                control={control}
                name="primaryColor"
                render={({ field }) => <ColorField id="primaryColor" value={field.value} onChange={field.onChange} />}
              />
            </Field>
            <Field label="Secondary color" htmlFor="secondaryColor">
              <Controller
                control={control}
                name="secondaryColor"
                render={({ field }) => <ColorField id="secondaryColor" value={field.value} onChange={field.onChange} />}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="Button label"
              htmlFor="buttonLabel"
              error={errors.buttonLabel?.message}
              hint="Leave both button fields blank to leave the button off the email."
            >
              <Input id="buttonLabel" placeholder="Visit Website" {...register("buttonLabel")} />
            </Field>
            <Field label="Button URL" htmlFor="buttonUrl" error={errors.buttonUrl?.message}>
              <Input id="buttonUrl" placeholder="https://calendax.com" {...register("buttonUrl")} />
            </Field>
          </div>

          <Field label="Email footer" error={errors.footerHtml?.message}>
            <Controller
              control={control}
              name="footerHtml"
              render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
            />
          </Field>

          <div className="flex justify-end gap-2.5 border-t border-surface-border pt-5">
            <Button type="submit" loading={saving}>
              Save branding changes
            </Button>
          </div>
        </form>
      </Card>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-700">Live preview</p>
        <EmailPreview
          logoUrl={initial.logoUrl}
          companyName={preview.companyName || initial.companyName}
          primaryColor={preview.primaryColor || initial.primaryColor}
          secondaryColor={preview.secondaryColor || initial.secondaryColor}
          buttonLabel={preview.buttonLabel}
          buttonUrl={preview.buttonUrl}
          footerHtml={preview.footerHtml || initial.footerHtml}
        />
      </div>
    </div>
  );
}
