import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border/60 bg-secondary/30 mt-24">
    <div className="container py-10">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary">
            <MapPin className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold">SkillMap</span>
          <span className="text-sm text-muted-foreground">— Making invisible talent visible.</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/profile" className="hover:text-foreground">Build Profile</Link>
          <Link to="/opportunities" className="hover:text-foreground">Opportunities</Link>
          <Link to="/employers" className="hover:text-foreground">Employers</Link>
          <Link to="/map" className="hover:text-foreground">Talent Map</Link>
        </div>
        <div className="text-xs text-muted-foreground">© 2026 SkillMap · Built for the next billion</div>
      </div>
    </div>
  </footer>
);
