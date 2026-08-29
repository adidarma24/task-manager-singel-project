import { z } from "zod";

export const taskFormSchema = z.object({
  title: z.string().min(1, "Judul task wajib diisi").max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  status: z.enum(["todo", "in_progress", "review", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  due_date: z.string().optional().or(z.literal("")),
  assigned_to: z.string().uuid().optional().or(z.literal("")),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
