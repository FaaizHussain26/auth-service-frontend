"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "./useApiClient";

export interface AppRole {
  id: string;
  name: string;
}

/** Fetched live from the application itself (via DaxCore's proxy endpoint) — always current, including tenant-custom roles. */
export function useApplicationRoles(tenantId: string | undefined, applicationId: string | undefined) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["application-roles", tenantId, applicationId],
    queryFn: () => api.get<AppRole[]>(`/admin/v1/tenants/${tenantId}/applications/${applicationId}/roles`),
    enabled: Boolean(tenantId && applicationId),
    staleTime: 60_000,
  });
}
