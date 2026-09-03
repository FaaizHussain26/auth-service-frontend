"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/shared/useApiClient";
import type { CreateTicketInput, ListQuery, Ticket, TicketComment } from "@/lib/tenant/types";

interface TicketListQuery extends ListQuery {
  status?: string;
  applicationId?: string;
  from?: string;
  to?: string;
}

export function useTickets(query: TicketListQuery) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["tenant-tickets", query],
    queryFn: () => api.get<Ticket[]>("/tenant/v1/tickets", query),
    placeholderData: keepPreviousData,
  });
}

export function useTicket(id: string | undefined) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["tenant-tickets", id],
    queryFn: () => api.get<Ticket>(`/tenant/v1/tickets/${id}`),
    enabled: Boolean(id),
  });
}

export function useTicketComments(id: string | undefined) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["tenant-tickets", id, "comments"],
    queryFn: () => api.get<TicketComment[]>(`/tenant/v1/tickets/${id}/comments`),
    enabled: Boolean(id),
  });
}

export function useCreateTicket() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTicketInput) => api.post<Ticket>("/tenant/v1/tickets", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenant-tickets"] }),
  });
}

export function useAddTicketComment(id: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api.post<TicketComment>(`/tenant/v1/tickets/${id}/comments`, { body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenant-tickets", id, "comments"] }),
  });
}
