import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { COUNTRIES, SKILL_CATEGORIES, OPPORTUNITIES } from "@/data/mockData";
import { extractSkills, getSkillColor, getSkillIcon, matchOpportunities, type ExtractionResult } from "@/lib/matchmaker";
import { ArrowRight, Brain, CheckCircle2, ExternalLink, Loader2, MapPin, ShieldCheck, Sparkles, Target } from "lucide-react";

const SAMPLES = [
  "I learned React from YouTube and built websites for 3 small businesses in my neighborhood.",
  "I edit wedding videos and YouTube content for creators. I use Premiere Pro and DaVinci Resolve. I have edited over 60 projects in the last year.",
  "I repair smartphones — screen replacement, battery, motherboard soldering. I've fixed about 1,200 phones in 3 years.",
  "I run an Instagram page with 18k followers for a local fashion brand. I shoot photos, edit reels in CapCut, write captions and run WhatsApp orders.",
];

const ProfileBuilder = () => {
  const [name, setName] = useState("");
  const [city, setCity] = useState("Accra");
  const [country, setCountry] = useState<typeof COUNTRIES[number]>("Ghana");
  const [age, setAge] = useState(22);
  const [description, setDescription] = useState(SAMPLES[0]);
  const [proofLink, setProofLink] = useState("");
  const [careerGoals, setCareerGoals] = useState("Land a remote junior role with an international startup.");
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);

  const handleExtract = (e: React.FormEvent) => {
    e.preventDefault();
    setExtracting(true);
    setResult(null);
    setTimeout(() => {
      setResult(extractSkills({ description, proofLink, age }));
      setExtracting(false);
      setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth" }), 100);
    }, 1100);
  };

  // Build a synthetic talent profile to drive matchOpportunities
  const matches = result
    ? matchOpportunities({
        id: "preview",
        name: name || "You",
        age,
        city,
        country: country as any,
        flag: "🌍",
        avatarColor: "#6366F1",
        initials: (name || "YO").slice(0, 2).toUpperCase(),
        rawDescription: description,
        primarySkill: result.primarySkill,
        detectedSkills: result.detectedSkills,
        experienceLevel: result.experienceLevel,
        suggestedRoles: result.suggestedRoles,
        credibilityScore: result.credibilityScore,
        proofLinks: proofLink ? [{ label: "Proof", url: proofLink }] : [],
        careerGoals,
        yearsActive: 1,
        available: true,
      }).slice(0, 4)
    : [];

  const color = result ? getSkillColor(result.primarySkill) : "#6366F1";

  return (
    <Layout>
      <section className="border-b border-border/60 bg-gradient-hero">
        <div className="container py-16 text-navy-foreground">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-glow/30 bg-primary-glow/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-glow">
            <Sparkles className="h-3 w-3" /> AI Skill Extraction
          </div>
          <h1 className="max-w-3xl font-display text-4xl font-bold md:text-5xl">Tell us what you do. We'll build your profile.</h1>
          <p className="mt-4 max-w-2xl text-navy-foreground/80">
            No CV, no degree, no jargon. Describe your work in your own words and our AI turns it into a structured,
            employer-ready talent profile in seconds.
          </p>
        </div>
      </section>

      <section className="container -mt-10 pb-12">
        <form onSubmit={handleExtract} className="rounded-3xl border border-border bg-card p-6 shadow-elegant md:p-10">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Your name">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kwame Mensah" className={inputCls} />
            </Field>
            <Field label="Age">
              <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} min={14} max={65} className={inputCls} />
            </Field>
            <Field label="City">
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Accra" className={inputCls} />
            </Field>
            <Field label="Country">
              <select value={country} onChange={e => setCountry(e.target.value as any)} className={inputCls}>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Describe your skills, experience, and projects" className="mt-6">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
              className={`${inputCls} h-auto py-3 leading-relaxed`}
              placeholder="e.g. I learned React from YouTube and built websites for 3 small businesses..."
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-muted-foreground self-center mr-1">Try:</span>
              {SAMPLES.map((s, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setDescription(s)}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-smooth hover:bg-primary/10 hover:text-primary"
                >
                  Sample {i + 1}
                </button>
              ))}
            </div>
          </Field>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Field label="Proof of work (optional link)">
              <input value={proofLink} onChange={e => setProofLink(e.target.value)} placeholder="GitHub, Instagram, portfolio..." className={inputCls} />
            </Field>
            <Field label="Career goal">
              <input value={careerGoals} onChange={e => setCareerGoals(e.target.value)} className={inputCls} />
            </Field>
          </div>

          <button
            type="submit"
            disabled={extracting || description.length < 20}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-8 py-4 font-bold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow disabled:opacity-60 md:w-auto"
          >
            {extracting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Extracting your skills...
              </>
            ) : (
              <>
                <Brain className="h-5 w-5" /> Extract my skills with AI
              </>
            )}
          </button>
        </form>
      </section>

      <section id="result" className="container pb-20">
        {extracting && (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-card/60 p-10 text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
            <p className="font-semibold">Reading your description, detecting skills, scoring credibility...</p>
            <p className="text-sm text-muted-foreground">Mapping you against {OPPORTUNITIES.length} live opportunities.</p>
          </div>
        )}

        {result && (
          <div className="animate-fade-up space-y-8">
            {/* Extracted profile */}
            <div className="overflow-hidden rounded-3xl border border-border bg-gradient-card shadow-elegant">
              <div className="grid gap-6 p-8 md:grid-cols-[auto,1fr] md:items-start">
                <div
                  className="flex h-24 w-24 items-center justify-center rounded-2xl text-3xl font-bold text-white shadow-glow"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
                >
                  {(name || "YO").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-success">
                    <ShieldCheck className="h-3 w-3" /> Profile generated
                  </div>
                  <h2 className="font-display text-3xl font-bold">{name || "Your name"}</h2>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{city}, {country}</span>
                    <span>{age} years old</span>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-card p-4 ring-1 ring-border">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Primary skill</div>
                      <div className="mt-1 inline-flex items-center gap-2 text-lg font-bold" style={{ color }}>
                        <span className="text-2xl">{getSkillIcon(result.primarySkill)}</span>
                        {result.primarySkill}
                      </div>
                    </div>
                    <div className="rounded-xl bg-card p-4 ring-1 ring-border">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Experience level</div>
                      <div className="mt-1 text-lg font-bold">{result.experienceLevel}</div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-card p-4 ring-1 ring-border">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Detected skills</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {result.detectedSkills.map(s => (
                        <span key={s} className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-card p-4 ring-1 ring-border">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Suggested roles</div>
                      <ul className="mt-2 space-y-1 text-sm">
                        {result.suggestedRoles.map(r => (
                          <li key={r} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl p-4 ring-1" style={{ background: `${color}10`, borderColor: `${color}33` }}>
                      <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color }}>Credibility score</div>
                      <div className="mt-1 font-display text-4xl font-extrabold" style={{ color }}>{result.credibilityScore}<span className="text-xl text-muted-foreground">/100</span></div>
                      <div className="mt-1 text-xs text-muted-foreground">{result.reasoning}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Matched opportunities */}
            <div>
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <div className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">AI-matched for you</div>
                  <h2 className="text-3xl font-bold">Top {matches.length} opportunities</h2>
                </div>
                <Link to="/opportunities" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline md:inline-flex">
                  See all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {matches.map((m, i) => (
                  <div key={m.opportunity.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-smooth hover:shadow-elegant">
                    <div className="grid gap-6 p-6 md:grid-cols-[1fr,auto] md:items-start">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">#{i + 1} Match</span>
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">{m.opportunity.type}</span>
                          {m.opportunity.remote && <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">Remote</span>}
                        </div>
                        <h3 className="font-display text-xl font-bold">{m.opportunity.title}</h3>
                        <div className="mt-1 text-sm text-muted-foreground">
                          <span className="font-medium text-primary">{m.opportunity.provider}</span>
                          <span> · {m.opportunity.location}</span>
                          <span> · {m.opportunity.compensation}</span>
                        </div>
                        <div className="mt-4 rounded-xl bg-primary/5 p-3 ring-1 ring-primary/10">
                          <div className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                            <Brain className="h-3 w-3" /> Why this match?
                          </div>
                          <ul className="space-y-1 text-sm">
                            {m.reasons.map((r, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <div className="font-display text-3xl font-extrabold text-gradient">{m.score}%</div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Match</div>
                        </div>
                        <button className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90">
                          Apply <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

const inputCls = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-primary/20";

const Field = ({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={className}>
    <label className="mb-2 block text-sm font-semibold text-foreground">{label}</label>
    {children}
  </div>
);

export default ProfileBuilder;
