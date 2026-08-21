import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatTone = "brand" | "blue" | "green" | "purple";

const TONE_CLASSES: Record<StatTone, { bg: string; text: string; icon: string }> = {
  brand: { bg: "bg-brand-100", text: "text-brand-700", icon: "bg-white/70 text-brand-600" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", icon: "bg-white/70 text-blue-600" },
  green: { bg: "bg-success-bg", text: "text-success", icon: "bg-white/70 text-success" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", icon: "bg-white/70 text-purple-600" },
};

export function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  tone = "brand",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sublabel: string;
  tone?: StatTone;
}) {
  const classes = TONE_CLASSES[tone];
  return (
    <div className={cn("rounded-2xl p-5", classes.bg)}>
      <div className="mb-4 flex items-center justify-between">
        <p className={cn("text-sm font-semibold", classes.text)}>{label}</p>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", classes.icon)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-3xl font-semibold text-ink-900">{value}</p>
      <p className={cn("mt-1 text-xs", classes.text)}>{sublabel}</p>
    </div>
  );
}
