"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import type { Zone } from "@/lib/auth/token-store";

const HOME_BY_ZONE: Record<Zone, string> = {
  admin: "/admin/dashboard",
  tenant: "/tenant/applications",
};

export default function RootPage() {
  const router = useRouter();
  const { status, zone, login } = useAuth();

  useEffect(() => {
    const dispatch: Record<typeof status, () => void> = {
      checking: () => undefined,
      unauthenticated: () => login(),
      authenticated: () => {
        if (!zone) return;
        router.replace(HOME_BY_ZONE[zone]);
      },
    };
    dispatch[status]();
  }, [status, zone, login, router]);

  return <LoadingScreen />;
}
