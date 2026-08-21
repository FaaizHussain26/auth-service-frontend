import { env } from "../env";
import { challengeFromVerifier, randomState, randomVerifier } from "./pkce";
import {
  savePkceVerifier,
  loadPkceVerifier,
  clearPkceVerifier,
  saveLoginIntent,
  loadLoginIntent,
  clearLoginIntent,
  type TokenSet,
  type LoginIntent,
  type Zone,
} from "./token-store";

interface ClientProfile {
  clientId: string;
  resource: string;
  scope: string;
}

const CLIENT_PROFILES: Record<LoginIntent, ClientProfile> = {
  landing: { clientId: env.landingClientId, resource: env.landingResource, scope: "openid profile email" },
  admin: { clientId: env.adminClientId, resource: env.adminResource, scope: env.scope },
  tenant: { clientId: env.tenantClientId, resource: env.tenantResource, scope: env.scope },
};

function redirectUri(): string {
  return `${window.location.origin}/callback`;
}

export async function beginLogin(intent: LoginIntent): Promise<void> {
  const profile = CLIENT_PROFILES[intent];
  const verifier = randomVerifier();
  const state = randomState();
  const challenge = await challengeFromVerifier(verifier);
  savePkceVerifier(verifier, state);
  saveLoginIntent(intent);

  const url = new URL(`${env.issuerUrl}/auth`);
  url.searchParams.set("client_id", profile.clientId);
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", profile.scope);
  url.searchParams.set("resource", profile.resource);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", state);

  window.location.replace(url.toString());
}

export async function completeLogin(
  code: string,
  receivedState: string,
): Promise<{ tokens: TokenSet; intent: LoginIntent }> {
  const { verifier, state } = loadPkceVerifier();
  const intent = loadLoginIntent();
  if (!verifier || !intent || state !== receivedState) {
    throw new Error("Login session expired or state mismatch. Please sign in again.");
  }
  clearPkceVerifier();
  clearLoginIntent();

  const profile = CLIENT_PROFILES[intent];
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: profile.clientId,
    redirect_uri: redirectUri(),
    code,
    code_verifier: verifier,
  });

  const response = await fetch(`${env.issuerUrl}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error_description ?? payload.error ?? "Sign-in failed");
  }

  return { tokens: { ...payload, obtained_at: Date.now() }, intent };
}

export async function refreshAccessToken(refreshToken: string, zone: Zone): Promise<TokenSet> {
  const profile = CLIENT_PROFILES[zone];
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: profile.clientId,
    refresh_token: refreshToken,
  });

  const response = await fetch(`${env.issuerUrl}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error_description ?? payload.error ?? "Session refresh failed");
  }

  return { ...payload, obtained_at: Date.now() };
}

export function buildEndSessionUrl(idToken: string | undefined): string {
  const url = new URL(`${env.issuerUrl}/session/end`);
  url.searchParams.set("post_logout_redirect_uri", `${window.location.origin}/`);
  if (idToken) url.searchParams.set("id_token_hint", idToken);
  return url.toString();
}
