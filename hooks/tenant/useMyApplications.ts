"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/shared/useApiClient";
import type { MyApplicationsResponse } from "@/lib/tenant/types";

export function useMyApplications() {
  const api = useApiClient();
  return useQuery({
    queryKey: ["me", "applications"],
    queryFn: async () => (await api.get<MyApplicationsResponse>("/tenant/v1/me/applications")).data,
  });
}
