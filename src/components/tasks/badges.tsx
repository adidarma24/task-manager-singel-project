import { clsx } from "clsx";
import type { TaskPriority, TaskStatus } from "@/types";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/types";

const statusColor: Record<TaskStatus, string> = {
  todo: "bg-status-todo/15 text-status-todo",
  in_progress: "bg-status-progress/15 text-status-progress",
  review: "bg-status-review/15 text-status-review",
  done: "bg-status-done/15 text-status-done",
};

const priorityColor: Record<TaskPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-status-review/15 text-status-review",
  high: "bg-status-progress/15 text-status-progress",
  urgent: "bg-status-urgent/15 text-status-urgent",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={clsx(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        statusColor[status]
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={clsx(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        priorityColor[priority]
      )}
    >
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
