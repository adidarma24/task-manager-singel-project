"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/types";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manager/Lead",
  member: "Anggota",
};

export function TeamTable({
  members,
  currentUserId,
}: {
  members: Profile[];
  currentUserId: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleRoleChange(memberId: string, newRole: UserRole) {
    setUpdatingId(memberId);

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", memberId);

    setUpdatingId(null);

    if (!error) {
      router.refresh();
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs font-medium text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Nama</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Bergabung</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {members.map((member) => (
            <tr key={member.id} className="hover:bg-muted/50">
              <td className="px-4 py-3 font-medium">
                {member.full_name}
                {member.id === currentUserId && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Anda)
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <select
                  value={member.role}
                  disabled={
                    member.id === currentUserId || updatingId === member.id
                  }
                  onChange={(e) =>
                    handleRoleChange(member.id, e.target.value as UserRole)
                  }
                  className="rounded-md border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  {Object.entries(ROLE_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {format(new Date(member.created_at), "d MMM yyyy", {
                  locale: localeId,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
