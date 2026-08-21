"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { env } from "../env";
import { beginLogin, buildEndSessionUrl, completeLogin, refreshAccessToken } from "./oidc-client";
import {
  clearTokens,
  clearZone,
  isExpired,
  loadTokens,
  loadZone,
  saveTokens,
  saveZone,
  type TokenSet,
  type Zone,
} from "./token-store";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface MeResponse {
  isSuperadmin: boolean;
  membership: { tenantSlug: string; tenantName: string; role: string } | null;
}

interface Envelope<T> {
  data: T;
}

const ZONE_RESOLVERS: Array<{ match: (me: MeResponse) => boolean; zone: Zone }> = [
  { match: (me) => me.isSuperadmin, zone: "admin" },
  { match: (me) => Boolean(me.membership), zone: "tenant" },
];

function resolveZone(me: MeResponse): Zone | null {
  return ZONE_RESOLVERS.find((resolver) => resolver.match(me))?.zone ?? null;
}

interface AuthContextValue {
  status: AuthStatus;
  zone: Zone | null;
  login: () => void;
  logout: () => void;
  completeIdentity: (code: string, state: string) => Promise<void>;
  completeZone: (code: string, state: string) => Promise<Zone>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [tokens, setTokens] = useState<TokenSet | null>(null);
  const [zone, setZone] = useState<Zone | null>(null);

  useEffect(() => {
    const storedTokens = loadTokens();
    const storedZone = loadZone();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTokens(storedTokens);
    setZone(storedZone);
    setStatus(storedTokens && storedZone ? "authenticated" : "unauthenticated");
  }, []);

  const login = useCallback(() => {
    void beginLogin("landing");
  }, []);

  const logout = useCallback(() => {
    const idToken = tokens?.id_token;
    clearTokens();
    clearZone();
    setTokens(null);
    setZone(null);
    setStatus("unauthenticated");
    window.location.assign(buildEndSessionUrl(idToken));
  }, [tokens]);

  const completeIdentity = useCallback(async (code: string, state: string): Promise<void> => {
    const { tokens: identityTokens } = await completeLogin(code, state);

    const response = await fetch(`${env.apiOrigin}/landing/v1/me`, {
      headers: { Authorization: `Bearer ${identityTokens.access_token}` },
    });
    if (!response.ok) throw new Error("Could not verify your account. Please try again.");
    const { data: me }: Envelope<MeResponse> = await response.json();

    const resolvedZone = resolveZone(me);
    if (!resolvedZone) {
      throw new Error("Your account doesn't have access to any Syncora application. Contact your administrator.");
    }
    await beginLogin(resolvedZone);
  }, []);

  const completeZone = useCallback(async (code: string, state: string): Promise<Zone> => {
    const { tokens: zoneTokens, intent } = await completeLogin(code, state);
    const resolvedZone = intent as Zone;
    saveTokens(zoneTokens);
    saveZone(resolvedZone);
    setTokens(zoneTokens);
    setZone(resolvedZone);
    setStatus("authenticated");
    return resolvedZone;
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const current = loadTokens();
    const currentZone = loadZone();
    if (!current || !currentZone) return null;
    if (!isExpired(current)) return current.access_token;
    if (!current.refresh_token) {
      clearTokens();
      clearZone();
      setStatus("unauthenticated");
      return null;
    }
    const refreshed = await refreshAccessToken(current.refresh_token, currentZone);
    saveTokens(refreshed);
    setTokens(refreshed);
    return refreshed.access_token;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, zone, login, logout, completeIdentity, completeZone, getAccessToken }),
    [status, zone, login, logout, completeIdentity, completeZone, getAccessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
