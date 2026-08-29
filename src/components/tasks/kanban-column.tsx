import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "@/types";
import { STATUS_LABEL } from "@/types";
import { SortableTaskCard } from "./sortable-task-card";

export function KanbanColumn({
  status,
  tasks,
}: {
  status: TaskStatus;
  tasks: Task[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/50">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-sm font-semibold">{STATUS_LABEL[status]}</h2>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 rounded-md p-2 transition ${
          isOver ? "bg-primary/5" : ""
        }`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
