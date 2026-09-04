"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/shared/useApiClient";
import type { ChangePasswordInput, ListQuery, SessionRecord, UpdateProfileInput, User } from "@/lib/tenant/types";

export function useUpdateProfile() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => api.patch<User>("/tenant/v1/me", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useChangePassword() {
  const api = useApiClient();
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => api.post<{ changed: true }>("/tenant/v1/me/change-password", input),
  });
}

export function useMySessions(query: ListQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["my-sessions", query],
    queryFn: () => api.get<SessionRecord[]>("/tenant/v1/me/sessions", query),
  });
}

export function useRevokeMySession() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => api.delete<{ revoked: true }>(`/tenant/v1/me/sessions/${sessionId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-sessions"] }),
  });
}
