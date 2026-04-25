import { Link, useLocation } from "react-router-dom";
import { Globe2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/discover", label: "Discover NGOs" },
  { to: "/match", label: "AI Matchmaker" },
  { to: "/funding", label: "Funding" },
  { to: "/map", label: "Impact Map" },
];

export const Navbar = () => {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Globe2 className="h-5 w-5 text-primary-foreground" />
            <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-accent" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold">Opportunity<span className="text-gradient">AI</span></div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Impact intelligence</div>
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
          to="/match"
          className="hidden md:inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow"
        >
          <Sparkles className="h-4 w-4" /> Find Partners
        </Link>
      </div>
    </header>
  );
};
