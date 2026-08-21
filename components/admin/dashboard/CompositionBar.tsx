import { Card } from "@/components/ui/Card";

export function CompositionBar({
  title,
  segments,
}: {
  title: string;
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <Card className="p-6">
      <h2 className="mb-5 text-sm font-semibold text-ink-900">{title}</h2>
      {total === 0 ? (
        <p className="py-6 text-center text-sm text-ink-500">No data yet.</p>
      ) : (
        <>
          <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-surface-page">
            {segments
              .filter((segment) => segment.value > 0)
              .map((segment) => (
                <span
                  key={segment.label}
                  title={`${segment.label}: ${segment.value}`}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${(segment.value / total) * 100}%`, backgroundColor: segment.color }}
                />
              ))}
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {segments.map((segment) => (
              <li key={segment.label} className="flex items-center gap-1.5 text-xs text-ink-700">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
                <span className="font-medium text-ink-900">{segment.value}</span>
                {segment.label}
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
