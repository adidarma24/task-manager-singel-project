"use client";

import { useState } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import { clsx } from "clsx";
import type { Profile, Task } from "@/types";
import { KanbanBoard } from "./kanban-board";
import { TaskList } from "./task-list";
import { Modal } from "@/components/ui/modal";
import { TaskForm } from "./task-form";

export function TaskView({
  tasks,
  members,
  canDelete,
}: {
  tasks: Task[];
  members: Profile[];
  canDelete: boolean;
}) {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  function openCreateModal() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingTask(null);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Task</h1>

        <div className="flex items-center gap-2">
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

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Tambah Task
          </button>
        </div>
      </div>

      {view === "kanban" ? (
        <KanbanBoard initialTasks={tasks} onTaskClick={openEditModal} />
      ) : (
        <TaskList tasks={tasks} onTaskClick={openEditModal} />
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingTask ? "Edit Task" : "Tambah Task Baru"}
      >
        <TaskForm
          task={editingTask}
          members={members}
          onSuccess={closeModal}
          canDelete={canDelete}
        />
      </Modal>
    </div>
  );
}
