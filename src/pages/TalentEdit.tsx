import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, Loader2, Plus, Save, Sparkles, Trash2, Wand2 } from "lucide-react";

const LEVELS = ["Beginner", "Beginner–Intermediate", "Intermediate", "Intermediate–Advanced", "Advanced"];

const TalentEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [primarySkill, setPrimarySkill] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [credibility, setCredibility] = useState(50);
  const [proofLinks, setProofLinks] = useState<{ label: string; url: string }[]>([]);
  const [careerGoals, setCareerGoals] = useState("");
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: t }] = await Promise.all([
        supabase.from("profiles").select("name,location").eq("id", user.id).maybeSingle(),
        supabase.from("talents").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      if (p) { setName(p.name || ""); setLocation(p.location || ""); }
      if (t) {
        setDescription(t.skill_description || "");
        setPrimarySkill(t.primary_skill || "");
        setSkills(t.extracted_skills || []);
        setLevel(t.experience_level || "Beginner");
        setCredibility(t.credibility_score || 50);
        setProofLinks((t.proof_links as any) || []);
        setCareerGoals(t.career_goals || "");
        setAvailable(t.available ?? true);
      }
      setLoading(false);
    })();
  }, [user]);

  const runAI = async () => {
    if (description.length < 20) { toast.error("Describe your work in more detail (20+ chars)"); return; }
    setExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-skills", { body: { description } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPrimarySkill(data.primarySkill);
      setSkills(data.detectedSkills);
      setLevel(data.experienceLevel);
      setCredibility(data.credibilityScore);
      toast.success("AI extracted your skills! Review and adjust as needed.");
    } catch (e: any) {
      toast.error(e.message || "AI extraction failed");
    } finally {
      setExtracting(false);
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const [profRes, talentRes] = await Promise.all([
        supabase.from("profiles").update({ name, location }).eq("id", user.id),
        supabase.from("talents").update({
          skill_description: description,
          primary_skill: primarySkill || null,
          extracted_skills: skills,
          experience_level: level,
          credibility_score: credibility,
          proof_links: proofLinks as any,
          career_goals: careerGoals,
          available,
        }).eq("user_id", user.id),
      ]);
      if (profRes.error) throw profRes.error;
      if (talentRes.error) throw talentRes.error;
      toast.success("Profile saved");
      navigate("/talent/dashboard");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><div className="container py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></Layout>;

  return (
    <Layout>
      <section className="container max-w-3xl py-10 space-y-8">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
            <Sparkles className="h-3 w-3" /> Edit your talent profile
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Tell us what you do.</h1>
          <p className="text-muted-foreground">In your own words. AI turns it into a structured employer-ready profile.</p>
        </div>

        <Block title="Basic info">
          <Field label="Full name"><input value={name} onChange={e => setName(e.target.value)} className={inputCls} /></Field>
          <Field label="Location"><input value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" className={inputCls} /></Field>
        </Block>

        <Block title="Skill description" subtitle="Describe what you do, what tools you use, what you've built or sold.">
          <textarea
            value={description} onChange={e => setDescription(e.target.value)} rows={5}
            placeholder="e.g. I learned React from YouTube and built websites for 3 small businesses in my neighborhood. I also built a small inventory app for my uncle's shop using Firebase."
            className={`${inputCls} h-auto py-3`}
          />
          <button onClick={runAI} disabled={extracting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow disabled:opacity-60">
            {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {extracting ? "Analyzing..." : "Extract skills with AI"}
          </button>
        </Block>

        <Block title="AI-extracted (review & edit)">
          <Field label="Primary skill"><input value={primarySkill} onChange={e => setPrimarySkill(e.target.value)} className={inputCls} /></Field>
          <Field label="Experience level">
            <select value={level} onChange={e => setLevel(e.target.value)} className={inputCls}>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Skills">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {skills.map(s => (
                <span key={s} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {s} <button type="button" onClick={() => setSkills(skills.filter(x => x !== s))}><Trash2 className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())} placeholder="Add a skill" className={inputCls} />
              <button type="button" onClick={addSkill} className="inline-flex items-center gap-1 rounded-lg border border-input px-3 text-sm font-semibold hover:bg-secondary"><Plus className="h-4 w-4" /> Add</button>
            </div>
          </Field>
          <Field label={`Credibility score: ${credibility}`}>
            <input type="range" min={30} max={95} value={credibility} onChange={e => setCredibility(Number(e.target.value))} className="w-full accent-primary" />
          </Field>
        </Block>

        <Block title="Proof of work">
          {proofLinks.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input value={p.label} onChange={e => { const c = [...proofLinks]; c[i].label = e.target.value; setProofLinks(c); }} placeholder="Label" className={inputCls} />
              <input value={p.url} onChange={e => { const c = [...proofLinks]; c[i].url = e.target.value; setProofLinks(c); }} placeholder="https://..." className={inputCls} />
              <button onClick={() => setProofLinks(proofLinks.filter((_, x) => x !== i))} className="rounded-lg border border-input px-3 hover:bg-secondary"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button onClick={() => setProofLinks([...proofLinks, { label: "", url: "" }])} className="inline-flex items-center gap-1 rounded-lg border border-dashed border-input px-3 py-2 text-sm hover:bg-secondary"><Plus className="h-4 w-4" /> Add proof link</button>
        </Block>

        <Block title="Career goals">
          <textarea value={careerGoals} onChange={e => setCareerGoals(e.target.value)} rows={3} placeholder="What are you looking for next?" className={`${inputCls} h-auto py-3`} />
        </Block>

        <Block title="Visibility">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} className="h-4 w-4 accent-primary" />
            <span className="text-sm">Show me to employers (available for opportunities)</span>
          </label>
        </Block>

        <div className="sticky bottom-4 flex justify-end">
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-7 py-3 font-bold text-primary-foreground shadow-elegant disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save profile
          </button>
        </div>
      </section>
    </Layout>
  );
};

const inputCls = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

const Block = ({ title, subtitle, children }: any) => (
  <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
    <div>
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const Field = ({ label, children }: any) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
    {children}
  </div>
);

export default TalentEdit;
