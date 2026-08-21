export type SortOrder = "ASC" | "DESC";

export interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  all?: boolean;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  metadata: PaginationMeta | null;
  message: string;
  data: T;
}
