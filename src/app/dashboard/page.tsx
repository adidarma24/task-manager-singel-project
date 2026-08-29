import { createClient } from "@/lib/supabase/server";
import { TaskView } from "@/components/tasks/task-view";
import type { Task } from "@/types";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, assignee:profiles!tasks_assigned_to_fkey(id, full_name, role)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6">
      <TaskView tasks={(tasks as Task[]) ?? []} />
    </div>
  );
}
