import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { calculateMatch } from "@/lib/scoring";
import { ArrowLeft, Loader2 } from "lucide-react";

const JobMatches = () => {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: j } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
      setJob(j);
      const { data: ts } = await supabase.from("talents").select("*").eq("available", true);
      const ids = (ts || []).map((t: any) => t.user_id);
      const { data: ps } = ids.length ? await supabase.from("profiles").select("id,name,location").in("id", ids) : { data: [] as any };
      const pMap: Record<string, any> = {};
      (ps || []).forEach((p: any) => { pMap[p.id] = p; });
      const ranked = (ts || []).map((t: any) => {
        const profile = pMap[t.user_id];
        const m = calculateMatch({
          talentSkills: t.extracted_skills || [],
          jobSkills: j?.required_skills || [],
          talentLocation: profile?.location, jobLocation: j?.location,
          experienceLevel: t.experience_level,
        });
        return { t, profile, m };
      }).filter(x => x.profile && x.m.score > 0).sort((a, b) => b.m.score - a.m.score);
      setResults(ranked);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <Layout><div className="container py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></Layout>;
  if (!job) return <Layout><div className="container py-20 text-center">Job not found.</div></Layout>;

  return (
    <Layout>
      <section className="container py-10 space-y-6">
        <Link to="/employer/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back</Link>
        <div>
          <h1 className="font-display text-3xl font-bold">{job.title}</h1>
          <p className="text-muted-foreground">{job.location || "Remote"} · {job.job_type}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(job.required_skills || []).map((s: string) => <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-xs">{s}</span>)}
          </div>
        </div>
        <div>
          <h2 className="mb-4 font-display text-xl font-bold">{results.length} matched candidates</h2>
          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center text-muted-foreground">No matching candidates yet.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {results.map(({ t, profile, m }) => (
                <Link key={t.user_id} to={`/employer/talent/${t.user_id}`} className="group rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-elegant">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold">{profile.name}</h3>
                      <p className="text-xs text-muted-foreground">{profile.location || "Remote"} · {t.experience_level || "—"}</p>
                      <p className="mt-1 text-sm font-semibold text-primary">{t.primary_skill}</p>
                    </div>
                    <div className={`rounded-xl px-3 py-1.5 text-center ${m.score >= 75 ? "bg-success text-success-foreground" : "bg-accent text-accent-foreground"}`}>
                      <div className="font-display text-lg font-extrabold leading-none">{m.score}%</div>
                      <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">Match</div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(t.extracted_skills || []).slice(0, 5).map((s: string) => (
                      <span key={s} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${m.overlap.map((o: string) => o.toLowerCase()).includes(s.toLowerCase()) ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"}`}>{s}</span>
                    ))}
                  </div>
                  {m.reasons[0] && <p className="mt-2 text-xs text-muted-foreground">✨ {m.reasons[0]}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default JobMatches;
