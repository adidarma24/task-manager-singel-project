"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { taskFormSchema, type TaskFormValues } from "@/lib/validation/task-schema";
import type { Profile, Task } from "@/types";

interface TaskFormProps {
  task?: Task | null;
  members: Profile[];
  onSuccess: () => void;
  canDelete?: boolean;
}

export function TaskForm({ task, members, onSuccess, canDelete }: TaskFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "todo",
      priority: task?.priority ?? "medium",
      due_date: task?.due_date ?? "",
      assigned_to: task?.assigned_to ?? "",
    },
  });

  async function onSubmit(values: TaskFormValues) {
    setServerError(null);

    const payload = {
      title: values.title,
      description: values.description || null,
      status: values.status,
      priority: values.priority,
      due_date: values.due_date || null,
      assigned_to: values.assigned_to || null,
    };

    if (task) {
      // Mode edit
      const { error } = await supabase
        .from("tasks")
        .update(payload)
        .eq("id", task.id);

      if (error) {
        setServerError("Gagal menyimpan perubahan. Coba lagi.");
        return;
      }
    } else {
      // Mode tambah baru
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("tasks").insert({
        ...payload,
        created_by: user?.id ?? null,
      });

      if (error) {
        setServerError("Gagal membuat task. Coba lagi.");
        return;
      }
    }

    router.refresh();
    onSuccess();
  }

  async function handleDelete() {
    if (!task) return;
    const confirmed = window.confirm(
      `Hapus task "${task.title}"? Tindakan ini tidak bisa dibatalkan.`
    );
    if (!confirmed) return;

    setDeleting(true);
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    setDeleting(false);

    if (error) {
      setServerError("Gagal menghapus task. Coba lagi.");
      return;
    }

    router.refresh();
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Judul</label>
        <input
          {...register("title")}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          placeholder="Contoh: Siapkan laporan mingguan"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-status-urgent">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Deskripsi <span className="text-muted-foreground">(opsional)</span>
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          placeholder="Detail task..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select
            {...register("status")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Prioritas</label>
          <select
            {...register("priority")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Ditugaskan ke
          </label>
          <select
            {...register("assigned_to")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Belum ditugaskan</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Tenggat</label>
          <input
            type="date"
            {...register("due_date")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {serverError && (
        <p className="text-sm text-status-urgent">{serverError}</p>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        {task && canDelete ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-status-urgent transition hover:bg-status-urgent/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Menghapus..." : "Hapus"}
          </button>
        ) : (
          <span />
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting
            ? "Menyimpan..."
            : task
              ? "Simpan Perubahan"
              : "Buat Task"}
        </button>
      </div>
    </form>
  );
}
