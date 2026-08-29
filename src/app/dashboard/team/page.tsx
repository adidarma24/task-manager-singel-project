import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InviteMemberButton } from "@/components/team/invite-member-button";
import { TeamTable } from "@/components/team/team-table";
import type { Profile } from "@/types";

export default async function TeamPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Hanya Admin yang boleh membuka halaman ini
  if (currentProfile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: true });

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Kelola Tim</h1>
          <p className="text-sm text-muted-foreground">
            Undang anggota baru dan atur role akses mereka.
          </p>
        </div>
        <InviteMemberButton />
      </div>

      <TeamTable members={(members as Profile[]) ?? []} currentUserId={user.id} />
    </div>
  );
}
