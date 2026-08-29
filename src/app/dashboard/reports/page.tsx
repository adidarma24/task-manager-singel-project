import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/reports/stat-card";
import { BarList } from "@/components/reports/bar-list";
import type { Task } from "@/types";
import { STATUS_LABEL, PRIORITY_LABEL } from "@/types";

const STATUS_COLOR: Record<string, string> = {
  todo: "#94a3b8",
  in_progress: "#eab308",
  review: "#3b82f6",
  done: "#22c55e",
};

const PRIORITY_COLOR: Record<string, string> = {
  low: "#94a3b8",
  medium: "#3b82f6",
  high: "#eab308",
  urgent: "#ef4444",
};

export default async function ReportsPage() {
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

  // Hanya Admin & Manager yang boleh melihat laporan
  if (currentProfile?.role !== "admin" && currentProfile?.role !== "manager") {
    redirect("/dashboard");
  }

  const { data: tasksData } = await supabase
    .from("tasks")
    .select("*, assignee:profiles!tasks_assigned_to_fkey(id, full_name)");

  const tasks = (tasksData as Task[]) ?? [];

  // --- Hitung statistik ---
  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const inProgressCount = tasks.filter(
    (t) => t.status === "in_progress"
  ).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueCount = tasks.filter(
    (t) =>
      t.due_date &&
      t.status !== "done" &&
      new Date(t.due_date) < today
  ).length;

  const completionRate =
    total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const statusBreakdown = (
    ["todo", "in_progress", "review", "done"] as const
  ).map((status) => ({
    label: STATUS_LABEL[status],
    value: tasks.filter((t) => t.status === status).length,
    color: STATUS_COLOR[status],
  }));

  const priorityBreakdown = (
    ["urgent", "high", "medium", "low"] as const
  ).map((priority) => ({
    label: PRIORITY_LABEL[priority],
    value: tasks.filter((t) => t.priority === priority).length,
    color: PRIORITY_COLOR[priority],
  }));

  // Task per anggota (termasuk yang belum ditugaskan)
  const assigneeMap = new Map<string, number>();
  for (const task of tasks) {
    const name = task.assignee?.full_name ?? "Belum ditugaskan";
    assigneeMap.set(name, (assigneeMap.get(name) ?? 0) + 1);
  }
  const assigneeBreakdown = Array.from(assigneeMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Laporan</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan progres task di seluruh tim.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Task" value={total} />
        <StatCard label="Selesai" value={doneCount} accent="done" />
        <StatCard
          label="Sedang Berjalan"
          value={inProgressCount}
          accent="progress"
        />
        <StatCard label="Terlambat" value={overdueCount} accent="urgent" />
      </div>

      <div className="mb-6 rounded-lg border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Tingkat Penyelesaian</span>
          <span className="text-muted-foreground">{completionRate}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-status-done transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BarList title="Task per Status" items={statusBreakdown} />
        <BarList title="Task per Prioritas" items={priorityBreakdown} />
        <div className="md:col-span-2">
          <BarList title="Task per Anggota" items={assigneeBreakdown} />
        </div>
      </div>
    </div>
  );
}
