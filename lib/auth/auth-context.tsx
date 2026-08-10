"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { beginLogin, buildEndSessionUrl, completeLogin, refreshAccessToken } from "./oidc-client";
import { clearTokens, isExpired, loadTokens, saveTokens, type TokenSet } from "./token-store";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  login: () => void;
  logout: () => void;
  handleCallback: (code: string, state: string) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [tokens, setTokens] = useState<TokenSet | null>(null);

  useEffect(() => {
    const stored = loadTokens();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTokens(stored);
    setStatus(stored ? "authenticated" : "unauthenticated");
  }, []);

  const login = useCallback(() => {
    void beginLogin();
  }, []);

  const logout = useCallback(() => {
    const idToken = tokens?.id_token;
    clearTokens();
    setTokens(null);
    setStatus("unauthenticated");
    window.location.assign(buildEndSessionUrl(idToken));
  }, [tokens]);

  const handleCallback = useCallback(async (code: string, state: string) => {
    const nextTokens = await completeLogin(code, state);
    saveTokens(nextTokens);
    setTokens(nextTokens);
    setStatus("authenticated");
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const current = loadTokens();
    if (!current) return null;
    if (!isExpired(current)) return current.access_token;
    if (!current.refresh_token) {
      clearTokens();
      setStatus("unauthenticated");
      return null;
    }
    const refreshed = await refreshAccessToken(current.refresh_token);
    saveTokens(refreshed);
    setTokens(refreshed);
    return refreshed.access_token;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, login, logout, handleCallback, getAccessToken }),
    [status, login, logout, handleCallback, getAccessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
