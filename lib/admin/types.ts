export * from "@/lib/types";

export type ClientType = "public" | "confidential";

export type ApplicationStatus = "active" | "disabled";

export type TenantKind = "organization" | "individual";

export type TenantStatus = "provisioning" | "active" | "suspended" | "failed";

export type MembershipRole = "admin" | "member";

export type MembershipStatus = "invited" | "active" | "suspended";

export type UserStatus = "active" | "suspended" | "pending";

export type KeyStatus = "next" | "current" | "retired";

export interface Application {
  id: string;
  clientId: string;
  name: string;
  clientType: ClientType;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  grantTypes: string[];
  scopes: string[];
  resourceIndicator: string | null;
  backchannelLogoutUri: string | null;
  firstParty: boolean;
  requiresOrg: boolean;
  webhookUrl: string | null;
  baseDomain: string | null;
  logoUrl: string | null;
  rolesEndpointPath: string;
  hiddenFromPicker: boolean;
  autoGrant: boolean;
  isSystem: boolean;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  /** Only present on list responses — whether this application has custom email branding saved. */
  hasEmailBranding?: boolean;
}

export interface CreateApplicationInput {
  name: string;
  clientType: ClientType;
  redirectUris?: string[];
  postLogoutRedirectUris?: string[];
  grantTypes?: string[];
  scopes?: string[];
  resourceIndicator?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  baseDomain?: string;
  logoUrl?: string;
  rolesEndpointPath?: string;
}

export interface CreateApplicationResult {
  application: Application;
  clientSecret: string | null;
  webhookSecret: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  kind: TenantKind;
  status: TenantStatus;
  contactEmail: string | null;
  phoneNumber: string | null;
  website: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantDetail extends Tenant {
  applications: Application[];
  totalApplications: number;
  totalUsers: number;
}

export interface CreateTenantInput {
  name: string;
  kind: TenantKind;
  applicationIds: string[];
  firstUser: {
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
  contactEmail?: string;
  phoneNumber?: string;
  website?: string;
  address?: string;
}

export interface CreateTenantResult {
  tenant: Tenant;
  temporaryPassword: string | null;
  emailSent: boolean;
  domains: string[];
}

export interface UpdateTenantInput {
  name?: string;
  kind?: TenantKind;
  contactEmail?: string;
  phoneNumber?: string;
  website?: string;
  address?: string;
  applicationIds?: string[];
}

export interface UserTenantSummary {
  id: string;
  name: string;
  slug: string;
  kind: TenantKind;
  status: TenantStatus;
}

export interface UserApplicationSummary {
  id: string;
  name: string;
  clientId: string;
}

export interface UserMembership {
  id: string;
  role: MembershipRole;
  status: MembershipStatus;
  tenant: UserTenantSummary;
  applications: UserApplicationSummary[];
}

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  status: UserStatus;
  isActive: boolean;
  isAccepted: boolean;
  isSuperadmin: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  passwordUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  tenants?: UserTenantSummary[];
}

export interface UserDetail extends User {
  memberships: UserMembership[];
}

export interface CreateUserInput {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isSuperadmin?: boolean;
}

export interface CreateUserResult {
  user: User;
  temporaryPassword: string;
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

export interface InviteApplicationRoleValue {
  applicationId: string;
  roleId: string;
  roleName?: string;
}

export interface InviteMemberInput {
  email: string;
  role?: MembershipRole;
  applications?: InviteApplicationRoleValue[];
}

export interface Invitation {
  id: string;
  tenantId: string;
  email: string;
  applicationRoles: InviteApplicationRoleValue[];
  role: MembershipRole;
  invitedByUserId: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

export interface SigningKey {
  kid: string;
  alg: string;
  publicJwk: Record<string, unknown>;
  status: KeyStatus;
  notBefore: string | null;
  retiredAt: string | null;
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  uid: string;
  userId: string;
  authTime: number | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  revokedAt: string | null;
  revokedReason: string | null;
  isCurrent: boolean;
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

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketCommentAuthorType = "tenant_user" | "admin";

export interface TicketAuthorSummary {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface TicketTenantSummary {
  id: string;
  name: string;
  slug: string;
}

export interface TicketApplicationSummary {
  id: string;
  name: string;
}

export interface Ticket {
  id: string;
  tenantId: string;
  tenant: TicketTenantSummary | null;
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

export interface CurrentUser {
  id: string;
  email: string;
  isSuperadmin: true;
}

export type ReleaseNoteStatus = "draft" | "sending" | "sent";

export interface ReleaseNoteApplicationSummary {
  id: string;
  name: string;
}

export interface ReleaseNote {
  id: string;
  applicationId: string;
  application: ReleaseNoteApplicationSummary | null;
  subject: string;
  contentHtml: string;
  status: ReleaseNoteStatus;
  createdByUserId: string;
  sentAt: string | null;
  recipientCount: number;
  deliveredCount: number;
  failedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReleaseNoteInput {
  applicationId: string;
  subject: string;
  contentHtml: string;
}

export interface UpdateReleaseNoteInput {
  applicationId?: string;
  subject?: string;
  contentHtml?: string;
}

export interface BrandingFields {
  fromName: string;
  fromAddress: string;
  replyToAddress: string | null;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  buttonLabel: string | null;
  buttonUrl: string | null;
  footerHtml: string;
  logoUrl: string | null;
}

export interface ApplicationEmailSettings extends BrandingFields {
  id: string | null;
  applicationId: string;
}

export interface PlatformEmailSettings extends BrandingFields {
  id: string | null;
}

export interface UpsertBrandingInput {
  fromName: string;
  fromAddress: string;
  replyToAddress?: string;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  buttonLabel?: string;
  buttonUrl?: string;
  footerHtml: string;
}

export type UpsertEmailSettingsInput = UpsertBrandingInput;
export type UpsertPlatformEmailSettingsInput = UpsertBrandingInput;
