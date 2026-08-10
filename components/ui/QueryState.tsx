import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Spinner } from "./Spinner";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";

export function QueryState({
  isLoading,
  isError,
  error,
  onRetry,
  isEmpty,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  children: ReactNode;
}) {
  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState message={error instanceof Error ? error.message : "Something went wrong"} onRetry={onRetry} />;
  if (isEmpty && emptyIcon && emptyTitle) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }
  return <>{children}</>;
}
