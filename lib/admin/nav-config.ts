import { LayoutDashboard, Boxes, Building2, Users, KeyRound, LifeBuoy, ScrollText, Megaphone, Palette } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/applications", label: "Applications", icon: Boxes },
  { href: "/admin/tenants", label: "Tenants", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/tickets", label: "Support Tickets", icon: LifeBuoy },
  { href: "/admin/release-notes", label: "Release Notes", icon: Megaphone },
  { href: "/admin/email-branding", label: "Email Branding", icon: Palette },
  { href: "/admin/keys", label: "Signing Keys", icon: KeyRound },
  { href: "/admin/audit", label: "Audit Log", icon: ScrollText },
];
