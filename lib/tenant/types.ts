export * from "@/lib/types";

export type UserStatus = "active" | "suspended" | "pending";
export type MembershipRole = "admin" | "member";
export type MembershipStatus = "invited" | "active" | "suspended";

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  status: UserStatus;
  isSuperadmin: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
}

export interface MeResponse {
  user: User;
  tenant: TenantSummary | null;
  role: MembershipRole;
}

export interface MyApplication {
  id: string;
  name: string;
  clientId: string;
  baseDomain: string | null;
  logoUrl: string | null;
  status: "active" | "disabled";
  hiddenFromPicker: boolean;
}

export interface MyApplicationsResponse {
  tenantSlug: string | null;
  applications: MyApplication[];
}

export interface UpdateProfileInput {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface Membership {
  id: string;
  userId: string;
  tenantId: string;
  status: MembershipStatus;
  role: MembershipRole;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface MemberApplication {
  id: string;
  name: string;
  clientId: string;
}

export interface MemberDetail extends User {
  membership: {
    id: string;
    role: MembershipRole;
    status: MembershipStatus;
  };
  applications: MemberApplication[];
}

export interface SessionRecord {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  revokedAt: string | null;
  isCurrent: boolean;
}

export interface InviteApplicationRoleValue {
  applicationId: string;
  roleId: string;
  roleName?: string;
}

export interface InviteMemberInput {
  email: string;
  applications?: InviteApplicationRoleValue[];
}

export interface Invitation {
  id: string;
  tenantId: string;
  email: string;
  applicationRoles: InviteApplicationRoleValue[];
  role: MembershipRole;
  expiresAt: string;
}

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketCommentAuthorType = "tenant_user" | "admin";

export interface TicketAuthorSummary {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface TicketApplicationSummary {
  id: string;
  name: string;
}

export interface Ticket {
  id: string;
  tenantId: string;
  createdByUserId: string;
  createdByUser: TicketAuthorSummary | null;
  applicationId: string;
  application: TicketApplicationSummary | null;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorUserId: string;
  authorUser: TicketAuthorSummary | null;
  authorType: TicketCommentAuthorType;
  body: string;
  createdAt: string;
}

export interface CreateTicketInput {
  applicationId: string;
  subject: string;
  description: string;
}

export interface AuditLogEntry {
  id?: string;
  actorType: string;
  actorId: string | null;
  actorEmail: string | null;
  actorName: string | null;
  tenantId: string | null;
  event: string;
  targetType: string | null;
  targetId: string | null;
  targetEmail: string | null;
  targetName: string | null;
  ip: string | null;
  userAgent: string | null;
  method: string | null;
  path: string | null;
  data: Record<string, unknown> | null;
  occurredAt: string;
}
