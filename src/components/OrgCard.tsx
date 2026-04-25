import { Link } from "react-router-dom";
import { Organization } from "@/data/mockData";
import { SdgBadge } from "./SdgBadge";
import { ArrowRight, MapPin, ShieldCheck, Target, Users } from "lucide-react";

export const OrgCard = ({ org }: { org: Organization }) => {
  return (
    <Link
      to={`/org/${org.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-gradient-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:border-primary/30 hover:shadow-elegant"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-2xl shadow-card">
            {org.flag}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold leading-tight">{org.name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {org.country}
              {org.verified && (
                <span className="inline-flex items-center gap-0.5 text-success">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              )}
            </div>
          </div>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
          {org.type}
        </span>
      </div>

      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{org.description}</p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {org.sdgs.slice(0, 3).map(id => <SdgBadge key={id} id={id} size="xs" />)}
      </div>

      <div className="mt-auto space-y-2 border-t border-border/60 pt-4 text-xs">
        {org.needs.length > 0 && (
          <div className="flex items-start gap-2">
            <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            <div>
              <span className="font-semibold text-foreground">Needs: </span>
              <span className="text-muted-foreground">{org.needs.join(", ")}</span>
            </div>
          </div>
        )}
        <div className="flex items-start gap-2">
          <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <div>
            <span className="font-semibold text-foreground">Reach: </span>
            <span className="text-muted-foreground">{org.reach}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm font-semibold">
        <span className="flex items-center text-primary">
          View profile
          <ArrowRight className="ml-1 h-4 w-4 transition-smooth group-hover:translate-x-1" />
        </span>
        {org.website && (
          <span className="text-xs font-medium text-muted-foreground">
            {org.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
          </span>
        )}
      </div>
    </Link>
  );
};
