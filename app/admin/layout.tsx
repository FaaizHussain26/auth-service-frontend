import { AppShell } from "@/components/admin/_shell/AppShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
