import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { calculateMatch } from "@/lib/scoring";
import { Brain, Briefcase, Building2, Edit3, Loader2, Plus, Search, Star, Users } from "lucide-react";

type Employer = { id: string; company_name: string; industry: string | null; description: string | null; website: string | null };
type Job = { id: string; title: string; required_skills: string[]; location: string | null; created_at: string };
type Talent = { user_id: string; primary_skill: string | null; extracted_skills: string[]; experience_level: string | null; credibility_score: number; available: boolean };
type Profile = { id: string; name: string; location: string | null };

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: emp } = await supabase.from("employers").select("*").eq("user_id", user.id).maybeSingle();
      setEmployer(emp as any);
      if (emp) {
        const { data: js } = await supabase.from("jobs").select("id,title,required_skills,location,created_at").eq("employer_id", emp.id).order("created_at", { ascending: false });
        setJobs((js as any) || []);
      }
      const { data: ts } = await supabase.from("talents").select("user_id,primary_skill,extracted_skills,experience_level,credibility_score,available").eq("available", true);
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
  }, [user]);

  if (loading) return <Layout><div className="container py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></Layout>;

  // Recommended candidates: best match across all your jobs
  const recs = talents.map(t => {
    const profile = profiles[t.user_id];
    const bestJob = jobs.length ? jobs.map(j => ({
      job: j,
      m: calculateMatch({
        talentSkills: t.extracted_skills || [],
        jobSkills: j.required_skills || [],
        talentLocation: profile?.location, jobLocation: j.location,
        experienceLevel: t.experience_level,
      })
    })).sort((a, b) => b.m.score - a.m.score)[0] : null;
    return { talent: t, profile, bestJob };
  }).filter(r => r.profile && r.bestJob && r.bestJob.m.score > 0)
    .sort((a, b) => (b.bestJob!.m.score - a.bestJob!.m.score)).slice(0, 6);

  return (
    <Layout>
      <section className="border-b border-border/60 bg-gradient-hero">
        <div className="container py-12 text-navy-foreground">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary-glow/30 bg-primary-glow/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-glow">
                <Building2 className="h-3 w-3" /> Employer Dashboard
              </div>
              <h1 className="font-display text-3xl font-bold md:text-4xl">{employer?.company_name || "Welcome"}</h1>
              <p className="mt-2 max-w-xl text-navy-foreground/75">{employer?.industry || "Discover hidden talent across the Global South."}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/employer/edit" className="inline-flex items-center gap-2 rounded-xl border border-navy-foreground/20 bg-navy-foreground/5 px-4 py-2.5 text-sm font-semibold text-navy-foreground hover:bg-navy-foreground/10">
                <Edit3 className="h-4 w-4" /> Company profile
              </Link>
              <Link to="/employer/founder-assistant" className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/20 transition">
                <Brain className="h-4 w-4" /> AI Setup Assistant
              </Link>
              <Link to="/employer/jobs/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-accent px-5 py-2.5 font-bold text-accent-foreground shadow-elegant transition-smooth hover:shadow-glow">
                <Plus className="h-4 w-4" /> Post a job
              </Link>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 md:max-w-md">
            <Stat label="Talents available" value={talents.length} />
            <Stat label="Active jobs" value={jobs.length} />
            <Stat label="Top matches" value={recs.length} />
          </div>
        </div>
      </section>

      <section className="container py-10 space-y-10">
        {/* Recommended candidates */}
        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Recommended candidates</h2>
              <p className="text-sm text-muted-foreground">Best matches across your active job posts.</p>
            </div>
            <Link to="/employer/talent" className="text-sm font-semibold text-primary hover:underline">Browse all talent →</Link>
          </div>
          {recs.length === 0 ? (
            <EmptyHint title="No matches yet" body={jobs.length === 0 ? "Post your first job to see recommended candidates." : "No talents currently match your job requirements."} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recs.map((r, i) => (
                <Link to={`/employer/talent/${r.talent.user_id}`} key={r.talent.user_id} className="group relative rounded-2xl border border-border bg-card p-5 shadow-card transition-smooth hover:-translate-y-0.5 hover:shadow-elegant">
                  {i === 0 && <span className="absolute -top-2 right-4 inline-flex items-center gap-1 rounded-full bg-gradient-accent px-2.5 py-0.5 text-[10px] font-bold uppercase text-accent-foreground"><Star className="h-3 w-3" /> Best match</span>}
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold">{r.profile!.name}</h3>
                      <p className="text-xs text-muted-foreground">{r.profile!.location || "Remote"} · {r.talent.experience_level || "—"}</p>
                    </div>
                    <div className={`rounded-xl px-3 py-1.5 text-center ${r.bestJob!.m.score >= 75 ? "bg-success text-success-foreground" : "bg-accent text-accent-foreground"}`}>
                      <div className="font-display text-lg font-extrabold leading-none">{r.bestJob!.m.score}%</div>
                      <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">Match</div>
                    </div>
                  </div>
                  <p className="mb-2 text-xs font-semibold text-primary">{r.talent.primary_skill || "—"}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(r.talent.extracted_skills || []).slice(0, 4).map(s => (
                      <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">{s}</span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">For: <strong>{r.bestJob!.job.title}</strong></p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Posted jobs */}
        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Posted jobs</h2>
              <p className="text-sm text-muted-foreground">Each job shows how many talents currently match.</p>
            </div>
            <Link to="/employer/jobs/new" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><Plus className="h-4 w-4" /> New job</Link>
          </div>
          {jobs.length === 0 ? (
            <EmptyHint title="No jobs yet" body="Post your first job to start matching with talent." cta={{ to: "/employer/jobs/new", label: "Post a job" }} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {jobs.map(j => {
                const matched = talents.filter(t => calculateMatch({ talentSkills: t.extracted_skills, jobSkills: j.required_skills }).score >= 50).length;
                return (
                  <Link to={`/employer/jobs/${j.id}/matches`} key={j.id} className="rounded-2xl border border-border bg-card p-5 shadow-card transition-smooth hover:-translate-y-0.5 hover:shadow-elegant">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-display text-lg font-bold leading-tight">{j.title}</h3>
                        <p className="text-xs text-muted-foreground">{j.location || "Remote"}</p>
                      </div>
                      <div className="rounded-xl bg-primary/10 px-3 py-1.5 text-center text-primary">
                        <div className="font-display text-lg font-extrabold leading-none">{matched}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wider">Matched</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(j.required_skills || []).slice(0, 5).map(s => <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">{s}</span>)}
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <p className="inline-flex items-center gap-1 text-xs font-semibold text-primary">View matches <Search className="h-3 w-3" /></p>
                      <Link to={`/employer/jobs/${j.id}/applications`} onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition">
                        Applications ({talents.filter(t => calculateMatch({ talentSkills: t.extracted_skills, jobSkills: j.required_skills }).score >= 0).length})
                      </Link>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick search CTA */}
        <Link to="/employer/talent" className="flex items-center justify-between rounded-2xl border border-border bg-gradient-card p-6 shadow-card transition hover:shadow-elegant">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground"><Users className="h-6 w-6" /></div>
            <div>
              <h3 className="font-display text-lg font-bold">Search talent directory</h3>
              <p className="text-sm text-muted-foreground">Filter by skill, location, experience, credibility.</p>
            </div>
          </div>
          <Briefcase className="h-5 w-5 text-muted-foreground" />
        </Link>
      </section>
    </Layout>
  );
};

const Stat = ({ label, value }: any) => (
  <div className="rounded-xl border border-navy-foreground/10 bg-navy-foreground/5 p-4 backdrop-blur-sm">
    <div className="font-display text-2xl font-extrabold text-primary-glow">{value}</div>
    <div className="text-[10px] uppercase tracking-wider text-navy-foreground/70">{label}</div>
  </div>
);

const EmptyHint = ({ title, body, cta }: any) => (
  <div className="rounded-2xl border border-dashed border-border bg-card/50 py-12 text-center">
    <h3 className="font-display text-lg font-bold">{title}</h3>
    <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
    {cta && <Link to={cta.to} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-card"><Plus className="h-4 w-4" /> {cta.label}</Link>}
  </div>
);

export default EmployerDashboard;
