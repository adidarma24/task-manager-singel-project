import { clsx } from "clsx";

export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: "default" | "done" | "urgent" | "progress";
}) {
  const accentColor: Record<string, string> = {
    default: "text-foreground",
    done: "text-status-done",
    urgent: "text-status-urgent",
    progress: "text-status-progress",
  };

  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="mb-1 text-xs font-medium text-muted-foreground">
        {label}
      </p>
      <p
        className={clsx(
          "text-2xl font-semibold",
          accentColor[accent ?? "default"]
        )}
      >
        {value}
      </p>
    </div>
  );
}
