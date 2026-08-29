import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { Task } from "@/types";
import { PriorityBadge } from "./badges";

export function TaskCard({ task }: { task: Task }) {
  return (
    <div className="rounded-md border bg-card p-3 shadow-sm transition hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium leading-snug">{task.title}</h3>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{task.assignee?.full_name ?? "Belum ditugaskan"}</span>
        {task.due_date && (
          <span>
            {format(new Date(task.due_date), "d MMM", { locale: localeId })}
          </span>
        )}
      </div>
    </div>
  );
}
