import { colorForString, initialsFor } from "@/lib/admin/constants";

export function Avatar({ seed, size = 44 }: { seed: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ backgroundColor: colorForString(seed), width: size, height: size, fontSize: size * 0.38 }}
    >
      {initialsFor(...seed.split(/[\s@.]+/))}
    </div>
  );
}
