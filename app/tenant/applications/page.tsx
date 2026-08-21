"use client";

import { Boxes, ExternalLink } from "lucide-react";
import { useMyApplications } from "@/hooks/tenant/useMyApplications";
import { QueryState } from "@/components/ui/QueryState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import type { MyApplication } from "@/lib/tenant/types";

export default function ApplicationsPage() {
  const query = useMyApplications();
  const applications = query.data?.applications ?? [];
  const tenantSlug = query.data?.tenantSlug;

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-500">Applications you&apos;ve been granted access to.</p>

      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        isEmpty={applications.length === 0}
        emptyIcon={Boxes}
        emptyTitle="No applications yet"
        emptyDescription="Ask a tenant admin to grant you access to an application."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {applications.map((app) => (
            <ApplicationLaunchCard key={app.id} app={app} tenantSlug={tenantSlug ?? null} />
          ))}
        </div>
      </QueryState>
    </div>
  );
}

function ApplicationLaunchCard({ app, tenantSlug }: { app: MyApplication; tenantSlug: string | null }) {
  const launchUrl = tenantSlug && app.baseDomain ? `https://${tenantSlug}.${app.baseDomain}` : null;
  const disabled = app.status !== "active" || !launchUrl;

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center gap-3">
        {app.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={app.logoUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl object-contain" />
        ) : (
          <Avatar seed={app.name} size={44} />
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">{app.name}</p>
          <p className="truncate text-xs text-ink-500">{app.status === "active" ? "Active" : "Disabled"}</p>
        </div>
      </div>

      <Button
        variant={disabled ? "secondary" : "primary"}
        disabled={disabled}
        onClick={() => launchUrl && window.open(launchUrl, "_blank", "noopener,noreferrer")}
      >
        <ExternalLink className="h-4 w-4" />
        {app.status !== "active" ? "Application disabled" : launchUrl ? "Launch" : "No URL configured"}
      </Button>
    </Card>
  );
}
