"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/shared/useApiClient";
import type { PlatformEmailSettings, UpsertPlatformEmailSettingsInput } from "@/lib/admin/types";

export function usePlatformEmailBranding(enabled: boolean) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["platform-email-settings"],
    queryFn: () => api.get<PlatformEmailSettings>("/admin/v1/platform-email-settings"),
    enabled,
  });
}

export function useSavePlatformEmailBranding() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertPlatformEmailSettingsInput) =>
      api.put<PlatformEmailSettings>("/admin/v1/platform-email-settings", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform-email-settings"] }),
  });
}

export function useUploadPlatformLogo() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.postForm<PlatformEmailSettings>("/admin/v1/platform-email-settings/logo", formData);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform-email-settings"] }),
  });
}
