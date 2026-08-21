"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Select } from "@/components/ui/Field";
import { useApplicationRoles } from "@/hooks/tenant/useApplicationRoles";

export interface ApplicationRoleValue {
  applicationId: string;
  roleId: string;
  roleName?: string;
}

interface AppOption {
  value: string;
  label: string;
}

/** Picks apps AND, per app, the role to grant inside it — fetched live from the app. */
export function ApplicationRolePicker({
  options,
  values,
  onChange,
  placeholder = "Search applications…",
}: {
  options: readonly AppOption[];
  values: ApplicationRoleValue[];
  onChange: (values: ApplicationRoleValue[]) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selectedIds = values.map((v) => v.applicationId);
  const available = options.filter(
    (option) => !selectedIds.includes(option.value) && option.label.toLowerCase().includes(query.toLowerCase()),
  );

  const add = (applicationId: string) => {
    onChange([...values, { applicationId, roleId: "" }]);
    setQuery("");
  };

  const remove = (applicationId: string) => {
    onChange(values.filter((v) => v.applicationId !== applicationId));
  };

  const setRole = (applicationId: string, roleId: string, roleName?: string) => {
    onChange(values.map((v) => (v.applicationId === applicationId ? { ...v, roleId, roleName } : v)));
  };

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder={placeholder}
          className="h-11 w-full rounded-field border border-surface-border bg-white px-3.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-500 focus:border-brand-600 focus:ring-3 focus:ring-brand-600/12"
        />
        {open && available.length ? (
          <div className="absolute z-[60] mt-1.5 max-h-56 w-full overflow-y-auto rounded-2xl border border-surface-border bg-white p-1.5 shadow-xl">
            {available.map((option) => (
              <button
                key={option.value}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => add(option.value)}
                className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-ink-900 hover:bg-surface-page"
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {values.length ? (
        <div className="space-y-2">
          {values.map((value) => (
            <ApplicationRoleRow
              key={value.applicationId}
              applicationId={value.applicationId}
              applicationName={options.find((option) => option.value === value.applicationId)?.label ?? "Application"}
              roleId={value.roleId}
              onRoleChange={(roleId, roleName) => setRole(value.applicationId, roleId, roleName)}
              onRemove={() => remove(value.applicationId)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ApplicationRoleRow({
  applicationId,
  applicationName,
  roleId,
  onRoleChange,
  onRemove,
}: {
  applicationId: string;
  applicationName: string;
  roleId: string;
  onRoleChange: (roleId: string, roleName?: string) => void;
  onRemove: () => void;
}) {
  const roles = useApplicationRoles(applicationId);
  const roleOptions = (roles.data?.data ?? []).map((role) => ({ value: role.id, label: role.name }));

  return (
    <div className="flex items-center gap-2 rounded-field border border-surface-border bg-surface-page px-3 py-2">
      <span className="flex-1 truncate text-sm font-medium text-ink-900">{applicationName}</span>
      <div className="w-40 shrink-0">
        <Select
          value={roleId}
          onChange={(event) => {
            const selected = roleOptions.find((role) => role.value === event.target.value);
            onRoleChange(event.target.value, selected?.label);
          }}
          options={roleOptions}
          placeholder={roles.isLoading ? "Loading…" : roles.isError ? "Failed to load" : "Select role"}
          disabled={roles.isLoading || roles.isError || !roleOptions.length}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-full p-1.5 text-ink-500 hover:bg-surface-border"
        aria-label={`Remove ${applicationName}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
