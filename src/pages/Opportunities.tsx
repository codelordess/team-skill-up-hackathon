import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { SKILL_CATEGORIES } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Briefcase, Calendar, CheckCircle2, DollarSign, Filter,
  Loader2, MapPin, Sparkles, X
} from "lucide-react";

type OpportunityType = "Job" | "Gig" | "Apprenticeship" | "Training" | "Mentorship";

const TYPES: OpportunityType[] = ["Job", "Gig", "Apprenticeship", "Training", "Mentorship"];

const TYPE_STYLE: Record<string, string> = {
  Job:           "bg-primary/15 text-primary",
  Gig:           "bg-accent/15 text-accent",
  Training:      "bg-success/15 text-success",
  Mentorship:    "bg-pink-500/15 text-pink-600",
  Apprenticeship:"bg-amber-500/15 text-amber-600",
};

// ── Apply modal ────────────────────────────────────────────────────────────
const ApplyModal = ({
  job, onClose, onSuccess,
}: {
  job: any;
  onClose: () => void;
  onSuccess: (jobId: string) => void;
}) => {
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user) { toast.error("Sign in to apply"); return; }
    setBusy(true);
    try {
      // Get talent's employer_id from job
      const { error } = await supabase.from("job_applications").insert({
        job_id: job.rawId,
        talent_user_id: user.id,
        employer_id: job.employer_id,
        cover_note: note.trim() || null,
        status: "pending",
      });
      if (error) {
        if (error.code === "23505") {
          toast.error("You've already applied to this job.");
        } else {
          throw error;
        }
        return;
      }
      toast.success("Application submitted! 🎉");
      onSuccess(job.rawId);
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to apply");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-elegant space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-bold">Apply for this role</h3>
            <p className="text-sm text-primary font-medium mt-0.5">{job.title}</p>
            <p className="text-xs text-muted-foreground">{job.provider}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-secondary transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Cover note <span className="text-muted-foreground font-normal normal-case">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={4}
            placeholder="Tell the employer why you're a great fit. Mention relevant experience, tools you use, or projects you've built."
            className="h-auto w-full rounded-lg border border-input bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-muted-foreground">{note.length}/500</p>
        </div>

        <div className="rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground">
          Your SkillMap profile (skills, experience, credibility score) will be shared with the employer automatically.
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-secondary transition">
            Cancel
          </button>
          <button onClick={submit} disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-elegant disabled:opacity-60 hover:shadow-glow transition-all">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Submit application
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────
const Opportunities = () => {
  const { user, role } = useAuth();
  const [type, setType] = useState<OpportunityType | "">("");
  const [skill, setSkill] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [q, setQ] = useState("");
  const [liveJobs, setLiveJobs] = useState<any[]>([]);
  const [staticOpps, setStaticOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyTarget, setApplyTarget] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      // Fetch live jobs from DB
      const { data: jobs } = await supabase
        .from("jobs")
        .select("*, employers(id, company_name)")
        .eq("active", true)
        .order("created_at", { ascending: false });

      const mapped = (jobs || []).map((j: any) => ({
        id: `live-${j.id}`,
        rawId: j.id,
        employer_id: j.employers?.id,
        title: j.title,
        provider: j.employers?.company_name || "Employer",
        providerType: "SkillMap Employer",
        type: "Job" as OpportunityType,
        location: j.location || "Remote",
        remote: true,
        requiredSkills: j.required_skills || [],
        matchSkillCategory: "",
        compensation: "Negotiable",
        description: j.description || "Apply to learn more about this opportunity.",
        deadline: "Open",
        isLive: true,
      }));

      // Static opportunities from Supabase opportunities table
      const { data: opps } = await supabase
        .from("opportunities")
        .select("*")
        .eq("active", true);

      const staticMapped = (opps || []).map((o: any) => ({
        id: `opp-${o.id}`,
        rawId: o.id,
        employer_id: null,
        title: o.title,
        provider: "SkillMap",
        providerType: o.type,
        type: o.type as OpportunityType,
        location: o.location || "Remote",
        remote: (o.location || "Remote").toLowerCase().includes("remote") || o.location === "Online",
        requiredSkills: o.required_skills || [],
        matchSkillCategory: "",
        compensation: "See details",
        description: o.description || "",
        deadline: "Open",
        isLive: false,
      }));

      setLiveJobs(mapped);
      setStaticOpps(staticMapped);

      // Fetch user's existing applications
      if (user && role === "talent") {
        const { data: apps } = await supabase
          .from("job_applications")
          .select("job_id")
          .eq("talent_user_id", user.id);
        setAppliedIds(new Set((apps || []).map((a: any) => a.job_id)));
      }

      setLoading(false);
    })();
  }, [user, role]);

  const all = [...liveJobs, ...staticOpps];

  const results = useMemo(() => all.filter(o => {
    if (type && o.type !== type) return false;
    if (skill && !o.requiredSkills.some((s: string) => s.toLowerCase().includes(skill.toLowerCase()))) return false;
    if (remoteOnly && !o.remote) return false;
    if (q && !`${o.title} ${o.provider} ${o.description}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [type, skill, remoteOnly, q, all]);

  return (
    <Layout>
      {applyTarget && (
        <ApplyModal
          job={applyTarget}
          onClose={() => setApplyTarget(null)}
          onSuccess={id => setAppliedIds(prev => new Set([...prev, id]))}
        />
      )}

      <section className="border-b border-border/60 bg-card/50">
        <div className="container py-12">
          <div className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Opportunities</div>
          <h1 className="mb-3 font-display text-4xl font-bold md:text-5xl">Jobs, gigs, training & mentorship</h1>
          <p className="max-w-2xl text-muted-foreground">
            Live opportunities from startups, SMEs, and mentor networks. Apply directly with your SkillMap profile.
          </p>
        </div>
      </section>

      <section className="container py-8">
        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold">Filters</span>
            {(type || skill || remoteOnly || q) && (
              <button onClick={() => { setType(""); setSkill(""); setRemoteOnly(false); setQ(""); }}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground underline">
                Clear all
              </button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-12">
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search opportunities..."
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 md:col-span-4" />
            <select value={type} onChange={e => setType(e.target.value as any)}
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 md:col-span-3">
              <option value="">All types</option>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={skill} onChange={e => setSkill(e.target.value)}
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 md:col-span-3">
              <option value="">All skills</option>
              {SKILL_CATEGORIES.map(s => <option key={s.name}>{s.name}</option>)}
            </select>
            <label className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium cursor-pointer md:col-span-2">
              <input type="checkbox" checked={remoteOnly} onChange={e => setRemoteOnly(e.target.checked)}
                className="h-4 w-4 accent-primary" />
              Remote only
            </label>
          </div>
        </div>

        <div className="mb-4 text-sm text-muted-foreground">
          {loading ? (
            <span className="inline-flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...</span>
          ) : (
            <><span className="font-semibold text-foreground">{results.length}</span> opportunit{results.length === 1 ? "y" : "ies"} found</>
          )}
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 animate-pulse space-y-3">
                <div className="h-3 w-20 rounded-full bg-secondary" />
                <div className="h-5 w-3/4 rounded-lg bg-secondary" />
                <div className="h-3 w-1/2 rounded-full bg-secondary" />
                <div className="h-16 rounded-lg bg-secondary" />
                <div className="h-9 rounded-xl bg-secondary" />
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center text-muted-foreground">
            No opportunities match your filters. Try clearing some filters.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {results.map(o => {
              const isApplied = appliedIds.has(o.rawId);
              const canApply = role === "talent" && o.isLive && o.employer_id;
              return (
                <div key={o.id}
                  className="group flex flex-col rounded-2xl border border-border bg-gradient-card p-6 shadow-card transition-smooth hover:-translate-y-0.5 hover:shadow-elegant">
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${TYPE_STYLE[o.type] || "bg-secondary text-foreground"}`}>
                        {o.type}
                      </span>
                      {o.remote && (
                        <span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-success">
                          Remote
                        </span>
                      )}
                      {o.isLive && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                          </span>
                          Live
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Calendar className="h-3.5 w-3.5" />
                      {o.deadline}
                    </div>
                  </div>

                  {/* Title + provider */}
                  <h3 className="font-display text-lg font-bold">{o.title}</h3>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    <Briefcase className="h-3.5 w-3.5" /> {o.provider}
                    <span className="text-muted-foreground font-normal">· {o.providerType}</span>
                  </p>

                  {/* Description */}
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{o.description}</p>

                  {/* Skills */}
                  {o.requiredSkills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {o.requiredSkills.slice(0, 5).map((s: string) => (
                        <span key={s} className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">{s}</span>
                      ))}
                      {o.requiredSkills.length > 5 && (
                        <span className="text-xs text-muted-foreground">+{o.requiredSkills.length - 5}</span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4 text-sm">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />{o.compensation}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />{o.location}
                      </span>
                    </div>

                    {/* Apply button */}
                    {canApply ? (
                      isApplied ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-success/10 border border-success/20 px-3 py-1.5 text-xs font-bold text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => setApplyTarget(o)}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-smooth hover:bg-primary/90">
                          <Sparkles className="h-3 w-3" /> Apply
                        </button>
                      )
                    ) : !role ? (
                      <a href="/auth?mode=signup&role=talent"
                        className="inline-flex items-center gap-1 rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition">
                        Sign up to apply
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">External opportunity</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Opportunities;
