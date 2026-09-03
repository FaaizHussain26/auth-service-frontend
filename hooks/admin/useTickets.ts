"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/shared/useApiClient";
import type { ListQuery, Ticket, TicketComment, TicketStatus } from "@/lib/admin/types";

interface TicketListQuery extends ListQuery {
  status?: string;
  tenantId?: string;
  applicationId?: string;
  from?: string;
  to?: string;
}

export function useTickets(query: TicketListQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["admin-tickets", query],
    queryFn: () => api.get<Ticket[]>("/admin/v1/tickets", query),
    placeholderData: keepPreviousData,
  });
}

export function useTicket(id: string | undefined) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["admin-tickets", id],
    queryFn: () => api.get<Ticket>(`/admin/v1/tickets/${id}`),
    enabled: Boolean(id),
  });
}

export function useTicketComments(id: string | undefined) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["admin-tickets", id, "comments"],
    queryFn: () => api.get<TicketComment[]>(`/admin/v1/tickets/${id}/comments`),
    enabled: Boolean(id),
  });
}

export function useUpdateTicketStatus(id: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: TicketStatus) => api.patch<Ticket>(`/admin/v1/tickets/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
  });
}

export function useAddTicketComment(id: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api.post<TicketComment>(`/admin/v1/tickets/${id}/comments`, { body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-tickets", id, "comments"] }),
  });
}
