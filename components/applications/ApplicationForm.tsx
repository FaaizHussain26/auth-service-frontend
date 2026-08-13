"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Field";
import { Select } from "@/components/ui/Field";
import { MultiSelectChips } from "@/components/ui/MultiSelectChips";
import { StringListInput } from "@/components/ui/StringListInput";
import { Button } from "@/components/ui/Button";
import {
  CLIENT_TYPE_OPTIONS,
  GRANT_TYPE_OPTIONS,
  SCOPE_OPTIONS,
} from "@/lib/constants";
import { slugify } from "@/lib/utils";
import type { CreateApplicationInput } from "@/lib/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  clientType: z.enum(["public", "confidential"]),
  redirectUris: z
    .array(z.string())
    .transform((values) => values.map((v) => v.trim()).filter(Boolean)),
  postLogoutRedirectUris: z
    .array(z.string())
    .transform((values) => values.map((v) => v.trim()).filter(Boolean)),
  grantTypes: z.array(z.string()).min(1, "Select at least one grant type"),
  scopes: z.array(z.string()).min(1, "Select at least one scope"),
  resourceIndicator: z.string().optional(),
  webhookUrl: z.string().optional(),
  baseDomain: z.string().optional(),
  logoUrl: z.string().optional(),
});

export type ApplicationFormValues = z.infer<typeof schema>;

export function ApplicationForm({
  defaultValues,
  existingClientId,
  submitLabel,
  submitting,
  onSubmit,
}: {
  defaultValues?: Partial<ApplicationFormValues>;
  /** The app's already-assigned client_id, when editing — fixed and shown as-is. */
  existingClientId?: string;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: CreateApplicationInput) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
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
      ...defaultValues,
    },
  });

  const nameValue = useWatch({ control, name: "name" });
  const clientId = existingClientId || slugify(nameValue || "");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Field label="Display name" htmlFor="name" error={errors.name?.message}>
        <Input id="name" placeholder="My Application" {...register("name")} />
        <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
          Client ID:
          <code className="rounded bg-surface-page px-1.5 py-0.5 font-mono text-ink-700">
            {clientId || "—"}
          </code>
          {existingClientId ? "(fixed — can't change after creation)" : "(auto-generated from the name)"}
        </p>
      </Field>

      <Field
        label="Client type"
        htmlFor="clientType"
        error={errors.clientType?.message}
      >
        <Select
          id="clientType"
          options={CLIENT_TYPE_OPTIONS}
          {...register("clientType")}
        />
      </Field>

      <Field
        label="Base domain"
        htmlFor="baseDomain"
        hint="When set, each tenant granted this app automatically gets a redirect URI derived from its subdomain, e.g. abc.calendax.com."
      >
        <Input id="baseDomain" placeholder="calendax.com" {...register("baseDomain")} />
      </Field>

      <Field
        label="Logo URL"
        htmlFor="logoUrl"
        hint="Shown on the tenant dashboard's 'my applications' launcher. Leave blank to show a generated icon instead."
      >
        <Input id="logoUrl" placeholder="https://app.example.com/logo.png" {...register("logoUrl")} />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Redirect URIs"
          error={errors.redirectUris?.message as string | undefined}
        >
          <Controller
            control={control}
            name="redirectUris"
            render={({ field }) => (
              <StringListInput
                values={field.value}
                onChange={field.onChange}
                placeholder="https://app.example.com/callback"
              />
            )}
          />
        </Field>
        <Field
          label="Post-logout redirect URIs"
          error={errors.postLogoutRedirectUris?.message as string | undefined}
        >
          <Controller
            control={control}
            name="postLogoutRedirectUris"
            render={({ field }) => (
              <StringListInput
                values={field.value}
                onChange={field.onChange}
                placeholder="https://app.example.com/"
              />
            )}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Resource indicator"
          htmlFor="resourceIndicator"
          hint="Audience the access token is minted for."
        >
          <Input
            id="resourceIndicator"
            placeholder="https://api.example.com"
            {...register("resourceIndicator")}
          />
        </Field>
        <Field
          label="Webhook URL"
          htmlFor="webhookUrl"
          hint="Receives tenant.created and related lifecycle events."
        >
          <Input
            id="webhookUrl"
            placeholder="https://app.example.com/webhooks/daxcore"
            {...register("webhookUrl")}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Grant types" error={errors.grantTypes?.message}>
          <Controller
            control={control}
            name="grantTypes"
            render={({ field }) => (
              <MultiSelectChips
                options={GRANT_TYPE_OPTIONS}
                values={field.value}
                onChange={field.onChange}
                placeholder="Search grant types…"
              />
            )}
          />
        </Field>
        <Field
          label="Scopes"
          error={errors.scopes?.message}
          hint="Fixed set of scopes supported by this identity provider."
        >
          <Controller
            control={control}
            name="scopes"
            render={({ field }) => (
              <MultiSelectChips
                options={SCOPE_OPTIONS}
                values={field.value}
                onChange={field.onChange}
                placeholder="Search scopes…"
              />
            )}
          />
        </Field>
      </div>

      <div className="flex justify-end border-t border-surface-border pt-5">
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
