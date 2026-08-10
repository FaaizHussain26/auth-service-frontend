export interface TokenSet {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  obtained_at: number;
}

const TOKENS_KEY = "daxcore_tokens";
const VERIFIER_KEY = "daxcore_pkce_verifier";
const STATE_KEY = "daxcore_pkce_state";

export function saveTokens(tokens: TokenSet): void {
  sessionStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

export function loadTokens(): TokenSet | null {
  const raw = sessionStorage.getItem(TOKENS_KEY);
  return raw ? (JSON.parse(raw) as TokenSet) : null;
}

export function clearTokens(): void {
  sessionStorage.removeItem(TOKENS_KEY);
}

export function isExpired(tokens: TokenSet, skewSeconds = 30): boolean {
  const expiresAt = tokens.obtained_at + (tokens.expires_in - skewSeconds) * 1000;
  return Date.now() >= expiresAt;
}

export function savePkceVerifier(verifier: string, state: string): void {
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);
}

export function loadPkceVerifier(): { verifier: string | null; state: string | null } {
  return {
    verifier: sessionStorage.getItem(VERIFIER_KEY),
    state: sessionStorage.getItem(STATE_KEY),
  };
}

export function clearPkceVerifier(): void {
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
}
