import { LayoutDashboard, Boxes, Building2, Users, KeyRound, ScrollText } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Applications", icon: Boxes },
  { href: "/tenants", label: "Tenants", icon: Building2 },
  { href: "/users", label: "Users", icon: Users },
  { href: "/keys", label: "Signing Keys", icon: KeyRound },
  { href: "/audit", label: "Audit Log", icon: ScrollText },
];
