"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/Button";

export default function SignInErrorPage() {
  const { login } = useAuth();

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-surface-page px-6 text-center">
      <div>
        <h1 className="text-lg font-semibold text-ink-900">Sign-in didn&apos;t complete</h1>
        <p className="mt-1 max-w-sm text-sm text-ink-500">Something interrupted the sign-in process. Try again.</p>
      </div>
      <Button onClick={login}>Sign in again</Button>
    </div>
  );
}
