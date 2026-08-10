function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  issuerUrl: required(process.env.NEXT_PUBLIC_ISSUER_URL, "NEXT_PUBLIC_ISSUER_URL"),
  clientId: required(process.env.NEXT_PUBLIC_CLIENT_ID, "NEXT_PUBLIC_CLIENT_ID"),
  apiResource: required(process.env.NEXT_PUBLIC_API_RESOURCE, "NEXT_PUBLIC_API_RESOURCE"),
  apiOrigin: required(process.env.NEXT_PUBLIC_API_ORIGIN, "NEXT_PUBLIC_API_ORIGIN"),
  scope: process.env.NEXT_PUBLIC_OIDC_SCOPE ?? "openid profile email offline_access",
};
