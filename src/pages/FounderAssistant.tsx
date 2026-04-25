import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertTriangle, ArrowLeft, ArrowRight, Award, Brain,
  Briefcase, CheckCircle2, ChevronRight, Clock, DollarSign,
  Download, ExternalLink, Lightbulb, Loader2, MapPin, Printer, Rocket,
  Sparkles, Target, Users, Wrench, Zap
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// ── Types ──────────────────────────────────────────────────────────────────
type Stage = "idea" | "mvp" | "early-revenue" | "scaling";

type FounderInput = {
  company_name: string;
  industry: string;
  stage: Stage;
  description: string;
  goal: string;
  budget_usd: number;
  team_size: number;
  location: string;
};

type Tool = {
  name: string; category: string; purpose: string;
  monthly_cost_usd: number; free_tier: boolean;
  priority: "essential" | "recommended" | "optional";
  url: string;
};

type Role = {
  title: string; why_needed: string; hire_order: number;
  budget_range_usd: string; skills_needed: string[];
  full_time_or_freelance: string;
};

type TalentMatch = {
  user_id: string; name: string; primary_skill: string;
  experience_level: string; credibility_score: number;
  location: string; skills: string[];
  fit_reason: string; role_suggestion: string;
};

type Analysis = {
  summary: string;
  budget_breakdown: { category: string; allocated_usd: number; percentage: number }[];
  total_tool_cost: number;
  remaining_for_talent: number;
  tools: Tool[];
  roles: Role[];
  talent_matches: TalentMatch[];
  action_plan: { phase: string; timeline: string; actions: string[] }[];
  warnings: string[];
};

// ── Constants ──────────────────────────────────────────────────────────────
const STAGES = [
  { value: "idea", label: "Idea stage", sub: "Still validating the concept", icon: "💡" },
  { value: "mvp", label: "Building MVP", sub: "Have a product in development", icon: "🔨" },
  { value: "early-revenue", label: "Early revenue", sub: "First paying customers", icon: "💰" },
  { value: "scaling", label: "Scaling", sub: "Growing fast, need more team", icon: "🚀" },
];

const INDUSTRIES = [
  "Fintech", "Edtech", "Healthtech", "Agritech", "E-commerce",
  "SaaS", "Logistics", "Media & Content", "NGO / Social Impact",
  "Real Estate", "Food & Beverage", "Fashion", "Gaming", "Other"
];

const BUDGET_OPTIONS = [
  { value: 500, label: "$500/mo", sub: "Bootstrap" },
  { value: 1000, label: "$1,000/mo", sub: "Early stage" },
  { value: 2500, label: "$2,500/mo", sub: "Seed funded" },
  { value: 5000, label: "$5,000/mo", sub: "Series A ready" },
  { value: 10000, label: "$10,000+/mo", sub: "Growth mode" },
];

const PRIORITY_STYLES = {
  essential: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  recommended: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  optional: "bg-secondary text-muted-foreground border-border",
};

// ── Step components ────────────────────────────────────────────────────────

const StepDot = ({ n, current, done }: { n: number; current: number; done: boolean }) => (
  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all ${
    done ? "bg-primary text-primary-foreground" :
    n === current ? "bg-primary/20 text-primary ring-2 ring-primary" :
    "bg-secondary text-muted-foreground"
  }`}>
    {done ? <CheckCircle2 className="h-4 w-4" /> : n}
  </div>
);

// ── Score ring ─────────────────────────────────────────────────────────────
const ScoreRing = ({ score }: { score: number }) => {
  const r = 22; const circ = 2 * Math.PI * r;
  const color = score >= 70 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#6366f1";
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-border" />
        <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ}
          strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{score}</span>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────
// Print styles injected into head when component mounts
const PRINT_STYLES = `
  @media print {
    header, nav, footer, .print\\:hidden { display: none !important; }
    body { background: white !important; color: black !important; }
    .rounded-2xl, .rounded-xl { border-radius: 8px !important; }
    a { color: inherit !important; text-decoration: none !important; }
    .shadow-card, .shadow-elegant { box-shadow: none !important; }
    .bg-gradient-primary, .bg-gradient-hero, .bg-gradient-card { background: #f8fafc !important; }
    .text-primary-foreground { color: #1e293b !important; }
    .bg-card { background: white !important; border: 1px solid #e2e8f0 !important; }
    @page { margin: 1.5cm; size: A4; }
  }
`;

export default function FounderAssistant() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  // Inject print styles
  useState(() => {
    const style = document.createElement("style");
    style.textContent = PRINT_STYLES;
    style.id = "founder-print-styles";
    if (!document.getElementById("founder-print-styles")) {
      document.head.appendChild(style);
    }
    return () => { document.getElementById("founder-print-styles")?.remove(); };
  });

  const [form, setForm] = useState<FounderInput>({
    company_name: "", industry: "", stage: "idea",
    description: "", goal: "", budget_usd: 1000,
    team_size: 1, location: "",
  });

  const update = (k: keyof FounderInput, v: any) => setForm(f => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 1) return form.company_name && form.industry && form.stage;
    if (step === 2) return form.description.length >= 20 && form.goal;
    if (step === 3) return form.budget_usd > 0;
    return true;
  };

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/founder/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Analysis failed");
      }
      const data: Analysis = await res.json();
      setAnalysis(data);
      setStep(5);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const TOTAL_STEPS = 4;

  return (
    <Layout>
      <section className="container max-w-3xl py-10 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/employer/dashboard" className="print:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border hover:bg-secondary transition">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                <Brain className="h-3 w-3" /> Founder AI Assistant
              </div>
              <h1 className="font-display text-2xl font-extrabold mt-1">
                {step < 5 ? "Set up your startup" : `${form.company_name} — Your Setup Plan`}
              </h1>
            </div>
          </div>
          {step === 5 && analysis && (
            <button onClick={handlePrint}
              className="print:hidden inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary transition">
              <Printer className="h-4 w-4" /> Print / Save PDF
            </button>
          )}
        </div>

        {/* Progress */}
        {step < 5 && (
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="flex items-center gap-2">
                <StepDot n={n} current={step} done={n < step} />
                {n < 4 && <div className={`h-0.5 flex-1 rounded-full transition-all ${n < step ? "bg-primary" : "bg-border"}`} style={{ width: 48 }} />}
              </div>
            ))}
            <span className="ml-2 text-xs text-muted-foreground">{step}/{TOTAL_STEPS}</span>
          </div>
        )}

        {/* ── STEP 1: Company basics ─────────────────────────────────── */}
        {step === 1 && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
            <div>
              <h2 className="font-bold text-lg">Tell us about your company</h2>
              <p className="text-sm text-muted-foreground">Basic info to tailor recommendations.</p>
            </div>

            <Field label="Company name">
              <input value={form.company_name} onChange={e => update("company_name", e.target.value)}
                placeholder="e.g. PayStack, Flutterwave, Andela" className={inputCls} />
            </Field>

            <Field label="Industry">
              <div className="grid grid-cols-3 gap-2 mt-1">
                {INDUSTRIES.map(ind => (
                  <button key={ind} type="button" onClick={() => update("industry", ind)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium text-left transition-all ${
                      form.industry === ind ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                    }`}>
                    {ind}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Company stage">
              <div className="grid grid-cols-2 gap-3 mt-1">
                {STAGES.map(s => (
                  <button key={s.value} type="button" onClick={() => update("stage", s.value as Stage)}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      form.stage === s.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}>
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="font-bold text-sm">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.sub}</div>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Location / Market">
              <input value={form.location} onChange={e => update("location", e.target.value)}
                placeholder="e.g. Lagos, Nigeria · West Africa" className={inputCls} />
            </Field>
          </div>
        )}

        {/* ── STEP 2: Description & goal ────────────────────────────── */}
        {step === 2 && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
            <div>
              <h2 className="font-bold text-lg">What are you building?</h2>
              <p className="text-sm text-muted-foreground">The more specific, the better the recommendations.</p>
            </div>

            <Field label="Describe your product or service">
              <textarea value={form.description} onChange={e => update("description", e.target.value)}
                rows={4} placeholder="e.g. We're building a mobile-first savings app for market traders in Lagos. Users can save daily, access micro-loans, and receive financial literacy content."
                className={`${inputCls} h-auto py-3`} />
              <p className="mt-1 text-xs text-muted-foreground">{form.description.length}/20 min chars</p>
            </Field>

            <Field label="Your #1 goal right now">
              <div className="grid grid-cols-2 gap-2 mt-1">
                {[
                  "Launch MVP as fast as possible",
                  "Get first 100 paying customers",
                  "Build the core tech team",
                  "Raise seed funding",
                  "Scale to new markets",
                  "Improve product quality",
                ].map(g => (
                  <button key={g} type="button" onClick={() => update("goal", g)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-medium text-left transition-all ${
                      form.goal === g ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
              <input value={form.goal} onChange={e => update("goal", e.target.value)}
                placeholder="Or type your own goal..." className={`${inputCls} mt-2`} />
            </Field>
          </div>
        )}

        {/* ── STEP 3: Budget ────────────────────────────────────────── */}
        {step === 3 && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
            <div>
              <h2 className="font-bold text-lg">Budget & team</h2>
              <p className="text-sm text-muted-foreground">We'll recommend tools and talent that fit your budget.</p>
            </div>

            <Field label="Monthly budget (USD)">
              <div className="grid grid-cols-3 gap-3 mt-1">
                {BUDGET_OPTIONS.map(b => (
                  <button key={b.value} type="button" onClick={() => update("budget_usd", b.value)}
                    className={`rounded-xl border-2 p-4 text-center transition-all ${
                      form.budget_usd === b.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}>
                    <div className="font-display font-extrabold text-lg">{b.label}</div>
                    <div className="text-xs text-muted-foreground">{b.sub}</div>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Custom:</span>
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="number" value={form.budget_usd} onChange={e => update("budget_usd", Number(e.target.value))}
                    className={`${inputCls} pl-8`} placeholder="Enter amount" />
                </div>
              </div>
            </Field>

            <Field label="Current team size (including you)">
              <div className="flex items-center gap-3 mt-1">
                <button type="button" onClick={() => update("team_size", Math.max(1, form.team_size - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-lg font-bold hover:bg-secondary transition">−</button>
                <span className="w-12 text-center font-display text-2xl font-extrabold">{form.team_size}</span>
                <button type="button" onClick={() => update("team_size", form.team_size + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-lg font-bold hover:bg-secondary transition">+</button>
                <span className="text-sm text-muted-foreground">{form.team_size === 1 ? "solo founder" : `${form.team_size} people`}</span>
              </div>
            </Field>
          </div>
        )}

        {/* ── STEP 4: Confirm ───────────────────────────────────────── */}
        {step === 4 && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
            <div>
              <h2 className="font-bold text-lg">Ready to analyze</h2>
              <p className="text-sm text-muted-foreground">Here's what we'll generate for you.</p>
            </div>

            {/* Summary of inputs */}
            <div className="rounded-xl bg-secondary/50 p-4 space-y-2 text-sm">
              {[
                ["Company", `${form.company_name} · ${form.industry}`],
                ["Stage", STAGES.find(s => s.value === form.stage)?.label],
                ["Goal", form.goal],
                ["Budget", `$${form.budget_usd.toLocaleString()}/month`],
                ["Team", `${form.team_size} ${form.team_size === 1 ? "person" : "people"}`],
                ["Market", form.location || "Global South"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4">
                  <span className="font-semibold text-muted-foreground shrink-0">{k}</span>
                  <span className="text-right">{v}</span>
                </div>
              ))}
            </div>

            {/* What you'll get */}
            <div className="space-y-2">
              {[
                [Wrench, "Best tools stack for your industry + budget"],
                [Users, "Team structure with roles & hiring order"],
                [Target, "Talent matched from SkillMap database"],
                [Rocket, "Phased action plan (weeks 1-2, month 1, month 3)"],
                [DollarSign, "Budget breakdown across tools, talent & marketing"],
              ].map(([Icon, text], i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    {/* @ts-ignore */}
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>{text as string}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RESULTS ───────────────────────────────────────────────── */}
        {step === 5 && analysis && (
          <div className="space-y-6">

            {/* Summary */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-bold">AI Assessment</h3>
              </div>
              <p className="text-sm leading-relaxed">{analysis.summary}</p>
              {analysis.warnings.length > 0 && (
                <div className="space-y-2 pt-2">
                  {analysis.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 dark:text-amber-400">{w}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Budget breakdown */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Budget breakdown — ${form.budget_usd.toLocaleString()}/mo</h3>
              <div className="space-y-3">
                {analysis.budget_breakdown.map(b => (
                  <div key={b.category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{b.category}</span>
                      <span className="font-bold">${b.allocated_usd}/mo <span className="text-muted-foreground font-normal">({b.percentage}%)</span></span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${b.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3 text-sm">
                <span className="text-muted-foreground">Tools cost</span>
                <span className="font-bold text-red-500">${analysis.total_tool_cost}/mo</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm">
                <span className="font-semibold text-green-700 dark:text-green-400">Available for talent</span>
                <span className="font-bold text-green-600 dark:text-green-400">${analysis.remaining_for_talent}/mo</span>
              </div>
            </div>

            {/* Tools */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /> Recommended tools stack</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {analysis.tools.map(t => (
                  <a key={t.name} href={t.url} target="_blank" rel="noopener noreferrer"
                    className="group flex items-start gap-3 rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-secondary/30 transition-all">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm">{t.name}</span>
                        <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${PRIORITY_STYLES[t.priority]}`}>
                          {t.priority}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.purpose}</p>
                      <p className="text-xs font-semibold mt-1">
                        {t.free_tier && t.monthly_cost_usd === 0 ? "🆓 Free" : `$${t.monthly_cost_usd}/mo`}
                        {t.free_tier && t.monthly_cost_usd > 0 && " · has free tier"}
                      </p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 mt-0.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Roles */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> Team structure</h3>
              <div className="space-y-3">
                {analysis.roles.sort((a, b) => a.hire_order - b.hire_order).map(r => (
                  <div key={r.title} className="flex items-start gap-4 rounded-xl border border-border p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display font-extrabold text-primary">
                      {r.hire_order}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold">{r.title}</span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground capitalize">
                          {r.full_time_or_freelance}
                        </span>
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">{r.budget_range_usd}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{r.why_needed}</p>
                      <div className="flex flex-wrap gap-1">
                        {r.skills_needed.map(s => (
                          <span key={s} className="rounded-full bg-primary/8 text-primary px-2 py-0.5 text-[10px] font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Talent matches */}
            {analysis.talent_matches.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Matched talent from SkillMap
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {analysis.talent_matches.map(t => (
                    <Link key={t.user_id} to={`/employer/talent/${t.user_id}`}
                      className="group flex items-start gap-3 rounded-xl border border-border p-4 hover:border-primary/40 hover:shadow-card transition-all">
                      <ScoreRing score={t.credibility_score} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-bold text-sm truncate">{t.name}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100" />
                        </div>
                        <p className="text-xs text-primary font-medium">{t.primary_skill}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-2.5 w-2.5" /> {t.location} · {t.experience_level}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {t.skills.slice(0, 4).map(s => (
                            <span key={s} className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px]">{s}</span>
                          ))}
                        </div>
                        <div className="mt-2 rounded-lg bg-primary/5 px-2 py-1.5">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-0.5">Suggested for</p>
                          <p className="text-xs font-semibold">{t.role_suggestion}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t.fit_reason}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Action plan */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2"><Rocket className="h-4 w-4 text-primary" /> Your action plan</h3>
              <div className="space-y-4">
                {analysis.action_plan.map((phase, i) => (
                  <div key={phase.phase} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                        {i + 1}
                      </div>
                      {i < analysis.action_plan.length - 1 && (
                        <div className="w-0.5 flex-1 bg-border mt-2" />
                      )}
                    </div>
                    <div className="pb-6 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-sm">{phase.phase}</span>
                        <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" /> {phase.timeline}
                        </span>
                      </div>
                      <ul className="space-y-1.5">
                        {phase.actions.map((a, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 print:hidden">
              <button onClick={() => { setStep(1); setAnalysis(null); }}
                className="rounded-xl border border-border px-5 py-3 font-semibold hover:bg-secondary transition">
                Start over
              </button>
              <button onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 font-semibold hover:bg-secondary transition">
                <Printer className="h-4 w-4" /> Print / PDF
              </button>
              <Link to="/employer/talent"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 font-bold text-primary-foreground shadow-elegant hover:shadow-glow transition-all">
                <Users className="h-4 w-4" /> Browse talent
              </Link>
            </div>
          </div>
        )}

        {/* ── Navigation buttons ─────────────────────────────────────── */}
        {step < 5 && (
          <div className="flex items-center justify-between">
            <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-secondary transition disabled:opacity-40">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 font-bold text-primary-foreground shadow-elegant disabled:opacity-50 hover:shadow-glow transition-all">
                Next <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={submit} disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-2.5 font-bold text-primary-foreground shadow-elegant disabled:opacity-60 hover:shadow-glow transition-all">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4" /> Generate my plan</>}
              </button>
            )}
          </div>
        )}

      </section>
    </Layout>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
const inputCls = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
    {children}
  </div>
);