"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { CreateUserInput } from "@/lib/admin/types";

const schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Enter a valid email address"),
  phoneNumber: z.string().optional(),
  isSuperadmin: z.boolean(),
});

export type UserFormValues = z.infer<typeof schema>;

export function UserForm({ submitting, onSubmit }: { submitting: boolean; onSubmit: (values: CreateUserInput) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", phoneNumber: "", isSuperadmin: false },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName">
          <Input id="firstName" placeholder="Kevin" {...register("firstName")} />
        </Field>
        <Field label="Last name" htmlFor="lastName">
          <Input id="lastName" placeholder="Martin" {...register("lastName")} />
        </Field>
      </div>

      <Field label="Email address" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" placeholder="kevin.martin@company.com" {...register("email")} />
      </Field>

      <Field label="Phone number" htmlFor="phoneNumber">
        <Input id="phoneNumber" placeholder="+1 (555) 000-0000" {...register("phoneNumber")} />
      </Field>

      <label className="flex cursor-pointer items-center gap-2.5 rounded-field border border-surface-border bg-white px-3.5 py-3 text-sm text-ink-900">
        <input type="checkbox" className="h-4 w-4 accent-brand-600" {...register("isSuperadmin")} />
        Grant superadmin access to this console
      </label>

      <div className="rounded-field bg-surface-page px-4 py-3 text-xs text-ink-700">
        A temporary password will be generated for this user. Share it with them securely — it is shown once after creation.
      </div>

      <div className="flex justify-end gap-2 border-t border-surface-border pt-5">
        <Button type="submit" loading={submitting}>
          Create user
        </Button>
      </div>
    </form>
  );
}
