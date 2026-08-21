"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/shared/useApiClient";
import type { Application, CreateApplicationInput, CreateApplicationResult, ListQuery } from "@/lib/admin/types";

export function useApplications(query: ListQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["applications", query],
    queryFn: () => api.get<Application[]>("/admin/v1/applications", query),
    placeholderData: keepPreviousData,
  });
}

export function useApplication(id: string | undefined) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["applications", id],
    queryFn: () => api.get<Application>(`/admin/v1/applications/${id}`),
    enabled: Boolean(id),
  });
}

export function useAllApplications() {
  const api = useApiClient();
  return useQuery({
    queryKey: ["applications", "all"],
    queryFn: () => api.get<Application[]>("/admin/v1/applications", { all: true }),
  });
}

export function useCreateApplication() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateApplicationInput) => api.post<CreateApplicationResult>("/admin/v1/applications", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });
}

export function useUpdateApplication(id: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CreateApplicationInput>) => api.patch<Application>(`/admin/v1/applications/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });
}

export function useDisableApplication() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Application>(`/admin/v1/applications/${id}/disable`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });
}

export function useActivateApplication() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Application>(`/admin/v1/applications/${id}/activate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });
}

export function useRotateApplicationSecret() {
  const api = useApiClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ clientSecret: string }>(`/admin/v1/applications/${id}/rotate-secret`),
  });
}
