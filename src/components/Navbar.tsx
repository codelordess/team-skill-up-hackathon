import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Bell, LogOut, MapPin, Sparkles, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/map", label: "Talent Map" },
];

export const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    let active = true;
    const load = async () => {
      const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false);
      if (active) setUnread(count ?? 0);
    };
    load();
    const channel = supabase.channel(`notif-${user.id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, load).subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, [user]);

  const dashLink = role === "employer" ? "/employer/dashboard" : "/talent/dashboard";

  const navLinks = user
    ? [{ to: dashLink, label: "Dashboard" }, ...publicLinks.slice(1)]
    : publicLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
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
          {navLinks.map(l => {
            const active = pathname === l.to;
            return (
              <Link key={l.to} to={l.to}
                className={cn("rounded-lg px-3.5 py-2 text-sm font-medium transition-smooth",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
              >{l.label}</Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to="/notifications" className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">{unread}</span>
                )}
              </Link>
              <button onClick={async () => { await signOut(); navigate("/"); }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Sign in</Link>
              <Link to="/auth?mode=signup" className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow">
                <Sparkles className="h-4 w-4" /> Get started
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="container space-y-1 py-3">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className={cn("block rounded-lg px-3 py-2 text-sm font-medium",
                  pathname === l.to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary")}>
                {l.label}
              </Link>
            ))}
            {user ? (
              <button onClick={async () => { setOpen(false); await signOut(); navigate("/"); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-secondary">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            ) : (
              <Link to="/auth?mode=signup" onClick={() => setOpen(false)}
                className="block rounded-lg bg-gradient-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground">
                Get started
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
