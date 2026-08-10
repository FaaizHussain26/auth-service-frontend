"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "./useApiClient";
import type { CurrentUser } from "@/lib/types";

export function useMe() {
  const api = useApiClient();
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get<CurrentUser>("/admin/v1/me")).data,
    retry: false,
  });
}
