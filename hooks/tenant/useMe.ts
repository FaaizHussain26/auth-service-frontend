"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/shared/useApiClient";
import type { MeResponse } from "@/lib/tenant/types";

export function useMe() {
  const api = useApiClient();
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get<MeResponse>("/tenant/v1/me")).data,
    retry: false,
  });
}
