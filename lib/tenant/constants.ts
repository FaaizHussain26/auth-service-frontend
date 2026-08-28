export const USER_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "pending", label: "Pending" },
] as const;

export const USER_STATUS_BADGE: Record<string, { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  active: { label: "Active", tone: "success" },
  suspended: { label: "Suspended", tone: "danger" },
  pending: { label: "Pending", tone: "warning" },
  invited: { label: "Invited", tone: "warning" },
  disabled: { label: "Disabled", tone: "danger" },
};

export const TICKET_STATUS_BADGE: Record<string, { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  open: { label: "Open", tone: "warning" },
  in_progress: { label: "In progress", tone: "neutral" },
  resolved: { label: "Resolved", tone: "success" },
  closed: { label: "Closed", tone: "neutral" },
};

export const AVATAR_PALETTE = [
  "#34c3b9",
  "#6366f1",
  "#0ea5e9",
  "#16a34a",
  "#db2777",
  "#9333ea",
  "#d97706",
];

export function colorForString(value: string): string {
  const index = value
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_PALETTE[index % AVATAR_PALETTE.length];
}

export function initialsFor(...parts: Array<string | null | undefined>): string {
  const letters = parts
    .filter((part): part is string => Boolean(part && part.trim()))
    .map((part) => part.trim()[0]!.toUpperCase());
  return letters.length ? letters.slice(0, 2).join("") : "?";
}
