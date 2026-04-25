import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft, Award, Briefcase, CheckCircle2,
  Clock, Loader2, MapPin, MessageSquare,
  Sparkles, Star, UserCheck, XCircle
} from "lucide-react";

type Application = {
  id: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected";
  cover_note: string | null;
  created_at: string;
  talent_user_id: string;
  talent: {
    name: string;
    location: string | null;
    primary_skill: string | null;
    experience_level: string | null;
    credibility_score: number;
    extracted_skills: string[];
  } | null;
};

const STATUS_STYLE = {
  pending:     "bg-secondary text-muted-foreground",
  reviewed:    "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  shortlisted: "bg-success/10 text-success",
  rejected:    "bg-red-500/10 text-red-500",
};

const STATUS_ICON = {
  pending:     <Clock className="h-3.5 w-3.5" />,
  reviewed:    <Sparkles className="h-3.5 w-3.5" />,
  shortlisted: <CheckCircle2 className="h-3.5 w-3.5" />,
  rejected:    <XCircle className="h-3.5 w-3.5" />,
};

export default function JobApplications() {
  const { id: jobId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !jobId) return;
    (async () => {
      // Fetch job details
      const { data: jobData } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .maybeSingle();
      setJob(jobData);

      // Fetch applications
      const { data: apps } = await supabase
        .from("job_applications")
        .select("id, status, cover_note, created_at, talent_user_id")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (apps?.length) {
        // Fetch talent profiles and skill data
        const ids = apps.map((a: any) => a.talent_user_id);
        const [{ data: profiles }, { data: talents }] = await Promise.all([
          supabase.from("profiles").select("id, name, location").in("id", ids),
          supabase.from("talents").select("user_id, primary_skill, experience_level, credibility_score, extracted_skills").in("user_id", ids),
        ]);

        const profileMap: Record<string, any> = {};
        profiles?.forEach(p => { profileMap[p.id] = p; });
        const talentMap: Record<string, any> = {};
        talents?.forEach(t => { talentMap[t.user_id] = t; });

        setApplications(apps.map((a: any) => ({
          ...a,
          talent: {
            name: profileMap[a.talent_user_id]?.name || "Unknown",
            location: profileMap[a.talent_user_id]?.location || "Remote",
            primary_skill: talentMap[a.talent_user_id]?.primary_skill || null,
            experience_level: talentMap[a.talent_user_id]?.experience_level || null,
            credibility_score: talentMap[a.talent_user_id]?.credibility_score || 0,
            extracted_skills: talentMap[a.talent_user_id]?.extracted_skills || [],
          },
        })));
      } else {
        setApplications([]);
      }
      setLoading(false);
    })();
  }, [user, jobId]);

  const updateStatus = async (appId: string, status: Application["status"]) => {
    setUpdating(appId);
    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ status })
        .eq("id", appId);
      if (error) throw error;
      setApplications(prev =>
        prev.map(a => a.id === appId ? { ...a, status } : a)
      );
      toast.success(`Marked as ${status}`);
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    } finally {
      setUpdating(null);
    }
  };

  const counts = {
    total: applications.length,
    pending: applications.filter(a => a.status === "pending").length,
    shortlisted: applications.filter(a => a.status === "shortlisted").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  if (loading) return (
    <Layout>
      <div className="container py-20 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <section className="border-b border-border/60 bg-gradient-hero">
        <div className="container py-10 text-navy-foreground">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/employer/dashboard"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-navy-foreground/20 hover:bg-navy-foreground/10 transition">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-primary-glow">Applications</div>
              <h1 className="font-display text-2xl font-bold">{job?.title || "Job"}</h1>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 max-w-lg">
            {[
              { label: "Total", value: counts.total, color: "text-primary-glow" },
              { label: "Pending", value: counts.pending, color: "text-amber-400" },
              { label: "Shortlisted", value: counts.shortlisted, color: "text-green-400" },
              { label: "Rejected", value: counts.rejected, color: "text-red-400" },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-navy-foreground/10 bg-navy-foreground/5 p-3 backdrop-blur-sm">
                <div className={`font-display text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-navy-foreground/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-8">
        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Briefcase className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-display text-lg font-bold">No applications yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Share your job posting to attract talent. Applications will appear here when talents apply.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.id}
                className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-primary font-display text-lg font-extrabold text-primary-foreground shadow-card">
                      {(app.talent?.name || "?").split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h3 className="font-display text-lg font-bold">{app.talent?.name}</h3>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[app.status]}`}>
                          {STATUS_ICON[app.status]} {app.status}
                        </span>
                        {app.status === "shortlisted" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500">
                            <Star className="h-3 w-3 fill-amber-500" /> Shortlisted
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {app.talent?.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {app.talent.location}
                          </span>
                        )}
                        {app.talent?.experience_level && (
                          <span className="inline-flex items-center gap-1">
                            <Award className="h-3 w-3" /> {app.talent.experience_level}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <UserCheck className="h-3 w-3" /> Credibility {app.talent?.credibility_score}
                        </span>
                        <span>Applied {new Date(app.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                      </div>

                      {app.talent?.primary_skill && (
                        <p className="mt-1.5 text-xs font-semibold text-primary">{app.talent.primary_skill}</p>
                      )}

                      {app.talent?.extracted_skills?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {app.talent.extracted_skills.slice(0, 6).map(s => (
                            <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-col gap-2 items-end">
                      <Link to={`/employer/talent/${app.talent_user_id}`}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary transition">
                        View profile
                      </Link>
                      {app.cover_note && (
                        <button onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-secondary/80 transition">
                          <MessageSquare className="h-3 w-3" />
                          {expanded === app.id ? "Hide" : "Cover note"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cover note */}
                  {expanded === app.id && app.cover_note && (
                    <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Cover note</p>
                      <p className="text-sm leading-relaxed">{app.cover_note}</p>
                    </div>
                  )}

                  {/* Status buttons */}
                  <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground self-center mr-1">Update status:</p>
                    {(["reviewed", "shortlisted", "rejected"] as const).map(s => (
                      <button
                        key={s}
                        disabled={app.status === s || updating === app.id}
                        onClick={() => updateStatus(app.id, s)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40 ${
                          app.status === s
                            ? STATUS_STYLE[s] + " border border-current/20"
                            : "border border-border hover:bg-secondary"
                        }`}>
                        {updating === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : STATUS_ICON[s]}
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
