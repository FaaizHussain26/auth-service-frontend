"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/shared/useApiClient";
import type { CreateReleaseNoteInput, ListQuery, ReleaseNote, ReleaseNoteStatus, UpdateReleaseNoteInput } from "@/lib/admin/types";

interface ReleaseNoteListQuery extends ListQuery {
  applicationId?: string;
  status?: ReleaseNoteStatus;
}

export function useReleaseNotes(query: ReleaseNoteListQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["release-notes", query],
    queryFn: () => api.get<ReleaseNote[]>("/admin/v1/release-notes", query),
    placeholderData: keepPreviousData,
  });
}

export function useReleaseNote(id: string | undefined) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["release-notes", id],
    queryFn: () => api.get<ReleaseNote>(`/admin/v1/release-notes/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateReleaseNote() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReleaseNoteInput) => api.post<ReleaseNote>("/admin/v1/release-notes", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["release-notes"] }),
  });
}

export function useUpdateReleaseNote(id: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateReleaseNoteInput) => api.patch<ReleaseNote>(`/admin/v1/release-notes/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["release-notes", id] });
      queryClient.invalidateQueries({ queryKey: ["release-notes"] });
    },
  });
}

export function useDeleteReleaseNote() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ id: string }>(`/admin/v1/release-notes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["release-notes"] }),
  });
}

export function useSendTestReleaseNote(id: string) {
  const api = useApiClient();
  return useMutation({
    mutationFn: () => api.post<{ sentTo: string }>(`/admin/v1/release-notes/${id}/test`),
  });
}

export function useSendReleaseNote(id: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<ReleaseNote>(`/admin/v1/release-notes/${id}/send`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["release-notes", id] });
      queryClient.invalidateQueries({ queryKey: ["release-notes"] });
    },
  });
}
