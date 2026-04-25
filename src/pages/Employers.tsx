import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { TalentCard } from "@/components/TalentCard";
import { COUNTRIES, SKILL_CATEGORIES, SkillCategory, TALENTS } from "@/data/mockData";
import { Filter, Search, Sparkles, Users } from "lucide-react";

const Employers = () => {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState<string>("");
  const [skill, setSkill] = useState<SkillCategory | "">("");
  const [minCred, setMinCred] = useState(0);

  const results = useMemo(() => TALENTS.filter(t => {
    if (q && !`${t.name} ${t.detectedSkills.join(" ")} ${t.primarySkill}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (country && t.country !== country) return false;
    if (skill && t.primarySkill !== skill) return false;
    if (t.credibilityScore < minCred) return false;
    return true;
  }), [q, country, skill, minCred]);

  const stats = [
    { label: "Available talent", value: results.length },
    { label: "Avg credibility", value: results.length ? Math.round(results.reduce((s, t) => s + t.credibilityScore, 0) / results.length) : 0 },
    { label: "Countries", value: new Set(results.map(t => t.country)).size },
  ];

  return (
    <Layout>
      <section className="border-b border-border/60 bg-gradient-hero">
        <div className="container py-14 text-navy-foreground">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-glow/30 bg-primary-glow/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-glow">
            <Users className="h-3 w-3" /> Employer Dashboard
          </div>
          <h1 className="max-w-3xl font-display text-4xl font-bold md:text-5xl">Hire from the world's most overlooked talent pool.</h1>
          <p className="mt-4 max-w-2xl text-navy-foreground/80">
            Search structured profiles built from real, AI-extracted skills — not CVs. Filter by skill, location, credibility.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4 md:max-w-md">
            {stats.map(s => (
              <div key={s.label} className="rounded-xl border border-navy-foreground/10 bg-navy-foreground/5 p-4 backdrop-blur-sm">
                <div className="font-display text-2xl font-extrabold text-primary-glow">{s.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-navy-foreground/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-8">
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold">Filters</span>
          </div>
          <div className="grid gap-3 md:grid-cols-12">
            <div className="relative md:col-span-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search names, skills, tools..."
                className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select value={country} onChange={e => setCountry(e.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary md:col-span-3">
              <option value="">All countries</option>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={skill} onChange={e => setSkill(e.target.value as any)} className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary md:col-span-3">
              <option value="">All skills</option>
              {SKILL_CATEGORIES.map(s => <option key={s.name}>{s.name}</option>)}
            </select>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Min credibility: {minCred}
              </label>
              <input type="range" min={0} max={95} step={5} value={minCred} onChange={e => setMinCred(Number(e.target.value))} className="w-full accent-primary" />
            </div>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 py-20 text-center">
            <p className="text-muted-foreground">No matches. Try adjusting filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map(t => <TalentCard key={t.id} talent={t} />)}
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-border bg-gradient-card p-6 text-center shadow-card md:p-10">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-accent" />
          <h3 className="font-display text-2xl font-bold">Need to hire at scale?</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Run targeted searches across 12,400+ structured profiles. Get a shortlist with AI-explained matches in 24 hours.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Employers;
