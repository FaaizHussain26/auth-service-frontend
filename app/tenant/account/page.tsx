"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, Monitor, ShieldCheck, UserRound } from "lucide-react";
import { useMe } from "@/hooks/tenant/useMe";
import { useChangePassword, useMySessions, useRevokeMySession, useUpdateProfile } from "@/hooks/tenant/useAccount";
import { useToast } from "@/components/ui/toast-context";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateTime, fullName } from "@/lib/utils";

const profileSchema = z.object({
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type PasswordValues = z.infer<typeof passwordSchema>;

export default function AccountPage() {
  const { notify } = useToast();
  const me = useMe();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const [sessionsPage, setSessionsPage] = useState(1);
  const sessions = useMySessions({ limit: 10, page: sessionsPage, sortBy: "createdAt", sortOrder: "DESC" });
  const revokeSession = useRevokeMySession();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", middleName: "", lastName: "", phoneNumber: "" },
  });

  useEffect(() => {
    if (!me.data) return;
    resetProfile({
      firstName: me.data.user.firstName ?? "",
      middleName: me.data.user.middleName ?? "",
      lastName: me.data.user.lastName ?? "",
      phoneNumber: me.data.user.phoneNumber ?? "",
    });
  }, [me.data, resetProfile]);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  if (me.isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      {me.data ? (
        <Card className="flex flex-wrap items-center gap-4 p-6">
          <Avatar seed={me.data.user.email} size={56} />
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-ink-900">
              {fullName(me.data.user.firstName, me.data.user.lastName) || me.data.user.email}
            </h2>
            <p className="truncate text-sm text-ink-500">{me.data.user.email}</p>
          </div>
          {me.data.tenant ? (
            <div className="ml-auto flex items-center gap-2">
              <Badge label={me.data.tenant.name} tone="neutral" />
              <Badge label={me.data.role} tone="brand" />
            </div>
          ) : null}
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="space-y-5 p-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <UserRound className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink-900">Profile</h2>
              <p className="text-xs text-ink-500">Your name and contact details.</p>
            </div>
          </div>
          <form
            className="space-y-5"
            onSubmit={handleProfileSubmit((values) =>
              updateProfile.mutate(values, {
                onSuccess: () => notify("success", "Profile updated."),
                onError: (error: Error) => notify("error", error.message),
              }),
            )}
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="First name" htmlFor="firstName" error={profileErrors.firstName?.message}>
                <Input id="firstName" {...registerProfile("firstName")} />
              </Field>
              <Field label="Last name" htmlFor="lastName" error={profileErrors.lastName?.message}>
                <Input id="lastName" {...registerProfile("lastName")} />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Middle name" htmlFor="middleName" error={profileErrors.middleName?.message}>
                <Input id="middleName" {...registerProfile("middleName")} />
              </Field>
              <Field label="Phone number" htmlFor="phoneNumber" error={profileErrors.phoneNumber?.message}>
                <Input id="phoneNumber" {...registerProfile("phoneNumber")} />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={updateProfile.isPending}>
                Save profile
              </Button>
            </div>
          </form>
        </Card>

        <Card className="space-y-5 p-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <KeyRound className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink-900">Password</h2>
              <p className="text-xs text-ink-500">Choose a strong password you don&apos;t use elsewhere.</p>
            </div>
          </div>
          <form
            className="space-y-5"
            onSubmit={handlePasswordSubmit((values) =>
              changePassword.mutate(
                { currentPassword: values.currentPassword, newPassword: values.newPassword },
                {
                  onSuccess: () => {
                    notify("success", "Password changed.");
                    resetPassword();
                  },
                  onError: (error: Error) => notify("error", error.message),
                },
              ),
            )}
          >
            <Field label="Current password" htmlFor="currentPassword" error={passwordErrors.currentPassword?.message}>
              <Input id="currentPassword" type="password" {...registerPassword("currentPassword")} />
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="New password" htmlFor="newPassword" error={passwordErrors.newPassword?.message}>
                <Input id="newPassword" type="password" {...registerPassword("newPassword")} />
              </Field>
              <Field label="Confirm new password" htmlFor="confirmPassword" error={passwordErrors.confirmPassword?.message}>
                <Input id="confirmPassword" type="password" {...registerPassword("confirmPassword")} />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={changePassword.isPending}>
                Change password
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Card className="space-y-5 p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink-900">Active sessions</h2>
            <p className="text-xs text-ink-500">Devices and browsers currently signed in to your account.</p>
          </div>
        </div>

        {sessions.isLoading ? <Spinner /> : null}
        {!sessions.isLoading && !(sessions.data?.data ?? []).length ? (
          <p className="py-4 text-center text-sm text-ink-500">No sessions recorded.</p>
        ) : null}
        {!sessions.isLoading && (sessions.data?.data ?? []).length ? (
          <ul className="divide-y divide-surface-border">
            {(sessions.data?.data ?? []).map((session) => (
              <li key={session.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div className="flex items-center gap-2.5">
                  <Monitor className="h-4 w-4 text-ink-500" />
                  <div>
                    <p className="font-medium text-ink-900">Expires {formatDateTime(session.expiresAt)}</p>
                    <p className="text-xs text-ink-500">Created {formatDateTime(session.createdAt)}</p>
                  </div>
                </div>
                {session.revokedAt ? (
                  <Badge label="Revoked" tone="neutral" />
                ) : session.isCurrent ? (
                  <Badge label="Active" tone="success" />
                ) : (
                  <button
                    onClick={() =>
                      revokeSession.mutate(session.id, {
                        onSuccess: () => notify("success", "Session revoked."),
                        onError: (error: Error) => notify("error", error.message),
                      })
                    }
                    className="text-xs font-semibold text-danger hover:underline"
                  >
                    Revoke
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : null}

        <Pagination meta={sessions.data?.meta} onPageChange={setSessionsPage} />
      </Card>
    </div>
  );
}
