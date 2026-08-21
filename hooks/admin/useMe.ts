"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/shared/useApiClient";
import type { CurrentUser } from "@/lib/admin/types";

export function useMe() {
  const api = useApiClient();
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get<CurrentUser>("/admin/v1/me")).data,
    retry: false,
  });
}
