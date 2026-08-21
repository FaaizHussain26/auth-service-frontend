"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { createApiClient } from "@/lib/api-client";

export function useApiClient() {
  const { getAccessToken } = useAuth();
  return useMemo(() => createApiClient(getAccessToken), [getAccessToken]);
}
