import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { Task } from "@/types";
import { StatusBadge, PriorityBadge } from "./badges";

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs font-medium text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Task</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Prioritas</th>
            <th className="px-4 py-3">Ditugaskan ke</th>
            <th className="px-4 py-3">Tenggat</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-muted/50">
              <td className="px-4 py-3 font-medium">{task.title}</td>
              <td className="px-4 py-3">
                <StatusBadge status={task.status} />
              </td>
              <td className="px-4 py-3">
                <PriorityBadge priority={task.priority} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {task.assignee?.full_name ?? "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {task.due_date
                  ? format(new Date(task.due_date), "d MMM yyyy", {
                      locale: localeId,
                    })
                  : "—"}
              </td>
            </tr>
          ))}

          {tasks.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                Belum ada task. Buat task pertama untuk memulai.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
