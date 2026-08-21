"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/shared/useApiClient";

export interface AppRole {
  id: string;
  name: string;
}

/** Fetched live from the application itself (via DaxCore's proxy endpoint) — always current, including tenant-custom roles. */
export function useApplicationRoles(applicationId: string | undefined) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["application-roles", applicationId],
    queryFn: () => api.get<AppRole[]>(`/tenant-admin/v1/applications/${applicationId}/roles`),
    enabled: Boolean(applicationId),
    staleTime: 60_000,
  });
}
