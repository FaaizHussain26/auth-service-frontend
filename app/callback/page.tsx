"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

function CallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { handleCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const exchangeStarted = useRef(false);

  useEffect(() => {
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    const code = params.get("code");
    const state = params.get("state");
    const oauthError = params.get("error_description") ?? params.get("error");

    if (oauthError) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(oauthError);
      return;
    }
    if (!code || !state) {
      setError("Missing authorization code. Please sign in again.");
      return;
    }

    handleCallback(code, state)
      .then(() => router.replace("/dashboard"))
      .catch((err: Error) => setError(err.message));
  }, [params, handleCallback, router]);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-surface-page px-6 text-center">
        <p className="max-w-sm text-sm font-medium text-danger">{error}</p>
        <Button variant="secondary" onClick={() => router.replace("/login")}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-surface-page">
      <Spinner label="Completing sign-in…" />
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-surface-page">
          <Spinner />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
