import { Eye, Play, ShieldBan } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { USER_STATUS_BADGE } from "@/lib/constants";
import { formatDate, fullName } from "@/lib/utils";
import type { User } from "@/lib/types";

export function UserTable({
  users,
  onView,
  onDisable,
  onEnable,
}: {
  users: User[];
  onView: (user: User) => void;
  onDisable: (user: User) => void;
  onEnable: (user: User) => void;
}) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-surface-border text-xs font-semibold uppercase tracking-wide text-ink-500">
            <th className="px-5 py-3.5">User</th>
            <th className="px-5 py-3.5">Tenant</th>
            <th className="px-5 py-3.5">Phone</th>
            <th className="px-5 py-3.5">Status</th>
            <th className="px-5 py-3.5">Role</th>
            <th className="px-5 py-3.5">Created</th>
            <th className="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {users.map((user) => {
            const badge = USER_STATUS_BADGE[user.status] ?? { label: user.status, tone: "neutral" as const };
            return (
              <tr key={user.id} className="hover:bg-surface-page">
                <td className="px-5 py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar seed={user.email} size={36} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink-900">{fullName(user.firstName, user.lastName)}</p>
                      <p className="truncate text-xs text-ink-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-ink-700">
                  {user.tenants && user.tenants.length ? (
                    <div className="flex flex-wrap gap-1">
                      {user.tenants.slice(0, 2).map((tenant) => (
                        <Badge key={tenant.id} label={tenant.name} tone="neutral" />
                      ))}
                      {user.tenants.length > 2 ? (
                        <span className="text-xs text-ink-500">+{user.tenants.length - 2} more</span>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-ink-500">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-ink-700">{user.phoneNumber ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <Badge label={badge.label} tone={badge.tone} />
                </td>
                <td className="px-5 py-3.5">{user.isSuperadmin ? <Badge label="Superadmin" tone="brand" /> : <span className="text-ink-500">—</span>}</td>
                <td className="px-5 py-3.5 text-ink-700">{formatDate(user.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(user)}
                      className="flex items-center gap-1.5 rounded-field px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-white"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                    {user.status === "active" ? (
                      <button
                        onClick={() => onDisable(user)}
                        className="flex items-center gap-1.5 rounded-field px-2.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger-bg"
                      >
                        <ShieldBan className="h-3.5 w-3.5" />
                        Disable
                      </button>
                    ) : (
                      <button
                        onClick={() => onEnable(user)}
                        className="flex items-center gap-1.5 rounded-field px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-white"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Enable
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
