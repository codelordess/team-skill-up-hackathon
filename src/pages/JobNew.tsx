import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

const schema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(2000).optional(),
  location: z.string().trim().max(120).optional(),
  job_type: z.enum(["remote", "on-site", "hybrid"]),
  required_skills: z.array(z.string()).min(1, "Add at least one required skill"),
});

const JobNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Remote");
  const [jobType, setJobType] = useState<"remote" | "on-site" | "hybrid">("remote");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
  };

  const submit = async () => {
    if (!user) return;
    const parsed = schema.safeParse({ title, description, location, job_type: jobType, required_skills: skills });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }

    setBusy(true);
    try {
      const { data: emp } = await supabase.from("employers").select("id").eq("user_id", user.id).maybeSingle();
      if (!emp) throw new Error("Set up your company profile first");
      const { error } = await supabase.from("jobs").insert({
        employer_id: emp.id, title, description, location, job_type: jobType, required_skills: skills,
      });
      if (error) throw error;
      toast.success("Job posted");
      navigate("/employer/dashboard");
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const i = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <Layout>
      <section className="container max-w-2xl py-10 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Post a job</h1>
          <p className="text-muted-foreground">We'll instantly match it against our talent pool.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
          <Field label="Job title"><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Junior Frontend Developer" className={i} /></Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Location"><input value={location} onChange={e => setLocation(e.target.value)} placeholder="Remote, Lagos, etc." className={i} /></Field>
            <Field label="Job type">
              <select value={jobType} onChange={e => setJobType(e.target.value as any)} className={i}>
                <option value="remote">Remote</option>
                <option value="on-site">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </Field>
          </div>
          <Field label="Required skills">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {skills.map(s => (
                <span key={s} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {s} <button type="button" onClick={() => setSkills(skills.filter(x => x !== s))}><Trash2 className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())} placeholder="React, HTML, CSS..." className={i} />
              <button type="button" onClick={addSkill} className="inline-flex items-center gap-1 rounded-lg border border-input px-3 text-sm font-semibold hover:bg-secondary"><Plus className="h-4 w-4" /></button>
            </div>
          </Field>
          <Field label="Description">
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} placeholder="What the role involves, responsibilities, perks..." className={`${i} h-auto py-3`} />
          </Field>
        </div>
        <button onClick={submit} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-7 py-3 font-bold text-primary-foreground shadow-elegant disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Post job
        </button>
      </section>
    </Layout>
  );
};

const Field = ({ label, children }: any) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
    {children}
  </div>
);

export default JobNew;
