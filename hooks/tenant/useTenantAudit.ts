"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/shared/useApiClient";
import type { AuditLogEntry } from "@/lib/tenant/types";

interface TenantAuditQuery {
  userId?: string;
  applicationId?: string;
  event?: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}

export function useTenantAuditLog(query: TenantAuditQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["tenant-audit", query],
    queryFn: () => api.get<AuditLogEntry[]>("/tenant-admin/v1/audit", query),
  });
}
