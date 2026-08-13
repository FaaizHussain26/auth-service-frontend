"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/Button";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { status, login } = useAuth();
  const autoTriggered = useRef(false);
  const auto = params.get("auto") === "1";

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  useEffect(() => {
    if (auto && status === "unauthenticated" && !autoTriggered.current) {
      autoTriggered.current = true;
      login();
    }
  }, [auto, status, login]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page px-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-10 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.1)]">
        <Image src="/logo.webp" alt="Digital Auxilius" width={44} height={44} className="mb-7 h-11 w-auto" />
        <h1 className="mb-1 text-2xl font-medium text-ink-900">Admin console</h1>
        <p className="mb-8 text-sm text-ink-500">Sign in with your DaxCore account to continue.</p>
        <Button className="h-11 w-full" onClick={login} disabled={status === "checking" || auto}>
          Continue to sign in
        </Button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
