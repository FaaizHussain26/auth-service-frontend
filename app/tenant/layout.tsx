import { AppShell } from "@/components/tenant/_shell/AppShell";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
