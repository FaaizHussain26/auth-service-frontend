"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/shared/useApiClient";
import type { ChangePasswordInput, UpdateProfileInput, User } from "@/lib/tenant/types";

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
