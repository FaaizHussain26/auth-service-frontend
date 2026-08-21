export const CLIENT_TYPE_OPTIONS = [
  { value: "public", label: "Public (SPA / mobile, no client secret)" },
  { value: "confidential", label: "Confidential (server-side, uses client secret)" },
] as const;

export const GRANT_TYPE_OPTIONS = [
  { value: "authorization_code", label: "Authorization Code" },
  { value: "refresh_token", label: "Refresh Token" },
  { value: "client_credentials", label: "Client Credentials" },
] as const;

export const SCOPE_OPTIONS = [
  { value: "openid", label: "openid — required for OIDC sign-in" },
  { value: "email", label: "email — include email claim" },
  { value: "profile", label: "profile — include name/profile claims" },
  { value: "offline_access", label: "offline_access — issue refresh tokens" },
  { value: "tenants:read", label: "tenants:read — read tenant records" },
  { value: "invite:users", label: "invite:users — invite tenant members" },
] as const;

export const TENANT_KIND_OPTIONS = [
  { value: "organization", label: "Organization" },
  { value: "individual", label: "Individual" },
] as const;

export const TENANT_STATUS_OPTIONS = [
  { value: "provisioning", label: "Provisioning" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "failed", label: "Failed" },
] as const;

export const MEMBERSHIP_ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
] as const;

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
  provisioning: { label: "Provisioning", tone: "warning" },
  failed: { label: "Failed", tone: "danger" },
  disabled: { label: "Disabled", tone: "danger" },
};

export const KEY_STATUS_BADGE: Record<string, { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  current: { label: "Current", tone: "success" },
  next: { label: "Next", tone: "warning" },
  retired: { label: "Retired", tone: "neutral" },
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
