import { Link } from "react-router-dom";
import { Globe2 } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border/60 bg-secondary/30 mt-24">
    <div className="container py-10">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary">
            <Globe2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold">OpportunityAI</span>
          <span className="text-sm text-muted-foreground">— Connecting impact, globally.</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/discover" className="hover:text-foreground">Discover</Link>
          <Link to="/match" className="hover:text-foreground">Matchmaker</Link>
          <Link to="/funding" className="hover:text-foreground">Funding</Link>
          <Link to="/map" className="hover:text-foreground">Map</Link>
        </div>
        <div className="text-xs text-muted-foreground">© 2025 OpportunityAI · Built for impact</div>
      </div>
    </div>
  </footer>
);
