import { Card } from "@/components/ui/Card";

export type ChartTone = "success" | "warning" | "danger" | "neutral";

const TONE_COLOR: Record<ChartTone, string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  neutral: "var(--ink-500)",
};

export function StatusBarChart({
  title,
  data,
}: {
  title: string;
  data: { label: string; value: number; tone: ChartTone }[];
}) {
  const max = Math.max(1, ...data.map((row) => row.value));

  return (
    <Card className="p-6">
      <h2 className="mb-5 text-sm font-semibold text-ink-900">{title}</h2>
      {data.every((row) => row.value === 0) ? (
        <p className="py-6 text-center text-sm text-ink-500">No data yet.</p>
      ) : (
        <ul className="space-y-3.5">
          {data.map((row) => (
            <li key={row.label} className="flex items-center gap-3" title={`${row.label}: ${row.value}`}>
              <span className="w-24 shrink-0 truncate text-xs font-medium text-ink-700">{row.label}</span>
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-page">
                <span
                  className="block h-full rounded-full transition-[width]"
                  style={{ width: `${(row.value / max) * 100}%`, backgroundColor: TONE_COLOR[row.tone] }}
                />
              </span>
              <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-ink-900">
                {row.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
