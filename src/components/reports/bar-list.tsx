export interface BarItem {
  label: string;
  value: number;
  color?: string;
}

export function BarList({
  title,
  items,
}: {
  title: string;
  items: BarItem[];
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada data.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">{item.value}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(item.value / max) * 100}%`,
                    backgroundColor: item.color ?? "hsl(var(--primary))",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
