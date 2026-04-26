import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Brain, CheckCircle2, ChevronDown, ChevronUp, FileText,
  Globe, Loader2, Plus, Save, Sparkles, Star, Trash2,
  TrendingUp, Upload, Wand2, X, AlertCircle, DollarSign,
  Languages, Briefcase, Award
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://skillmap-gy34.onrender.com/api";

const LEVELS = [
  "Beginner", "Beginner–Intermediate", "Intermediate",
  "Intermediate–Advanced", "Advanced"
];

const JOB_TYPES = ["Remote", "On-site", "Hybrid", "Freelance", "Contract", "Full-time", "Part-time"];

const LANGUAGES = [
  "English", "French", "Arabic", "Swahili", "Hausa", "Yoruba", "Igbo",
  "Amharic", "Zulu", "Shona", "Portuguese", "Spanish", "Pidgin"
];

type ScreeningResult = {
  overall_score: number;
  profile_completeness: number;
  market_readiness: number;
  skill_clarity: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  recommended_roles: string[];
  salary_insight: string;
};

const ScoreRing = ({ score, label, color }: { score: number; label: string; color: string }) => {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-16 w-16">
        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-border" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{score}</span>
      </div>
      <span className="text-center text-xs text-muted-foreground leading-tight">{label}</span>
    </div>
  );
};

const TalentEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [screening, setScreening] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [screenResult, setScreenResult] = useState<ScreeningResult | null>(null);
  const [screenOpen, setScreenOpen] = useState(false);
  const [cvFileName, setCvFileName] = useState("");

  // Basic
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Skills
  const [description, setDescription] = useState("");
  const [primarySkill, setPrimarySkill] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [credibility, setCredibility] = useState(50);

  // Work preferences
  const [jobType, setJobType] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);

  // Extras
  const [proofLinks, setProofLinks] = useState<{ label: string; url: string }[]>([]);
  const [socialLinks, setSocialLinks] = useState<{ label: string; url: string }[]>([]);
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
        setCareerGoals(t.career_goals || "");
        setAvailable(t.available ?? true);

        const pl = (t.proof_links as any) || [];
        // Separate proof links from social links
        const socials = pl.filter((l: any) => ["GitHub", "LinkedIn", "Twitter", "Behance", "Dribbble"].includes(l.label));
        const proofs = pl.filter((l: any) => !["GitHub", "LinkedIn", "Twitter", "Behance", "Dribbble"].includes(l.label));
        setSocialLinks(socials.length ? socials : [{ label: "GitHub", url: "" }]);
        setProofLinks(proofs);

        // Extended fields from JSONB extra column if it exists
        const extra = (t as any).extra_data || {};
        setBio(extra.bio || "");
        setPortfolioUrl(extra.portfolio_url || "");
        setJobType(extra.job_type || []);
        setHourlyRate(extra.hourly_rate || "");
        setLanguages(extra.languages || []);
      }
      setLoading(false);
    })();
  }, [user]);

  // ── CV Upload & Parse ──────────────────────────────────────────────────

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["application/pdf", "text/plain"].includes(file.type)) {
      toast.error("Please upload a PDF or TXT file");
      return;
    }

    setUploading(true);
    setCvFileName(file.name);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/v1/talent/parse-cv`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to parse CV");
      }
      const data = await res.json();

      // Auto-fill only empty fields
      if (data.name && !name) setName(data.name);
      if (data.location && !location) setLocation(data.location);
      if (data.description) setDescription(data.description);
      if (data.primary_skill) setPrimarySkill(data.primary_skill);
      if (data.extracted_skills?.length) setSkills(prev => [...new Set([...prev, ...data.extracted_skills])]);
      if (data.experience_level) setLevel(data.experience_level);
      if (data.career_goals && !careerGoals) setCareerGoals(data.career_goals);
      if (data.languages?.length) setLanguages(prev => [...new Set([...prev, ...data.languages])]);
      if (data.hourly_rate && !hourlyRate) setHourlyRate(data.hourly_rate);
      if (data.social_links?.length) {
        setSocialLinks(prev => {
          const existing = prev.map(l => l.label);
          const newLinks = data.social_links.filter((l: any) => !existing.includes(l.label));
          return [...prev, ...newLinks];
        });
      }

      toast.success("CV parsed! Review and adjust the filled fields.");
    } catch (err: any) {
      toast.error(err.message || "CV parsing failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // ── AI Skill Extraction ────────────────────────────────────────────────

  const runAI = async () => {
    if (description.length < 20) {
      toast.error("Describe your work in more detail (20+ chars)");
      return;
    }
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

  // ── AI Screening ───────────────────────────────────────────────────────

  const runScreening = async () => {
    if (!description && !primarySkill) {
      toast.error("Fill in your skill description first");
      return;
    }
    setScreening(true);
    try {
      const res = await fetch(`${API_URL}/v1/talent/screen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          primary_skill: primarySkill,
          extracted_skills: skills,
          experience_level: level,
          career_goals: careerGoals,
          proof_links: [...proofLinks, ...socialLinks].filter(l => l.url),
          languages,
          hourly_rate: hourlyRate,
          job_type: jobType.join(", "),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Screening failed");
      }
      const data: ScreeningResult = await res.json();
      setScreenResult(data);
      setScreenOpen(true);
      toast.success("AI screening complete!");
    } catch (err: any) {
      toast.error(err.message || "Screening failed");
    } finally {
      setScreening(false);
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const allLinks = [
        ...socialLinks.filter(l => l.url),
        ...proofLinks.filter(l => l.url || l.label),
      ];
      const extraData = { bio, portfolio_url: portfolioUrl, job_type: jobType, hourly_rate: hourlyRate, languages };

      const [profRes, talentRes] = await Promise.all([
        supabase.from("profiles").update({ name, location }).eq("id", user.id),
        supabase.from("talents").update({
          skill_description: description,
          primary_skill: primarySkill || null,
          extracted_skills: skills,
          experience_level: level,
          credibility_score: credibility,
          proof_links: allLinks as any,
          career_goals: careerGoals,
          available,
        }).eq("user_id", user.id),
      ]);

      if (profRes.error) throw profRes.error;
      if (talentRes.error) throw talentRes.error;

      // Store extended fields — try updating extra_data column if it exists
      await supabase.from("talents")
        .update({ extra_data: extraData } as any)
        .eq("user_id", user.id)
        .then(() => {}) // Silently ignore if column doesn't exist yet
        .catch(() => {});

      toast.success("Profile saved!");
      navigate("/talent/dashboard");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
  };

  const toggleJobType = (t: string) =>
    setJobType(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const toggleLanguage = (l: string) =>
    setLanguages(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);

  if (loading) return (
    <Layout>
      <div className="container py-20 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <section className="container max-w-3xl py-10 space-y-6">

        {/* Header */}
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
            <Sparkles className="h-3 w-3" /> Edit your talent profile
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Tell us what you do.</h1>
          <p className="text-muted-foreground">Your profile is your pitch — make it count.</p>
        </div>

        {/* CV Upload banner */}
        <div
          onClick={() => fileRef.current?.click()}
          className="cursor-pointer rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 flex items-center gap-4 hover:border-primary/60 hover:bg-primary/10 transition-all group"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
            {uploading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Upload className="h-6 w-6 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">
              {uploading ? "Parsing your CV with AI..." : cvFileName ? `✓ ${cvFileName}` : "Upload CV to auto-fill profile"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {uploading ? "Extracting skills, experience, and links..." : "PDF or TXT · Max 5MB · AI extracts skills, experience & links"}
            </p>
          </div>
          {!uploading && (
            <div className="shrink-0">
              <span className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                {cvFileName ? "Replace" : "Upload"}
              </span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden" onChange={handleCvUpload} />

        {/* Basic Info */}
        <Block title="Basic info" icon={<FileText className="h-4 w-4" />}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full name">
              <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Location">
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" className={inputCls} />
            </Field>
          </div>
          <Field label="Short bio">
            <textarea
              value={bio} onChange={e => setBio(e.target.value)} rows={2}
              placeholder="One sentence about yourself and what makes you unique"
              className={`${inputCls} h-auto py-3`}
            />
          </Field>
          <Field label="Portfolio / personal website">
            <input value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)}
              placeholder="https://yourportfolio.com" className={inputCls} />
          </Field>
        </Block>

        {/* Skill Description */}
        <Block title="Skill description" icon={<Brain className="h-4 w-4" />}
          subtitle="Describe what you do, what tools you use, what you've built or sold.">
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

        {/* AI-Extracted Skills */}
        <Block title="Skills & experience" icon={<Award className="h-4 w-4" />} subtitle="AI-extracted — review and edit as needed.">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Primary skill">
              <input value={primarySkill} onChange={e => setPrimarySkill(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Experience level">
              <select value={level} onChange={e => setLevel(e.target.value)} className={inputCls}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Skills">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {skills.map(s => (
                <span key={s} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {s}
                  <button type="button" onClick={() => setSkills(skills.filter(x => x !== s))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                placeholder="Type a skill and press Enter" className={inputCls} />
              <button type="button" onClick={addSkill}
                className="inline-flex items-center gap-1 rounded-lg border border-input px-3 text-sm font-semibold hover:bg-secondary shrink-0">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
          </Field>
          <Field label={`Credibility score: ${credibility}/100`}>
            <div className="space-y-1">
              <input type="range" min={30} max={95} value={credibility}
                onChange={e => setCredibility(Number(e.target.value))} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground">
                {credibility < 50 ? "Add proof links to boost this" :
                  credibility < 70 ? "Looking good — add more details to improve" :
                    "Strong profile — keep it up!"}
              </p>
            </div>
          </Field>
        </Block>

        {/* Work Preferences */}
        <Block title="Work preferences" icon={<Briefcase className="h-4 w-4" />}>
          <Field label="Job type (select all that apply)">
            <div className="flex flex-wrap gap-2 mt-1">
              {JOB_TYPES.map(t => (
                <button key={t} type="button" onClick={() => toggleJobType(t)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                    jobType.includes(t)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/50"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Expected rate (optional)">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={hourlyRate} onChange={e => setHourlyRate(e.target.value)}
                placeholder="e.g. $15-25/hr or $500/project"
                className={`${inputCls} pl-9`} />
            </div>
          </Field>
        </Block>

        {/* Languages */}
        <Block title="Languages" icon={<Languages className="h-4 w-4" />}>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(l => (
              <button key={l} type="button" onClick={() => toggleLanguage(l)}
                className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                  languages.includes(l)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:border-primary/50"
                }`}>
                {l}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Don't see your language? Add it as a skill above.</p>
        </Block>

        {/* Social Links */}
        <Block title="Social & online presence" icon={<Globe className="h-4 w-4" />}>
          {socialLinks.map((link, i) => (
            <div key={i} className="flex gap-2">
              <select  value={link.label}
                onChange={e => { const c = [...socialLinks]; c[i].label = e.target.value; setSocialLinks(c); }}
                className={`${inputCls} w-36 `} style={{width:'fit-content'}} >
                {["GitHub", "LinkedIn", "Twitter", "Behance", "Dribbble", "YouTube", "Instagram", "Other"].map(o => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <input value={link.url}
                onChange={e => { const c = [...socialLinks]; c[i].url = e.target.value; setSocialLinks(c); }}
                placeholder="https://..." className={inputCls} style={{'flex': 1}}  />
              <button onClick={() => setSocialLinks(socialLinks.filter((_, x) => x !== i))}
                className="rounded-lg border border-input px-3 hover:bg-secondary shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button onClick={() => setSocialLinks([...socialLinks, { label: "GitHub", url: "" }])}
            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-input px-3 py-2 text-sm hover:bg-secondary">
            <Plus className="h-4 w-4" /> Add social link
          </button>
        </Block>

        {/* Proof of Work */}
        <Block title="Proof of work" icon={<Star className="h-4 w-4" />}
          subtitle="Projects, clients, live URLs — anything that proves your skills.">
          {proofLinks.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input value={p.label}
                onChange={e => { const c = [...proofLinks]; c[i].label = e.target.value; setProofLinks(c); }}
                placeholder="Label (e.g. Client project)" className={`${inputCls}`} style={{'width':'fit-content'}} />
              <input value={p.url}
                onChange={e => { const c = [...proofLinks]; c[i].url = e.target.value; setProofLinks(c); }}
                placeholder="https://..." className={inputCls} />
              <button onClick={() => setProofLinks(proofLinks.filter((_, x) => x !== i))}
                className="rounded-lg border border-input px-3 hover:bg-secondary shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button onClick={() => setProofLinks([...proofLinks, { label: "", url: "" }])}
            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-input px-3 py-2 text-sm hover:bg-secondary">
            <Plus className="h-4 w-4" /> Add proof link
          </button>
        </Block>

        {/* Career Goals */}
        <Block title="Career goals" icon={<TrendingUp className="h-4 w-4" />}>
          <textarea value={careerGoals} onChange={e => setCareerGoals(e.target.value)} rows={3}
            placeholder="What are you looking for next? What kind of work excites you?"
            className={`${inputCls} h-auto py-3`} />
        </Block>

        {/* Visibility */}
        <Block title="Visibility">
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setAvailable(v => !v)}
              className={`relative h-6 w-11 rounded-full transition-colors ${available ? "bg-primary" : "bg-border"}`}>
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${available ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <div>
              <p className="text-sm font-semibold">{available ? "Visible to employers" : "Hidden from employers"}</p>
              <p className="text-xs text-muted-foreground">Toggle when you're open to opportunities</p>
            </div>
          </label>
        </Block>

        {/* AI Screening Button */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-primary/5 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold">AI Profile Screening</h3>
              <p className="text-sm text-muted-foreground">
                Get a personalized score and actionable tips based on your specialization — tailored specifically to your field.
              </p>
            </div>
          </div>
          <button onClick={runScreening} disabled={screening}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary px-6 py-3 font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-60">
            {screening ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {screening ? "Analyzing your profile..." : "Screen my profile with AI"}
          </button>
        </div>

        {/* Screening Results */}
        {screenResult && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setScreenOpen(v => !v)}
              className="w-full flex items-center justify-between p-6 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-lg
                  ${screenResult.overall_score >= 70 ? "bg-green-500/20 text-green-500" :
                    screenResult.overall_score >= 50 ? "bg-amber-500/20 text-amber-500" :
                      "bg-red-500/20 text-red-500"}`}>
                  {screenResult.overall_score}
                </div>
                <div className="text-left">
                  <p className="font-bold">AI Screening Results</p>
                  <p className="text-xs text-muted-foreground">
                    {screenResult.overall_score >= 70 ? "Strong profile — ready for employers" :
                      screenResult.overall_score >= 50 ? "Good start — a few improvements needed" :
                        "Needs work — follow the suggestions below"}
                  </p>
                </div>
              </div>
              {screenOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </button>

            {screenOpen && (
              <div className="px-6 pb-6 space-y-6 border-t border-border">
                {/* Score rings */}
                <div className="pt-6 grid grid-cols-4 gap-4">
                  <ScoreRing score={screenResult.overall_score} label="Overall" color="#6366f1" />
                  <ScoreRing score={screenResult.profile_completeness} label="Completeness" color="#8b5cf6" />
                  <ScoreRing score={screenResult.market_readiness} label="Market Ready" color="#06b6d4" />
                  <ScoreRing score={screenResult.skill_clarity} label="Skill Clarity" color="#10b981" />
                </div>

                {/* Summary */}
                <div className="rounded-xl bg-secondary/50 p-4">
                  <p className="text-sm leading-relaxed">{screenResult.summary}</p>
                </div>

                {/* Strengths */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Strengths
                  </h4>
                  <div className="space-y-2">
                    {screenResult.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improvements */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" /> Improvements
                  </h4>
                  <div className="space-y-2">
                    {screenResult.improvements.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended roles */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Recommended roles
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {screenResult.recommended_roles.map((r, i) => (
                      <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Salary insight */}
                <div className="rounded-xl border border-border p-4 flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Market Rate Insight</p>
                    <p className="text-sm">{screenResult.salary_insight}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Skill Assessment CTA */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">Skill Assessment</h3>
              <p className="text-sm text-muted-foreground">
                {primarySkill
                  ? <>Take an AI-powered test for <strong>{primarySkill}</strong> and earn a verified badge that appears on your profile.</>
                  : "Set your primary skill above, then take an AI-powered assessment to earn a verified badge."}
              </p>
            </div>
          </div>
          {primarySkill ? (
            <Link
              to="/talent/assessment"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 font-bold text-primary-foreground shadow-elegant hover:shadow-glow transition-all"
            >
              <Brain className="h-4 w-4" /> Take skill assessment
            </Link>
          ) : (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Set your primary skill first to unlock the assessment.
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="sticky bottom-4 flex justify-end">
          <button onClick={save} disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-7 py-3 font-bold text-primary-foreground shadow-elegant disabled:opacity-60 hover:shadow-glow transition-all">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save profile
          </button>
        </div>
      </section>
    </Layout>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────

const inputCls = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition";

const Block = ({ title, subtitle, icon, children }: {
  title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
    <div className="flex items-center gap-2">
      {icon && <span className="text-primary">{icon}</span>}
      <div>
        <h2 className="font-display text-lg font-bold">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
      {label}
    </label>
    {children}
  </div>
);

export default TalentEdit;