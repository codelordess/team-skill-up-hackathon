import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Award, BookmarkPlus, ExternalLink, Loader2, MapPin, Sparkles, Target } from "lucide-react";
import { calculateMatch } from "@/lib/scoring";

const TalentDetail = () => {
  const { id } = useParams();
  const { user, role } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [talent, setTalent] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [{ data: p }, { data: t }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
        supabase.from("talents").select("*").eq("user_id", id).maybeSingle(),
      ]);
      setProfile(p); setTalent(t);

      if (role === "employer" && user) {
        const { data: emp } = await supabase.from("employers").select("id").eq("user_id", user.id).maybeSingle();
        if (emp) {
          const { data: js } = await supabase.from("jobs").select("*").eq("employer_id", emp.id);
          setJobs(js || []);
        }
        // Record view + check saved
        if (user.id !== id) {
          await supabase.from("profile_views").insert({ talent_user_id: id, viewer_user_id: user.id });
        }
        const { data: sv } = await supabase.from("saved_candidates").select("id").eq("employer_user_id", user.id).eq("talent_user_id", id).maybeSingle();
        setSaved(!!sv);
      }
      setLoading(false);
    })();
  }, [id, user, role]);

  const toggleSave = async () => {
    if (!user || !id) return;
    if (saved) {
      await supabase.from("saved_candidates").delete().eq("employer_user_id", user.id).eq("talent_user_id", id);
      setSaved(false); toast.success("Removed from saved");
    } else {
      const { error } = await supabase.from("saved_candidates").insert({ employer_user_id: user.id, talent_user_id: id });
      if (error) toast.error(error.message); else { setSaved(true); toast.success("Saved candidate"); }
      // Notify talent
      await supabase.from("notifications").insert({
        user_id: id, type: "saved", title: "An employer saved your profile",
        body: "An employer is interested. Keep your profile sharp!", link: "/talent/dashboard",
      });
    }
  };

  if (loading) return <Layout><div className="container py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></Layout>;
  if (!profile || !talent) return <Layout><div className="container py-20 text-center text-muted-foreground">Talent not found.</div></Layout>;

  const matches = jobs.map(j => ({ job: j, m: calculateMatch({ talentSkills: talent.extracted_skills || [], jobSkills: j.required_skills || [] }) })).filter(x => x.m.score > 0).sort((a, b) => b.m.score - a.m.score);

  return (
    <Layout>
      <section className="border-b border-border/60 bg-gradient-hero">
        <div className="container py-12 text-navy-foreground">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-accent font-display text-3xl font-extrabold text-accent-foreground shadow-glow">
                {(profile.name || "U").split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
              </div>
              <div>
                <h1 className="font-display text-3xl font-extrabold md:text-4xl">{profile.name}</h1>
                <p className="mt-1 flex items-center gap-1 text-navy-foreground/75"><MapPin className="h-3 w-3" /> {profile.location || "Remote"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-glow/15 px-3 py-1 text-xs font-bold text-primary-glow"><Sparkles className="h-3 w-3" /> {talent.primary_skill || "—"}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-navy-foreground/10 px-3 py-1 text-xs font-semibold">{talent.experience_level || "—"}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-3 py-1 text-xs font-bold text-success-foreground"><Award className="h-3 w-3" /> Credibility {talent.credibility_score}</span>
                </div>
              </div>
            </div>
            {role === "employer" && (
              <button onClick={toggleSave} className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-bold shadow-elegant ${saved ? "bg-navy-foreground/10 text-navy-foreground" : "bg-gradient-accent text-accent-foreground"}`}>
                <BookmarkPlus className="h-4 w-4" /> {saved ? "Saved" : "Save candidate"}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="container py-10 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {talent.skill_description && (
            <Card title="In their own words"><p className="italic text-muted-foreground">"{talent.skill_description}"</p></Card>
          )}
          <Card title="Skills">
            <div className="flex flex-wrap gap-2">
              {(talent.extracted_skills || []).map((s: string) => <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{s}</span>)}
            </div>
          </Card>
          {talent.career_goals && <Card title="Career goals"><p>{talent.career_goals}</p></Card>}
          {(talent.proof_links || []).length > 0 && (
            <Card title="Proof of work">
              <ul className="space-y-2">
                {(talent.proof_links || []).map((p: any, i: number) => p.url && (
                  <li key={i}><a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">{p.label || p.url} <ExternalLink className="h-3 w-3" /></a></li>
                ))}
              </ul>
            </Card>
          )}
        </div>
        <div className="space-y-4">
          {role === "employer" && matches.length > 0 && (
            <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
              <h3 className="mb-3 inline-flex items-center gap-2 font-display text-lg font-bold"><Target className="h-4 w-4 text-primary" /> Matches your jobs</h3>
              <ul className="space-y-3">
                {matches.map(({ job, m }) => (
                  <li key={job.id} className="flex items-center justify-between gap-3 border-b border-border/50 pb-3 last:border-none last:pb-0">
                    <div>
                      <p className="text-sm font-semibold leading-tight">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{m.reasons[0]}</p>
                    </div>
                    <div className={`shrink-0 rounded-lg px-2 py-1 text-center ${m.score >= 75 ? "bg-success text-success-foreground" : "bg-accent text-accent-foreground"}`}>
                      <div className="font-display text-sm font-extrabold leading-none">{m.score}%</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card text-sm text-muted-foreground">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Profile completeness</p>
            <p className="text-foreground">{Math.min(100, 30 + (talent.skill_description ? 20 : 0) + ((talent.extracted_skills || []).length * 5))}%</p>
          </div>
          <Link to="/opportunities" className="block rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5 text-sm hover:bg-primary/10">
            Browse all opportunities for this person →
          </Link>
        </div>
      </section>
    </Layout>
  );
};

const Card = ({ title, children }: any) => (
  <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
    <h3 className="mb-3 font-display text-lg font-bold">{title}</h3>
    {children}
  </div>
);

export default TalentDetail;
