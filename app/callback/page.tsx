"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { loadLoginIntent, type LoginIntent, type Zone } from "@/lib/auth/token-store";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Button } from "@/components/ui/Button";

const HOME_BY_ZONE: Record<Zone, string> = {
  admin: "/admin/dashboard",
  tenant: "/tenant/applications",
};

const STATUS_BY_INTENT: Record<LoginIntent, string> = {
  landing: "Completing sign-in…",
  admin: "Loading your dashboard…",
  tenant: "Loading your dashboard…",
};

function minDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function CallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { completeIdentity, completeZone } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(STATUS_BY_INTENT.landing);
  const exchangeStarted = useRef(false);

  useEffect(() => {
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    const code = params.get("code");
    const state = params.get("state");
    const oauthError = params.get("error_description") ?? params.get("error");
    const intent = loadLoginIntent();

    if (oauthError) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(oauthError);
      return;
    }
    if (!code || !state || !intent) {
      setError("Missing authorization code. Please sign in again.");
      return;
    }

    setStatus(STATUS_BY_INTENT[intent]);

    const CALLBACK_HANDLERS: Record<LoginIntent, () => Promise<Zone | undefined>> = {
      landing: () => completeIdentity(code, state).then(() => undefined),
      admin: () => completeZone(code, state),
      tenant: () => completeZone(code, state),
    };

    Promise.all([CALLBACK_HANDLERS[intent](), minDelay(600)])
      .then(([zone]) => {
        if (!zone) return;
        router.replace(HOME_BY_ZONE[zone]);
      })
      .catch((err: Error) => setError(err.message));
  }, [params, completeIdentity, completeZone, router]);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-surface-page px-6 text-center">
        <p className="max-w-sm text-sm font-medium text-danger">{error}</p>
        <Button variant="secondary" onClick={() => router.replace("/signin-error")}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return <LoadingScreen tagline={status} />;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CallbackContent />
    </Suspense>
  );
}
