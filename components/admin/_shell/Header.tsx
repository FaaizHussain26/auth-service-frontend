"use client";

import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { NAV_ITEMS } from "@/lib/admin/nav-config";
import { useAuth } from "@/lib/auth/auth-context";
import { Avatar } from "@/components/ui/Avatar";
import type { CurrentUser } from "@/lib/admin/types";

function pageTitleFor(pathname: string): string {
  const match = NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return match?.label ?? "Dashboard";
}

export function Header({ currentUser, onMenuClick }: { currentUser: CurrentUser; onMenuClick: () => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-surface-border bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-field text-ink-700 hover:bg-surface-page lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="hidden text-xs text-ink-500 sm:block">Syncora Admin</p>
          <h1 className="truncate text-base font-semibold text-ink-900">{pageTitleFor(pathname)}</h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="hidden text-right md:block">
          <p className="max-w-[220px] truncate text-sm font-medium text-ink-900">{currentUser.email}</p>
          <p className="text-xs text-ink-500">Superadmin</p>
        </div>
        <Avatar seed={currentUser.email} size={38} />
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-field border border-surface-border px-2.5 py-2 text-xs font-semibold text-ink-700 transition-colors hover:bg-surface-page sm:px-3"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
