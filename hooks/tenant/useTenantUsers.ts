"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/shared/useApiClient";
import type {
  Invitation,
  InviteMemberInput,
  ListQuery,
  Membership,
  MemberDetail,
  SessionRecord,
  UpdateProfileInput,
  User,
} from "@/lib/tenant/types";

// No `role` filter: this endpoint only ever returns members.
interface TenantUserListQuery extends ListQuery {
  status?: string;
  applicationId?: string;
}

export function useTenantUsers(query: TenantUserListQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["tenant-users", query],
    queryFn: () => api.get<Membership[]>("/tenant-admin/v1/users", query),
    placeholderData: keepPreviousData,
  });
}

export function useTenantUserDetail(userId: string | undefined) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["tenant-users", userId],
    queryFn: () => api.get<MemberDetail>(`/tenant-admin/v1/users/${userId}`),
    enabled: Boolean(userId),
  });
}

export function useTenantUserSessions(userId: string | undefined, query: ListQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["tenant-users", userId, "sessions", query],
    queryFn: () => api.get<SessionRecord[]>(`/tenant-admin/v1/users/${userId}/sessions`, query),
    enabled: Boolean(userId),
  });
}

export function useRevokeTenantUserSession(userId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => api.delete<{ revoked: true }>(`/tenant-admin/v1/users/${userId}/sessions/${sessionId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenant-users", userId, "sessions"] }),
  });
}

export function useTenantApplications() {
  const api = useApiClient();
  return useQuery({
    queryKey: ["tenant-applications"],
    queryFn: () => api.get<Array<{ id: string; name: string; clientId: string; hiddenFromPicker: boolean }>>("/tenant-admin/v1/applications"),
  });
}

export function useInviteTenantUser() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteMemberInput) => api.post<Invitation>("/tenant-admin/v1/users/invite", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenant-users"] }),
  });
}

export function useUpdateTenantUser(userId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => api.patch<User>(`/tenant-admin/v1/users/${userId}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenant-users"] }),
  });
}

export function useSuspendTenantUser() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.post<User>(`/tenant-admin/v1/users/${userId}/suspend`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenant-users"] }),
  });
}

export function useActivateTenantUser() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.post<User>(`/tenant-admin/v1/users/${userId}/activate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenant-users"] }),
  });
}

export function useForceTenantUserPasswordReset() {
  const api = useApiClient();
  return useMutation({
    mutationFn: (userId: string) => api.post<User>(`/tenant-admin/v1/users/${userId}/force-password-reset`),
  });
}

export function useGrantTenantUserApplication(userId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => api.put(`/tenant-admin/v1/users/${userId}/applications/${applicationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-users", userId] });
      queryClient.invalidateQueries({ queryKey: ["tenant-users"] });
    },
  });
}

export function useRevokeTenantUserApplication(userId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => api.delete(`/tenant-admin/v1/users/${userId}/applications/${applicationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-users", userId] });
      queryClient.invalidateQueries({ queryKey: ["tenant-users"] });
    },
  });
}
