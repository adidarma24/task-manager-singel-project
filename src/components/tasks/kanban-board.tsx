"use client";

import { useEffect, useState } from "react";
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { Task, TaskStatus } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { KanbanColumn } from "./kanban-column";

const COLUMNS: TaskStatus[] = ["todo", "in_progress", "review", "done"];

export function KanbanBoard({
  initialTasks,
  onTaskClick,
}: {
  initialTasks: Task[];
  onTaskClick?: (task: Task) => void;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const supabase = createClient();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Jarak minimum sebelum dianggap drag, supaya klik singkat tetap bisa buka edit
      activationConstraint: { distance: 8 },
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    if (!COLUMNS.includes(newStatus)) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Update UI dulu (optimistic), lalu simpan ke Supabase
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (error) {
      // Kalau gagal, kembalikan status semula
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: task.status } : t))
      );
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
    </DndContext>
  );
}
