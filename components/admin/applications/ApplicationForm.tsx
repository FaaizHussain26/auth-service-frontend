"use client";

import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Field";
import { Select } from "@/components/ui/Field";
import { MultiSelectChips } from "@/components/ui/MultiSelectChips";
import { StringListInput } from "@/components/ui/StringListInput";
import { Button } from "@/components/ui/Button";
import { LogoUpload } from "@/components/ui/LogoUpload";
import { Stepper } from "@/components/ui/Stepper";
import { useUploadApplicationLogo } from "@/hooks/admin/useApplications";
import {
  CLIENT_TYPE_OPTIONS,
  GRANT_TYPE_OPTIONS,
  SCOPE_OPTIONS,
} from "@/lib/admin/constants";
import { slugify } from "@/lib/utils";
import type { ApiResult } from "@/lib/api-client";
import type { CreateApplicationInput } from "@/lib/admin/types";

const BASE_DOMAIN_PATTERN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;

const schema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    clientType: z.enum(["public", "confidential"]),
    redirectUris: z
      .array(z.string())
      .transform((values) => values.map((v) => v.trim()).filter(Boolean))
      .pipe(z.array(z.string().url("Enter a valid URL, e.g. https://app.example.com/callback"))),
    postLogoutRedirectUris: z
      .array(z.string())
      .transform((values) => values.map((v) => v.trim()).filter(Boolean))
      .pipe(z.array(z.string().url("Enter a valid URL, e.g. https://app.example.com/"))),
    grantTypes: z.array(z.string()).min(1, "Select at least one grant type"),
    scopes: z.array(z.string()).min(1, "Select at least one scope"),
    resourceIndicator: z.string().url("Enter a valid URL, e.g. https://api.example.com").optional().or(z.literal("")),
    webhookUrl: z.string().url("Enter a valid URL, e.g. https://app.example.com/webhooks/daxcore").optional().or(z.literal("")),
    baseDomain: z.string().regex(BASE_DOMAIN_PATTERN, "Enter a bare domain like calendax.com — no https:// or path").optional().or(z.literal("")),
    logoUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    rolesEndpointPath: z.string().regex(/^\//, "Path must start with / (e.g. /internal/roles)").optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const needsRedirect = data.grantTypes.includes("authorization_code");
    if (needsRedirect && data.redirectUris.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["redirectUris"],
        message: "At least one redirect URI is required for the Authorization Code grant",
      });
    }
    if (needsRedirect && !data.scopes.includes("openid")) {
      ctx.addIssue({
        code: "custom",
        path: ["scopes"],
        message: "The openid scope is required for sign-in (Authorization Code grant)",
      });
    }
  });

export type ApplicationFormValues = z.infer<typeof schema>;

const STEPS: { key: string; title: string; description: string; fields: (keyof ApplicationFormValues)[] }[] = [
  {
    key: "basics",
    title: "Basics",
    description: "Give it a name, a client type, and a logo — this is what tenants and users will see.",
    fields: ["name", "clientType", "logoUrl"],
  },
  {
    key: "redirects",
    title: "Redirects",
    description: "Tell Syncora which URLs are allowed to receive users after they sign in or out.",
    fields: ["baseDomain", "redirectUris", "postLogoutRedirectUris"],
  },
  {
    key: "integration",
    title: "Integration",
    description: "Advanced settings for how this application talks back to Syncora — token audience, lifecycle webhooks, and role lookups.",
    fields: ["resourceIndicator", "webhookUrl", "rolesEndpointPath"],
  },
  {
    key: "access",
    title: "Access",
    description: "Choose what sign-in flows this application supports and what user data it can request.",
    fields: ["grantTypes", "scopes"],
  },
];

export function ApplicationForm({
  defaultValues,
  existingClientId,
  applicationId,
  submitLabel,
  submitting,
  locked,
  onSubmit,
}: {
  defaultValues?: Partial<ApplicationFormValues>;
  /** The app's already-assigned client_id, when editing — fixed and shown as-is. */
  existingClientId?: string;
  /** The app's id, when editing — enables uploading a logo directly (upload needs an existing application). */
  applicationId?: string;
  submitLabel: string;
  submitting: boolean;
  /** Platform-critical application — only name/logo are editable here. */
  locked?: boolean;
  /** `logoFile` is set when a logo was picked before the application existed yet (create flow) — upload it once the id is known. */
  onSubmit: (values: CreateApplicationInput, logoFile?: File) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      clientType: "public",
      redirectUris: [""],
      postLogoutRedirectUris: [""],
      grantTypes: ["authorization_code", "refresh_token"],
      scopes: ["openid", "email", "profile", "offline_access"],
      resourceIndicator: "",
      webhookUrl: "",
      baseDomain: "",
      logoUrl: "",
      rolesEndpointPath: "",
      ...defaultValues,
    },
  });

  const nameValue = useWatch({ control, name: "name" });
  const logoUrlValue = useWatch({ control, name: "logoUrl" });
  const grantTypesValue = useWatch({ control, name: "grantTypes" });
  const redirectUrisRequired = grantTypesValue?.includes("authorization_code") ?? false;
  const clientId = existingClientId || slugify(nameValue || "");
  const uploadLogo = useUploadApplicationLogo(applicationId ?? "");

  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingLogoPreviewUrl, setPendingLogoPreviewUrl] = useState<string | null>(null);
  const stageLogo = useMutation<ApiResult<{ logoUrl: string | null }>, Error, File>({
    mutationFn: async (file) => ({ data: { logoUrl: URL.createObjectURL(file) }, meta: null }),
  });

  useEffect(() => {
    return () => {
      if (pendingLogoPreviewUrl) URL.revokeObjectURL(pendingLogoPreviewUrl);
    };
  }, [pendingLogoPreviewUrl]);

  const [stepIndex, setStepIndex] = useState(0);
  const [furthestIndex, setFurthestIndex] = useState(0);
  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const goNext = async () => {
    const isStepValid = await trigger(currentStep.fields);
    if (!isStepValid) return;
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    setFurthestIndex((i) => Math.max(i, stepIndex + 1));
  };

  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const jumpToStep = (index: number) => {
    if (index > furthestIndex) return;
    setStepIndex(index);
  };

  const handleFormKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter" || isLastStep) return;
    event.preventDefault();
    void goNext();
  };

  const handleLogoUploaded = (url: string, file: File) => {
    if (applicationId) {
      setValue("logoUrl", url, { shouldDirty: true });
      return;
    }
    setPendingLogoPreviewUrl(url);
    setPendingLogoFile(file);
  };

  const submitForm = handleSubmit(
    (values) => onSubmit(values, pendingLogoFile ?? undefined),
    (formErrors) => {
      const erroredStepIndex = STEPS.findIndex((step) => step.fields.some((field) => field in formErrors));
      if (erroredStepIndex === -1) return;
      setStepIndex(erroredStepIndex);
      setFurthestIndex((i) => Math.max(i, erroredStepIndex));
    },
  );

  if (locked) {
    return (
      <form onSubmit={submitForm} className="space-y-6">
        <Field label="Display name" htmlFor="name" error={errors.name?.message} required>
          <Input id="name" placeholder="My Application" {...register("name")} />
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
            Client ID:
            <code className="rounded bg-surface-page px-1.5 py-0.5 font-mono text-ink-700">{clientId || "—"}</code>
            (fixed — can't change after creation)
          </p>
        </Field>

        <Field label="Logo" htmlFor="logoUrl" hint="Shown on the tenant dashboard's 'my applications' launcher and in release-note emails.">
          <div className="space-y-2.5">
            <LogoUpload
              upload={uploadLogo}
              currentLogoUrl={logoUrlValue || null}
              onUploaded={(url) => setValue("logoUrl", url, { shouldDirty: true })}
            />
            <Input id="logoUrl" placeholder="Or paste a logo URL directly" {...register("logoUrl")} />
          </div>
        </Field>

        <p className="rounded-field bg-surface-page px-3 py-2 text-xs text-ink-500">
          This is a platform-critical application — only its name and logo can be changed here. The fields below are
          read-only.
        </p>

        <fieldset disabled className="space-y-6 opacity-60">
          <Field label="Client type" htmlFor="clientType">
            <Select id="clientType" options={CLIENT_TYPE_OPTIONS} {...register("clientType")} />
          </Field>
          <Field label="Base domain" htmlFor="baseDomain">
            <Input id="baseDomain" {...register("baseDomain")} />
          </Field>
          <Field label="Roles endpoint path" htmlFor="rolesEndpointPath">
            <Input id="rolesEndpointPath" {...register("rolesEndpointPath")} />
          </Field>
        </fieldset>

        <div className="flex justify-end border-t border-surface-border pt-5">
          <Button type="submit" loading={submitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={submitForm} onKeyDown={handleFormKeyDown} className="space-y-6">
      <Stepper steps={STEPS} currentIndex={stepIndex} furthestIndex={furthestIndex} onStepClick={jumpToStep} />

      <div>
        <h3 className="text-sm font-semibold text-ink-900">
          Step {stepIndex + 1} of {STEPS.length} — {currentStep.title}
        </h3>
        <p className="mt-1 text-xs text-ink-500">{currentStep.description}</p>
      </div>

      {currentStep.key === "basics" ? (
        <div className="space-y-6">
          <Field label="Display name" htmlFor="name" error={errors.name?.message} required>
            <Input id="name" placeholder="My Application" {...register("name")} />
            <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
              Client ID:
              <code className="rounded bg-surface-page px-1.5 py-0.5 font-mono text-ink-700">{clientId || "—"}</code>
              {existingClientId ? "(fixed — can't change after creation)" : "(auto-generated from the name)"}
            </p>
          </Field>

          <Field
            label="Client type"
            htmlFor="clientType"
            error={errors.clientType?.message}
            required
          >
            <Select id="clientType" options={CLIENT_TYPE_OPTIONS} {...register("clientType")} />
          </Field>

          <Field
            label="Logo"
            htmlFor="logoUrl"
            hint="Shown on the tenant dashboard's 'my applications' launcher and in release-note emails. Leave blank to show a generated icon instead."
          >
            <div className="space-y-2.5">
              <LogoUpload
                upload={applicationId ? uploadLogo : stageLogo}
                currentLogoUrl={pendingLogoPreviewUrl ?? logoUrlValue ?? null}
                onUploaded={handleLogoUploaded}
              />
              <Input id="logoUrl" placeholder="Or paste a logo URL directly" {...register("logoUrl")} />
            </div>
          </Field>
        </div>
      ) : null}

      {currentStep.key === "redirects" ? (
        <div className="space-y-6">
          <Field
            label="Base domain"
            htmlFor="baseDomain"
            hint="When set, each tenant granted this app automatically gets a redirect URI derived from its subdomain, e.g. abc.calendax.com."
          >
            <Input id="baseDomain" placeholder="calendax.com" {...register("baseDomain")} />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="Redirect URIs"
              error={errors.redirectUris?.message as string | undefined}
              required={redirectUrisRequired}
              hint={redirectUrisRequired ? "Required for the Authorization Code grant selected in Access." : undefined}
            >
              <Controller
                control={control}
                name="redirectUris"
                render={({ field }) => (
                  <StringListInput values={field.value} onChange={field.onChange} placeholder="https://app.example.com/callback" />
                )}
              />
            </Field>
            <Field label="Post-logout redirect URIs" error={errors.postLogoutRedirectUris?.message as string | undefined}>
              <Controller
                control={control}
                name="postLogoutRedirectUris"
                render={({ field }) => (
                  <StringListInput values={field.value} onChange={field.onChange} placeholder="https://app.example.com/" />
                )}
              />
            </Field>
          </div>
        </div>
      ) : null}

      {currentStep.key === "integration" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Resource indicator" htmlFor="resourceIndicator" hint="Audience the access token is minted for.">
              <Input id="resourceIndicator" placeholder="https://api.example.com" {...register("resourceIndicator")} />
            </Field>
            <Field label="Webhook URL" htmlFor="webhookUrl" hint="Receives tenant.created and related lifecycle events.">
              <Input id="webhookUrl" placeholder="https://app.example.com/webhooks/daxcore" {...register("webhookUrl")} />
            </Field>
          </div>

          <Field
            label="Roles endpoint path"
            htmlFor="rolesEndpointPath"
            hint="Path (relative to the resource indicator) this app exposes to return its per-tenant roles, used by the invite-member role picker. Defaults to /internal/roles."
          >
            <Input id="rolesEndpointPath" placeholder="/internal/roles" {...register("rolesEndpointPath")} />
          </Field>
        </div>
      ) : null}

      {currentStep.key === "access" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Grant types" error={errors.grantTypes?.message} required>
            <Controller
              control={control}
              name="grantTypes"
              render={({ field }) => (
                <MultiSelectChips options={GRANT_TYPE_OPTIONS} values={field.value} onChange={field.onChange} placeholder="Search grant types…" />
              )}
            />
          </Field>
          <Field label="Scopes" error={errors.scopes?.message} hint="Fixed set of scopes supported by this identity provider." required>
            <Controller
              control={control}
              name="scopes"
              render={({ field }) => (
                <MultiSelectChips options={SCOPE_OPTIONS} values={field.value} onChange={field.onChange} placeholder="Search scopes…" />
              )}
            />
          </Field>
        </div>
      ) : null}

      <div className="flex items-center justify-between border-t border-surface-border pt-5">
        <Button type="button" variant="secondary" onClick={goBack} disabled={stepIndex === 0}>
          Back
        </Button>
        {isLastStep ? (
          // Deliberately a different `key` than the "Next" button below: without
          // it, React reuses the same DOM node and mutates its `type` attribute
          // from "button" to "submit" in place — and if that mutation lands
          // while the click that triggered it is still being processed, the
          // browser treats it as a click on a submit button and submits the
          // form immediately, skipping the Access step entirely.
          <Button key="submit" type="submit" loading={submitting}>
            {submitLabel}
          </Button>
        ) : (
          <Button key="next" type="button" onClick={goNext}>
            Next
          </Button>
        )}
      </div>
    </form>
  );
}
