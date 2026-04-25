import { Link, useLocation } from "react-router-dom";
import { MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/profile", label: "Build Profile" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/employers", label: "For Employers" },
  { to: "/map", label: "Talent Map" },
];

export const Navbar = () => {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <MapPin className="h-5 w-5 text-primary-foreground" />
            <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-accent" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold">Skill<span className="text-gradient">Map</span></div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Make talent visible</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(l => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-smooth",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <Link
          to="/profile"
          className="hidden md:inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow"
        >
          <Sparkles className="h-4 w-4" /> Create Profile
        </Link>
      </div>
    </header>
  );
};
