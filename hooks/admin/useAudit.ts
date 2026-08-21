"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/shared/useApiClient";
import type { AuditLogEntry } from "@/lib/admin/types";

interface AuditQuery {
  tenantId?: string;
  userId?: string;
  applicationId?: string;
  event?: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}

export function useAuditLog(query: AuditQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["audit", query],
    queryFn: () => api.get<AuditLogEntry[]>("/admin/v1/audit", query),
  });
}
