import { Card } from "@/components/ui/Card";

export function ActivityTrendChart({
  title,
  data,
}: {
  title: string;
  data: { label: string; value: number; dateLabel: string }[];
}) {
  const max = Math.max(1, ...data.map((point) => point.value));
  const isEmpty = data.every((point) => point.value === 0);

  return (
    <Card className="flex h-full flex-col p-6">
      <h2 className="mb-5 text-sm font-semibold text-ink-900">{title}</h2>
      {isEmpty ? (
        <p className="flex flex-1 items-center justify-center text-sm text-ink-500">No activity in this period.</p>
      ) : (
        <div className="flex flex-1 items-stretch gap-1">
          <div className="flex flex-col justify-between pb-6 text-right text-[10px] text-ink-500">
            <span>{max}</span>
            <span>0</span>
          </div>
          <div className="flex flex-1 items-end gap-2.5 border-l border-surface-border pl-3">
            {data.map((point) => (
              <div key={point.dateLabel} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className="flex w-full flex-1 items-end">
                  <span
                    title={`${point.dateLabel}: ${point.value} event${point.value === 1 ? "" : "s"}`}
                    className="block w-full min-h-[3px] rounded-t bg-brand-600 transition-[height] hover:opacity-80"
                    style={{ height: `${(point.value / max) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-ink-500">{point.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
