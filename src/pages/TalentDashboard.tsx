import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { calculateMatch } from "@/lib/scoring";
import { Award, Briefcase, Edit3, Eye, Loader2, MapPin, Sparkles, TrendingUp, UserCheck } from "lucide-react";

type Profile = { name: string; email: string; location: string | null };
type Talent = {
  skill_description: string | null; primary_skill: string | null; extracted_skills: string[];
  experience_level: string | null; credibility_score: number; proof_links: any[];
  career_goals: string | null; available: boolean; profile_views: number;
};
type Job = { id: string; title: string; description: string | null; required_skills: string[]; location: string | null; job_type: string; employer_id: string };

const TalentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [talent, setTalent] = useState<Talent | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employerNames, setEmployerNames] = useState<Record<string, string>>({});
  const [viewers, setViewers] = useState<{ name: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: t }, { data: js }, { data: vw }] = await Promise.all([
        supabase.from("profiles").select("name,email,location").eq("id", user.id).maybeSingle(),
        supabase.from("talents").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("jobs").select("*").eq("active", true),
        supabase.from("profile_views").select("viewer_user_id, created_at").eq("talent_user_id", user.id).order("created_at", { ascending: false }).limit(5),
      ]);
      setProfile(p as any);
      setTalent(t as any);
      setJobs((js as any) || []);
      if (js?.length) {
        const empIds = Array.from(new Set(js.map((j: any) => j.employer_id)));
        const { data: emps } = await supabase.from("employers").select("id,company_name").in("id", empIds);
        const map: Record<string, string> = {};
        emps?.forEach((e: any) => { map[e.id] = e.company_name; });
        setEmployerNames(map);
      }
      if (vw?.length) {
        const ids = vw.map((v: any) => v.viewer_user_id);
        const { data: emps } = await supabase.from("employers").select("user_id,company_name").in("user_id", ids);
        const map: Record<string, string> = {};
        emps?.forEach((e: any) => { map[e.user_id] = e.company_name; });
        setViewers(vw.map((v: any) => ({ name: map[v.viewer_user_id] || "An employer", created_at: v.created_at })));
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <Layout><div className="container py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></Layout>;

  const completeness = (() => {
    if (!talent) return 10;
    let n = 20;
    if (talent.skill_description) n += 20;
    if (talent.extracted_skills?.length) n += 25;
    if (talent.experience_level) n += 10;
    if (talent.career_goals) n += 10;
    if ((talent.proof_links as any[])?.length) n += 15;
    return Math.min(100, n);
  })();

  const matches = jobs.map(j => ({
    job: j,
    match: calculateMatch({
      talentSkills: talent?.extracted_skills || [],
      jobSkills: j.required_skills || [],
      talentLocation: profile?.location, jobLocation: j.location,
      experienceLevel: talent?.experience_level,
    })
  })).filter(m => m.match.score > 0).sort((a, b) => b.match.score - a.match.score).slice(0, 6);

  return (
    <Layout>
      <section className="border-b border-border/60 bg-gradient-hero">
        <div className="container py-12 text-navy-foreground">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary-glow/30 bg-primary-glow/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-glow">
                <UserCheck className="h-3 w-3" /> Talent Dashboard
              </div>
              <h1 className="font-display text-3xl font-bold md:text-4xl">Hi, {profile?.name?.split(" ")[0] || "there"} 👋</h1>
              <p className="mt-2 max-w-xl text-navy-foreground/75">Your profile is your gateway. Keep it sharp — employers are searching every day.</p>
            </div>
            <Link to="/talent/edit" className="inline-flex items-center gap-2 rounded-xl bg-gradient-accent px-5 py-3 font-bold text-accent-foreground shadow-elegant transition-smooth hover:shadow-glow">
              <Edit3 className="h-4 w-4" /> Edit profile
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-10 space-y-8">
        {/* Profile overview + completeness */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary font-display text-2xl font-extrabold text-primary-foreground shadow-glow">
                {(profile?.name || "U").split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-xl font-bold">{profile?.name}</h2>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {profile?.location || "Add your location"}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Pill icon={Sparkles} label={talent?.primary_skill || "No primary skill yet"} variant="primary" />
                  {talent?.experience_level && <Pill icon={TrendingUp} label={talent.experience_level} variant="accent" />}
                  <Pill icon={Award} label={`Credibility ${talent?.credibility_score || 0}`} variant="muted" />
                </div>
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Profile completeness</span>
                <span className="text-primary">{completeness}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-gradient-primary transition-all" style={{ width: `${completeness}%` }} />
              </div>
            </div>
            {talent?.extracted_skills?.length ? (
              <div className="mt-5">
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Detected skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {talent.extracted_skills.map(s => <span key={s} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">{s}</span>)}
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm">
                Add your skill description to let AI build your structured profile. <Link to="/talent/edit" className="font-semibold text-primary hover:underline">Get started →</Link>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <StatCard icon={Eye} label="Profile views" value={talent?.profile_views || viewers.length || 0} accent="primary" />
            <StatCard icon={Briefcase} label="Matched roles" value={matches.length} accent="accent" />
            <StatCard icon={UserCheck} label="Visibility" value={talent?.available ? "Active" : "Hidden"} accent="success" />
          </div>
        </div>

        {/* Recommended opportunities */}
        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Recommended opportunities</h2>
              <p className="text-sm text-muted-foreground">Live jobs ranked by skill match.</p>
            </div>
            <Link to="/opportunities" className="text-sm font-semibold text-primary hover:underline">All opportunities →</Link>
          </div>
          {matches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center text-muted-foreground">
              No live job matches yet. {!talent?.extracted_skills?.length && <>Add your skills to see matches.</>}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {matches.map(({ job, match }) => (
                <div key={job.id} className="group rounded-2xl border border-border bg-card p-5 shadow-card transition-smooth hover:-translate-y-0.5 hover:shadow-elegant">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold leading-tight">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{employerNames[job.employer_id] || "Employer"} · {job.location || "Remote"}</p>
                    </div>
                    <MatchBadge score={match.score} />
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {job.required_skills.slice(0, 5).map(s => (
                      <span key={s} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${match.overlap.map(o => o.toLowerCase()).includes(s.toLowerCase()) ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"}`}>{s}</span>
                    ))}
                  </div>
                  {match.reasons[0] && <p className="text-xs text-muted-foreground">✨ {match.reasons[0]}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Employer interest */}
        {viewers.length > 0 && (
          <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-card">
            <h3 className="mb-3 font-display text-lg font-bold">Employer interest</h3>
            <ul className="space-y-2 text-sm">
              {viewers.map((v, i) => (
                <li key={i} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-none last:pb-0">
                  <span className="font-medium">{v.name}</span>
                  <span className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </Layout>
  );
};

const Pill = ({ icon: Icon, label, variant }: any) => {
  const cls = variant === "primary" ? "bg-primary/10 text-primary" : variant === "accent" ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground";
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}><Icon className="h-3 w-3" /> {label}</span>;
};

const StatCard = ({ icon: Icon, label, value, accent }: any) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
    <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${accent === "primary" ? "bg-primary/10 text-primary" : accent === "accent" ? "bg-accent/15 text-accent" : "bg-success/10 text-success"}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="font-display text-2xl font-extrabold">{value}</div>
    <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
  </div>
);

const MatchBadge = ({ score }: { score: number }) => {
  const tone = score >= 75 ? "bg-success text-success-foreground" : score >= 50 ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground";
  return (
    <div className={`shrink-0 rounded-xl px-3 py-1.5 text-center ${tone}`}>
      <div className="font-display text-lg font-extrabold leading-none">{score}%</div>
      <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">Match</div>
    </div>
  );
};

export default TalentDashboard;
