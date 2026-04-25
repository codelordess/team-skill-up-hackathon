import { Link } from "react-router-dom";
import { TalentProfile } from "@/data/mockData";
import { getSkillColor, getSkillIcon } from "@/lib/matchmaker";
import { ArrowRight, MapPin, ShieldCheck, Sparkles } from "lucide-react";

export const TalentCard = ({ talent }: { talent: TalentProfile }) => {
  const color = getSkillColor(talent.primarySkill);
  return (
    <Link
      to={`/talent/${talent.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-gradient-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white shadow-card"
            style={{ background: `linear-gradient(135deg, ${talent.avatarColor}, ${color})` }}
          >
            {talent.initials}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold leading-tight">{talent.name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {talent.city}, {talent.country}
              <span>· {talent.age}y</span>
            </div>
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
          style={{ backgroundColor: `${color}22`, color }}
        >
          <ShieldCheck className="h-3 w-3" /> {talent.credibilityScore}
        </span>
      </div>

      <div
        className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-white"
        style={{ backgroundColor: color }}
      >
        <span>{getSkillIcon(talent.primarySkill)}</span>
        {talent.primarySkill}
      </div>

      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {talent.experienceLevel}
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {talent.detectedSkills.slice(0, 4).map(s => (
          <span key={s} className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
            {s}
          </span>
        ))}
        {talent.detectedSkills.length > 4 && (
          <span className="rounded-md px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            +{talent.detectedSkills.length - 4}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4 text-sm font-semibold">
        <span className="flex items-center text-primary">
          View profile
          <ArrowRight className="ml-1 h-4 w-4 transition-smooth group-hover:translate-x-1" />
        </span>
        {talent.available && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-success">
            <Sparkles className="h-3 w-3" /> Available
          </span>
        )}
      </div>
    </Link>
  );
};
