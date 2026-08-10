import { env } from "../env";
import { challengeFromVerifier, randomState, randomVerifier } from "./pkce";
import { savePkceVerifier, loadPkceVerifier, clearPkceVerifier, type TokenSet } from "./token-store";

function redirectUri(): string {
  return `${window.location.origin}/callback`;
}

export async function beginLogin(): Promise<void> {
  const verifier = randomVerifier();
  const state = randomState();
  const challenge = await challengeFromVerifier(verifier);
  savePkceVerifier(verifier, state);

  const url = new URL(`${env.issuerUrl}/auth`);
  url.searchParams.set("client_id", env.clientId);
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", env.scope);
  url.searchParams.set("resource", env.apiResource);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", state);

  window.location.assign(url.toString());
}

export async function completeLogin(code: string, receivedState: string): Promise<TokenSet> {
  const { verifier, state } = loadPkceVerifier();
  if (!verifier || state !== receivedState) {
    throw new Error("Login session expired or state mismatch. Please sign in again.");
  }
  clearPkceVerifier();

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: env.clientId,
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

  return { ...payload, obtained_at: Date.now() };
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenSet> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: env.clientId,
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
