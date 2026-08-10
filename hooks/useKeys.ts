"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./useApiClient";
import type { SigningKey } from "@/lib/types";

export function useSigningKeys() {
  const api = useApiClient();
  return useQuery({
    queryKey: ["keys"],
    queryFn: () => api.get<SigningKey[]>("/admin/v1/keys"),
  });
}

export function useRotateKey() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ kid: string }>("/admin/v1/keys/rotate"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["keys"] }),
  });
}

export function usePromoteKey() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (kid: string) => api.post<{ promoted: string }>(`/admin/v1/keys/${kid}/promote`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["keys"] }),
  });
}

export function useRetireKey() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (kid: string) => api.post<{ retired: string }>(`/admin/v1/keys/${kid}/retire`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["keys"] }),
  });
}
