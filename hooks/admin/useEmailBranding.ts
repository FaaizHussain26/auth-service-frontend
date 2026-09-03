"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/shared/useApiClient";
import type { ApplicationEmailSettings, UpsertEmailSettingsInput } from "@/lib/admin/types";

export function useEmailBranding(applicationId: string | undefined) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["email-branding", applicationId],
    queryFn: () => api.get<ApplicationEmailSettings>(`/admin/v1/applications/${applicationId}/email-settings`),
    enabled: Boolean(applicationId),
  });
}

export function useSaveEmailBranding(applicationId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertEmailSettingsInput) =>
      api.put<ApplicationEmailSettings>(`/admin/v1/applications/${applicationId}/email-settings`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["email-branding", applicationId] }),
  });
}
