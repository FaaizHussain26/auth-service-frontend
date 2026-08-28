import { Boxes, LifeBuoy, ScrollText, User, Users } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof Boxes;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/tenant/applications", label: "My Applications", icon: Boxes },
  { href: "/tenant/tickets", label: "Support", icon: LifeBuoy },
  { href: "/tenant/account", label: "My Account", icon: User },
  { href: "/tenant/users", label: "Users", icon: Users, adminOnly: true },
  { href: "/tenant/audit", label: "Audit Log", icon: ScrollText, adminOnly: true },
];

export function navItemsForRole(role: string | undefined): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin");
}
