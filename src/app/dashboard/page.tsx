import { createClient } from "@/lib/supabase/server";
import { TaskView } from "@/components/tasks/task-view";
import type { Profile, Task } from "@/types";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: tasks }, { data: members }, { data: currentProfile }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select(
          "*, assignee:profiles!tasks_assigned_to_fkey(id, full_name, role)"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, full_name, role, created_at")
        .order("full_name", { ascending: true }),
      user
        ? supabase.from("profiles").select("role").eq("id", user.id).single()
        : Promise.resolve({ data: null }),
    ]);

  const canDelete =
    currentProfile?.role === "admin" || currentProfile?.role === "manager";

  return (
    <div className="p-6">
      <TaskView
        tasks={(tasks as Task[]) ?? []}
        members={(members as Profile[]) ?? []}
        canDelete={canDelete}
      />
    </div>
  );
}
