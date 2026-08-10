"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useMe } from "@/hooks/useMe";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status, logout } = useAuth();
  const me = useMe();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated") return <FullPageSpinner />;
  if (me.isLoading) return <FullPageSpinner />;

  if (me.isError || !me.data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-surface-page px-6 text-center">
        <ShieldAlert className="h-10 w-10 text-danger" />
        <div>
          <h1 className="text-lg font-semibold text-ink-900">Access restricted</h1>
          <p className="mt-1 max-w-sm text-sm text-ink-500">
            Your account doesn&apos;t have superadmin access to this console. Ask an administrator to grant access.
          </p>
        </div>
        <Button variant="secondary" onClick={logout}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface-page">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header currentUser={me.data} onMenuClick={() => setSidebarOpen((current) => !current)} />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">{children}</main>
      </div>
    </div>
  );
}

function FullPageSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-surface-page">
      <Spinner />
    </div>
  );
}
