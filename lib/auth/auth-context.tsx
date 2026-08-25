"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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

interface ZoneClaims {
  is_superadmin?: boolean;
  tenant_slug?: string;
  tenant_name?: string;
  tenant_role?: string;
}

const ZONE_RESOLVERS: Array<{ match: (claims: ZoneClaims) => boolean; zone: Zone }> = [
  { match: (claims) => Boolean(claims.is_superadmin), zone: "admin" },
  { match: (claims) => Boolean(claims.tenant_slug), zone: "tenant" },
];

function resolveZone(claims: ZoneClaims): Zone | null {
  return ZONE_RESOLVERS.find((resolver) => resolver.match(claims))?.zone ?? null;
}

function decodeIdTokenClaims(idToken: string | undefined): ZoneClaims {
  const payload = idToken?.split(".")[1];
  if (!payload) return {};
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(normalized));
}

interface AuthContextValue {
  status: AuthStatus;
  zone: Zone | null;
  login: () => void;
  logout: () => void;
  completeIdentity: (code: string, state: string) => Promise<Zone | undefined>;
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
    void beginLogin("admin");
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

  const completeIdentity = useCallback(async (code: string, state: string): Promise<Zone | undefined> => {
    const { tokens: adminTokens } = await completeLogin(code, state);
    const claims = decodeIdTokenClaims(adminTokens.id_token);
    const resolvedZone = resolveZone(claims);

    if (resolvedZone === "admin") {
      saveTokens(adminTokens);
      saveZone("admin");
      setTokens(adminTokens);
      setZone("admin");
      setStatus("authenticated");
      return "admin";
    }
    if (resolvedZone === "tenant") {
      await beginLogin("tenant");
      return undefined;
    }
    throw new Error("Your account doesn't have access to any Syncora application. Contact your administrator.");
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
