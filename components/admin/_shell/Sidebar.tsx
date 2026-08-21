"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/admin/nav-config";

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div
        onClick={onNavigate}
        className={cn(
          "fixed inset-0 z-30 bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-64 shrink-0 flex-col border-r border-surface-border bg-white transition-transform duration-200 ease-out",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-2 px-6 py-6">
          <Image src="/logo.webp" alt="Syncora" width={166} height={36} className="h-9 w-auto" />
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-field px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-brand-100 text-brand-700" : "text-ink-700 hover:bg-surface-page",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-surface-border px-4 py-4 text-xs text-ink-500">
          <p className="font-semibold text-ink-700">Syncora Admin</p>
          <p>Sync people, sync process.</p>
        </div>
      </aside>
    </>
  );
}
