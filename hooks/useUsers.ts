"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./useApiClient";
import type { CreateUserInput, CreateUserResult, ListQuery, SessionRecord, User, UserDetail } from "@/lib/types";

interface UserListQuery extends ListQuery {
  status?: string;
  tenantId?: string;
  applicationId?: string;
}

export function useUsers(query: UserListQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["users", query],
    queryFn: () => api.get<User[]>("/admin/v1/users", query),
    placeholderData: keepPreviousData,
  });
}

export function useAllUsers() {
  const api = useApiClient();
  return useQuery({
    queryKey: ["users", "all"],
    queryFn: () => api.get<User[]>("/admin/v1/users", { all: true }),
  });
}

export function useUser(id: string | undefined) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => api.get<UserDetail>(`/admin/v1/users/${id}`),
    enabled: Boolean(id),
  });
}

export function useUserSessions(id: string | undefined, query: ListQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["users", id, "sessions", query],
    queryFn: () => api.get<SessionRecord[]>(`/admin/v1/users/${id}/sessions`, query),
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => api.post<CreateUserResult>("/admin/v1/users", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDisableUser() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<User>(`/admin/v1/users/${id}/disable`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useEnableUser() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<User>(`/admin/v1/users/${id}/enable`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useForcePasswordReset() {
  const api = useApiClient();
  return useMutation({
    mutationFn: (id: string) => api.post<User>(`/admin/v1/users/${id}/force-password-reset`),
  });
}

export function useRevokeUserSession(userId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => api.delete<{ revoked: true }>(`/admin/v1/users/${userId}/sessions/${sessionId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users", userId, "sessions"] }),
  });
}
