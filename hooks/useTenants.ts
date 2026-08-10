"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./useApiClient";
import type {
  CreateTenantInput,
  CreateTenantResult,
  Invitation,
  InviteMemberInput,
  ListQuery,
  Membership,
  Tenant,
  TenantDetail,
  UpdateTenantInput,
} from "@/lib/types";

interface TenantListQuery extends ListQuery {
  status?: string;
  kind?: string;
  applicationId?: string;
}

export function useTenants(query: TenantListQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["tenants", query],
    queryFn: () => api.get<Tenant[]>("/admin/v1/tenants", query),
    placeholderData: keepPreviousData,
  });
}

export function useAllTenants() {
  const api = useApiClient();
  return useQuery({
    queryKey: ["tenants", "all"],
    queryFn: () => api.get<Tenant[]>("/admin/v1/tenants", { all: true }),
  });
}

export function useTenant(id: string | undefined) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["tenants", id],
    queryFn: () => api.get<TenantDetail>(`/admin/v1/tenants/${id}`),
    enabled: Boolean(id),
  });
}

export function useTenantMembers(tenantId: string | undefined, query: ListQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["tenants", tenantId, "members", query],
    queryFn: () => api.get<Membership[]>(`/admin/v1/tenants/${tenantId}/members`, query),
    enabled: Boolean(tenantId),
  });
}

export function useCreateTenant() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTenantInput) => api.post<CreateTenantResult>("/admin/v1/tenants", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenants"] }),
  });
}

export function useUpdateTenant(id: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTenantInput) => api.patch<Tenant>(`/admin/v1/tenants/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenants"] }),
  });
}

export function useSuspendTenant() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Tenant>(`/admin/v1/tenants/${id}/suspend`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenants"] }),
  });
}

export function useActivateTenant() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Tenant>(`/admin/v1/tenants/${id}/activate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenants"] }),
  });
}

export function useInviteTenantMember(tenantId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteMemberInput) => api.post<Invitation>(`/admin/v1/tenants/${tenantId}/invitations`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenants", tenantId, "members"] }),
  });
}
