import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Filter, Loader2, Search, Users } from "lucide-react";

type Talent = { user_id: string; primary_skill: string | null; extracted_skills: string[]; experience_level: string | null; credibility_score: number; available: boolean };
type Profile = { id: string; name: string; location: string | null };

const LEVELS = ["", "Beginner", "Beginner–Intermediate", "Intermediate", "Intermediate–Advanced", "Advanced"];

const TalentSearch = () => {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("");
  const [minCred, setMinCred] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: ts } = await supabase.from("talents").select("*").eq("available", true);
      setTalents((ts as any) || []);
      if (ts?.length) {
        const ids = ts.map((t: any) => t.user_id);
        const { data: ps } = await supabase.from("profiles").select("id,name,location").in("id", ids);
        const map: Record<string, Profile> = {};
        ps?.forEach((p: any) => { map[p.id] = p; });
        setProfiles(map);
      }
      setLoading(false);
    })();
  }, []);

  const allSkills = useMemo(() => {
    const set = new Set<string>();
    talents.forEach(t => (t.extracted_skills || []).forEach(s => set.add(s)));
    return Array.from(set).sort();
  }, [talents]);

  const filtered = talents.filter(t => {
    const p = profiles[t.user_id];
    if (!p) return false;
    if (q) {
      const hay = `${p.name} ${t.primary_skill ?? ""} ${(t.extracted_skills || []).join(" ")}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    if (skill && !(t.extracted_skills || []).some(s => s.toLowerCase().includes(skill.toLowerCase()))) return false;
    if (level && t.experience_level !== level) return false;
    if (t.credibility_score < minCred) return false;
    return true;
  });

  return (
    <Layout>
      <section className="border-b border-border/60 bg-gradient-hero">
        <div className="container py-12 text-navy-foreground">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary-glow/30 bg-primary-glow/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-glow">
            <Users className="h-3 w-3" /> Talent directory
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Search structured talent profiles.</h1>
          <p className="mt-2 max-w-2xl text-navy-foreground/75">Filter by skill, location, experience level, and credibility.</p>
        </div>
      </section>

      <section className="container py-8">
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center gap-2"><Filter className="h-4 w-4 text-primary" /><span className="text-sm font-bold">Filters</span></div>
          <div className="grid gap-3 md:grid-cols-12">
            <div className="relative md:col-span-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Name, skill, tool..." className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            <select value={skill} onChange={e => setSkill(e.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 text-sm md:col-span-3">
              <option value="">All skills</option>
              {allSkills.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={level} onChange={e => setLevel(e.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 text-sm md:col-span-3">
              <option value="">All levels</option>
              {LEVELS.filter(Boolean).map(l => <option key={l}>{l}</option>)}
            </select>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Min cred: {minCred}</label>
              <input type="range" min={0} max={95} step={5} value={minCred} onChange={e => setMinCred(Number(e.target.value))} className="w-full accent-primary" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center text-muted-foreground">No talents match your filters.</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(t => {
              const p = profiles[t.user_id];
              return (
                <Link key={t.user_id} to={`/employer/talent/${t.user_id}`} className="group rounded-2xl border border-border bg-card p-5 shadow-card transition-smooth hover:-translate-y-0.5 hover:shadow-elegant">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-primary font-display font-extrabold text-primary-foreground">
                      {(p.name || "U").split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-lg font-bold leading-tight">{p.name}</h3>
                      <p className="text-xs text-muted-foreground">{p.location || "Remote"}</p>
                    </div>
                    <div className="rounded-lg bg-primary/10 px-2 py-1 text-center">
                      <div className="font-display text-sm font-extrabold text-primary leading-none">{t.credibility_score}</div>
                      <div className="text-[8px] font-bold uppercase text-primary/70">Cred</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-primary">{t.primary_skill || "—"}</p>
                  <p className="text-xs text-muted-foreground">{t.experience_level}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(t.extracted_skills || []).slice(0, 4).map(s => <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">{s}</span>)}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default TalentSearch;
