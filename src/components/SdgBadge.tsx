import { SDGS } from "@/data/mockData";
import { cn } from "@/lib/utils";

export const SdgBadge = ({ id, size = "sm" }: { id: number; size?: "sm" | "xs" }) => {
  const sdg = SDGS.find(s => s.id === id);
  if (!sdg) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold text-white",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[10px]"
      )}
      style={{ backgroundColor: sdg.color }}
      title={`SDG ${sdg.id}: ${sdg.label}`}
    >
      <span className="opacity-90">SDG {sdg.id}</span>
      <span className="hidden sm:inline">· {sdg.label}</span>
    </span>
  );
};
