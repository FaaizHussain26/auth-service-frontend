function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  issuerUrl: required(process.env.NEXT_PUBLIC_ISSUER_URL, "NEXT_PUBLIC_ISSUER_URL"),
  apiOrigin: required(process.env.NEXT_PUBLIC_API_ORIGIN, "NEXT_PUBLIC_API_ORIGIN"),
  landingClientId: required(process.env.NEXT_PUBLIC_LANDING_CLIENT_ID, "NEXT_PUBLIC_LANDING_CLIENT_ID"),
  landingResource: required(process.env.NEXT_PUBLIC_LANDING_RESOURCE, "NEXT_PUBLIC_LANDING_RESOURCE"),
  adminClientId: required(process.env.NEXT_PUBLIC_ADMIN_CLIENT_ID, "NEXT_PUBLIC_ADMIN_CLIENT_ID"),
  adminResource: required(process.env.NEXT_PUBLIC_ADMIN_RESOURCE, "NEXT_PUBLIC_ADMIN_RESOURCE"),
  tenantClientId: required(process.env.NEXT_PUBLIC_TENANT_CLIENT_ID, "NEXT_PUBLIC_TENANT_CLIENT_ID"),
  tenantResource: required(process.env.NEXT_PUBLIC_TENANT_RESOURCE, "NEXT_PUBLIC_TENANT_RESOURCE"),
  scope: process.env.NEXT_PUBLIC_OIDC_SCOPE ?? "openid profile email offline_access",
};
