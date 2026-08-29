"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { clsx } from "clsx";
import type { Task } from "@/types";
import { KanbanBoard } from "./kanban-board";
import { TaskList } from "./task-list";

export function TaskView({ tasks }: { tasks: Task[] }) {
  const [view, setView] = useState<"kanban" | "list">("kanban");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Task</h1>

        <div className="flex rounded-md border bg-card p-0.5">
          <button
            onClick={() => setView("kanban")}
            className={clsx(
              "flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition",
              view === "kanban"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Kanban
          </button>
          <button
            onClick={() => setView("list")}
            className={clsx(
              "flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition",
              view === "list"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <List className="h-3.5 w-3.5" />
            List
          </button>
        </div>
      </div>

      {view === "kanban" ? (
        <KanbanBoard initialTasks={tasks} />
      ) : (
        <TaskList tasks={tasks} />
      )}
    </div>
  );
}
