"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Boxes, Building2, KeyRound, ScrollText, Users } from "lucide-react";
import { useTenants, useAllTenants } from "@/hooks/useTenants";
import { useApplications, useAllApplications } from "@/hooks/useApplications";
import { useUsers, useAllUsers } from "@/hooks/useUsers";
import { useSigningKeys } from "@/hooks/useKeys";
import { useAuditLog } from "@/hooks/useAudit";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  StatusBarChart,
  type ChartTone,
} from "@/components/dashboard/StatusBarChart";
import { CompositionBar } from "@/components/dashboard/CompositionBar";
import { ActivityTrendChart } from "@/components/dashboard/ActivityTrendChart";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import {
  TENANT_STATUS_OPTIONS,
  USER_STATUS_BADGE,
  USER_STATUS_OPTIONS,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import type { ApplicationStatus } from "@/lib/types";

const APPLICATION_STATUS_OPTIONS: {
  value: ApplicationStatus;
  label: string;
}[] = [
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
];

function toneFor(status: string): ChartTone {
  return USER_STATUS_BADGE[status]?.tone ?? "neutral";
}

function countBy<T extends string>(
  items: { status: T }[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items)
    counts[item.status] = (counts[item.status] ?? 0) + 1;
  return counts;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export default function DashboardPage() {
  const tenants = useTenants({ limit: 1 });
  const applications = useApplications({ limit: 1 });
  const users = useUsers({ limit: 1 });
  const keys = useSigningKeys();
  const audit = useAuditLog({});

  const allTenants = useAllTenants();
  const allApplications = useAllApplications();
  const allUsers = useAllUsers();

  const sevenDaysAgo = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 6);
    return date;
  }, []);
  const trendAudit = useAuditLog({
    from: sevenDaysAgo.toISOString(),
    limit: 200,
  });

  const currentKeys = (keys.data?.data ?? []).filter(
    (key) => key.status === "current",
  ).length;
  const recentEvents = (audit.data?.data ?? []).slice(0, 8);

  const tenantStatusCounts = countBy(allTenants.data?.data ?? []);
  const tenantKindCounts: Record<string, number> = {};
  for (const tenant of allTenants.data?.data ?? []) {
    tenantKindCounts[tenant.kind] = (tenantKindCounts[tenant.kind] ?? 0) + 1;
  }
  const userStatusCounts = countBy(allUsers.data?.data ?? []);
  const applicationStatusCounts = countBy(allApplications.data?.data ?? []);

  const trendDays = Array.from(
    { length: 7 },
    (_, index) => new Date(sevenDaysAgo.getTime() + index * DAY_MS),
  );
  const eventsPerDay = trendDays.map((date) => {
    const dayKey = date.toDateString();
    const value = (trendAudit.data?.data ?? []).filter(
      (entry) => new Date(entry.occurredAt).toDateString() === dayKey,
    ).length;
    return {
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      dateLabel: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value,
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Building2}
          label="Total Tenants"
          value={tenants.data?.meta?.total ?? "—"}
          sublabel="Provisioned organizations"
          tone="brand"
        />
        <StatCard
          icon={Boxes}
          label="Applications"
          value={applications.data?.meta?.total ?? "—"}
          sublabel="Registered OIDC clients"
          tone="blue"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={users.data?.meta?.total ?? "—"}
          sublabel="Across all tenants"
          tone="green"
        />
        <StatCard
          icon={KeyRound}
          label="Signing Keys"
          value={currentKeys}
          sublabel="Currently active"
          tone="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <StatusBarChart
          title="Tenants by status"
          data={TENANT_STATUS_OPTIONS.map((option) => ({
            label: option.label,
            value: tenantStatusCounts[option.value] ?? 0,
            tone: toneFor(option.value),
          }))}
        />
        <CompositionBar
          title="Tenants by kind"
          segments={[
            {
              label: "Organization",
              value: tenantKindCounts.organization ?? 0,
              color: "var(--brand-600)",
            },
            {
              label: "Individual",
              value: tenantKindCounts.individual ?? 0,
              color: "#2563eb",
            },
          ]}
        />
        <StatusBarChart
          title="Users by status"
          data={USER_STATUS_OPTIONS.map((option) => ({
            label: option.label,
            value: userStatusCounts[option.value] ?? 0,
            tone: toneFor(option.value),
          }))}
        />
        <StatusBarChart
          title="Applications by status"
          data={APPLICATION_STATUS_OPTIONS.map((option) => ({
            label: option.label,
            value: applicationStatusCounts[option.value] ?? 0,
            tone: toneFor(option.value),
          }))}
        />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ActivityTrendChart
          title="Activity — last 7 days"
          data={eventsPerDay}
        />

        <Card className="flex h-full flex-col p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-900">
              Recent activity
            </h2>
            <Link
              href="/audit"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View audit log
            </Link>
          </div>

          {audit.isLoading ? <Spinner /> : null}
          {!audit.isLoading && !recentEvents.length ? (
            <p className="py-8 text-center text-sm text-ink-500">
              No activity recorded yet.
            </p>
          ) : null}
          {!audit.isLoading && recentEvents.length ? (
            <ul className="divide-y divide-surface-border">
              {recentEvents.map((entry, index) => (
                <li
                  key={index}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <ScrollText className="h-4 w-4 shrink-0 text-ink-500" />
                    <span className="truncate font-medium text-ink-900">
                      {entry.event}
                    </span>
                    <span className="shrink-0 text-ink-500">
                      {entry.actorType}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-ink-500">
                    {formatDateTime(entry.occurredAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
