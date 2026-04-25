import { SkillCategory } from "@/data/mockData";
import { getSkillColor, getSkillIcon } from "@/lib/matchmaker";
import { cn } from "@/lib/utils";

export const SkillBadge = ({ skill, size = "sm" }: { skill: SkillCategory; size?: "sm" | "xs" }) => {
  const color = getSkillColor(skill);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold text-white",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[10px]"
      )}
      style={{ backgroundColor: color }}
    >
      <span>{getSkillIcon(skill)}</span>
      <span>{skill}</span>
    </span>
  );
};
