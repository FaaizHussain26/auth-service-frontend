import { jwtDecode } from "jwt-decode";

export interface AccessTokenClaims {
  sub?: string;
  email?: string;
  name?: string;
  org_id?: string;
  org_slug?: string;
  org_name?: string;
  org_role?: string;
}

export function decodeClaims(token: string): AccessTokenClaims {
  try {
    return jwtDecode<AccessTokenClaims>(token);
  } catch {
    return {};
  }
}
