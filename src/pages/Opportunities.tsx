import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { OPPORTUNITIES, OpportunityType, SKILL_CATEGORIES, SkillCategory } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Calendar, DollarSign, Filter, Globe, MapPin, Sparkles } from "lucide-react";

const TYPES: OpportunityType[] = ["Job", "Gig", "Apprenticeship", "Training", "Mentorship"];

const Opportunities = () => {
  const [type, setType] = useState<OpportunityType | "">("");
  const [skill, setSkill] = useState<SkillCategory | "">("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [q, setQ] = useState("");
  const [liveJobs, setLiveJobs] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("jobs").select("*, employers(company_name)").eq("active", true).order("created_at", { ascending: false });
      const mapped = (data || []).map((j: any) => ({
        id: `live-${j.id}`,
        title: j.title,
        provider: j.employers?.company_name || "Employer",
        providerType: "Remote Employer" as const,
        type: "Job" as OpportunityType,
        location: j.location || "Remote",
        remote: (j.job_type || "").toLowerCase() === "remote",
        requiredSkills: j.required_skills || [],
        matchSkillCategory: "Frontend Development" as SkillCategory,
        compensation: "Open",
        description: j.description || "Apply to learn more about this opportunity.",
        deadline: "Live",
      }));
      setLiveJobs(mapped);
    })();
  }, []);

  const all = [...liveJobs, ...OPPORTUNITIES];
  const results = useMemo(() => all.filter(o => {
    if (type && o.type !== type) return false;
    if (skill && o.matchSkillCategory !== skill) return false;
    if (remoteOnly && !o.remote) return false;
    if (q && !`${o.title} ${o.provider} ${o.description}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [type, skill, remoteOnly, q, all]);


  return (
    <Layout>
      <section className="border-b border-border/60 bg-card/50">
        <div className="container py-12">
          <div className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Opportunities</div>
          <h1 className="mb-3 font-display text-4xl font-bold md:text-5xl">Jobs, gigs, training & mentorship</h1>
          <p className="max-w-2xl text-muted-foreground">
            Live opportunities from startups, SMEs, NGOs, remote employers, and mentor networks across {SKILL_CATEGORIES.length} skill categories.
          </p>
        </div>
      </section>

      <section className="container py-8">
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold">Filters</span>
          </div>
          <div className="grid gap-3 md:grid-cols-12">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search opportunities..."
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 md:col-span-4"
            />
            <select value={type} onChange={e => setType(e.target.value as any)} className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 md:col-span-3">
              <option value="">All types</option>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={skill} onChange={e => setSkill(e.target.value as any)} className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 md:col-span-3">
              <option value="">All skills</option>
              {SKILL_CATEGORIES.map(s => <option key={s.name}>{s.name}</option>)}
            </select>
            <label className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium md:col-span-2">
              <input type="checkbox" checked={remoteOnly} onChange={e => setRemoteOnly(e.target.checked)} className="h-4 w-4 accent-primary" />
              Remote only
            </label>
          </div>
        </div>

        <div className="mb-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{results.length}</span> opportunit{results.length === 1 ? "y" : "ies"} found
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {results.map(o => (
            <div key={o.id} className="group flex flex-col rounded-2xl border border-border bg-gradient-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    o.type === "Job" ? "bg-primary/15 text-primary"
                    : o.type === "Gig" ? "bg-accent/15 text-accent"
                    : o.type === "Training" ? "bg-success/15 text-success"
                    : o.type === "Mentorship" ? "bg-pink-500/15 text-pink-600"
                    : "bg-amber-500/15 text-amber-600"
                  }`}>
                    {o.type}
                  </span>
                  {o.remote && <span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-success">Remote</span>}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {o.deadline}
                </div>
              </div>
              <h3 className="font-display text-lg font-bold">{o.title}</h3>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                <Briefcase className="h-3.5 w-3.5" /> {o.provider} <span className="text-muted-foreground">· {o.providerType}</span>
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{o.description}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {o.requiredSkills.map(s => (
                  <span key={s} className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">{s}</span>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4 text-sm">
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{o.compensation}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{o.location}</span>
                </div>
                <button className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-smooth hover:bg-primary/90">
                  <Sparkles className="h-3 w-3" /> Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Opportunities;
