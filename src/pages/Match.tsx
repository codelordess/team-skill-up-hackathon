import { useState } from "react";
import { Layout } from "@/components/Layout";
import { COUNTRIES, NeedType, SDGS } from "@/data/mockData";
import { findMatches, type Match as MatchResult } from "@/lib/matchmaker";
import { SdgBadge } from "@/components/SdgBadge";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, CheckCircle2, Loader2, MapPin, Sparkles } from "lucide-react";

const ORG_TYPES = ["NGO", "Funder", "Corporate CSR", "Impact Investor", "Social Enterprise"];
const NEEDS: NeedType[] = ["Funding", "Technology", "Local Partner", "Implementation Partner", "Research", "Volunteers"];

const Match = () => {
  const [orgType, setOrgType] = useState("NGO");
  const [country, setCountry] = useState("Nigeria");
  const [sdgs, setSdgs] = useState<number[]>([4]);
  const [needs, setNeeds] = useState<NeedType[]>(["Technology", "Funding"]);
  const [challenge, setChallenge] = useState("We run rural community schools in northern Nigeria and need an offline-first digital learning platform plus multi-year funding to scale from 42 to 200 hubs.");
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = <T,>(arr: T[], v: T) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    setTimeout(() => {
      setResults(findMatches({ orgType, country, sdgs, challenge, needs }));
      setLoading(false);
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 100);
    }, 1100);
  };

  return (
    <Layout>
      <section className="border-b border-border/60 bg-gradient-hero">
        <div className="container py-16 text-navy-foreground">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-glow/30 bg-primary-glow/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-glow">
            <Sparkles className="h-3 w-3" /> AI Matchmaker
          </div>
          <h1 className="max-w-3xl text-4xl font-bold md:text-5xl">Describe your challenge. We'll find your partners.</h1>
          <p className="mt-4 max-w-2xl text-navy-foreground/80">
            Our matching engine scores 2,400+ NGOs, funders, and corporates against your needs and explains every recommendation.
          </p>
        </div>
      </section>

      <section className="container -mt-10 pb-12">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-6 shadow-elegant md:p-10">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Your organisation type">
              <select value={orgType} onChange={e => setOrgType(e.target.value)} className={inputCls}>
                {ORG_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Country">
              <select value={country} onChange={e => setCountry(e.target.value)} className={inputCls}>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <Field label="UN Sustainable Development Goals (select up to 3)" className="mt-6">
            <div className="flex flex-wrap gap-2">
              {SDGS.map(s => {
                const on = sdgs.includes(s.id);
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setSdgs(on ? sdgs.filter(x => x !== s.id) : sdgs.length >= 3 ? sdgs : [...sdgs, s.id])}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-smooth ${on ? "text-white shadow-card" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"}`}
                    style={on ? { backgroundColor: s.color } : undefined}
                  >
                    SDG {s.id} · {s.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="What do you need?" className="mt-6">
            <div className="flex flex-wrap gap-2">
              {NEEDS.map(n => {
                const on = needs.includes(n);
                return (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setNeeds(toggle(needs, n))}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-smooth ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/40"}`}
                  >
                    {on && <CheckCircle2 className="-ml-1 mr-1.5 inline h-3.5 w-3.5" />}
                    {n}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Describe the challenge you're solving" className="mt-6">
            <textarea
              value={challenge}
              onChange={e => setChallenge(e.target.value)}
              rows={4}
              className={`${inputCls} h-auto py-3 leading-relaxed`}
              placeholder="e.g. We're scaling girls' education in rural communities and need..."
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-8 py-4 font-bold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow disabled:opacity-60 md:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Analysing global network...
              </>
            ) : (
              <>
                <Brain className="h-5 w-5" /> Find my partners
              </>
            )}
          </button>
        </form>
      </section>

      {/* Results */}
      <section id="results" className="container pb-20">
        {loading && (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-card/60 p-10 text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
            <p className="font-semibold">Scanning 2,400+ organisations across 78 countries...</p>
            <p className="text-sm text-muted-foreground">Scoring SDG overlap, capability fit, and proven models.</p>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="animate-fade-up">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">AI Recommendations</div>
                <h2 className="text-3xl font-bold">Top {results.length} partner matches</h2>
              </div>
            </div>
            <div className="space-y-4">
              {results.map((m, i) => <MatchCard key={m.org.id} match={m} rank={i + 1} />)}
            </div>
          </div>
        )}

        {results && results.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
            <p className="font-semibold">No strong matches yet.</p>
            <p className="text-sm text-muted-foreground">Try selecting more SDGs or adding more needs.</p>
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

const MatchCard = ({ match, rank }: { match: MatchResult; rank: number }) => {
  const { org, score, reasons } = match;
  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-gradient-card shadow-card transition-smooth hover:shadow-elegant">
      <div className="grid md:grid-cols-[auto,1fr,auto] gap-6 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-3xl shadow-card">
            {org.flag}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">#{rank} Match</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">{org.type}</span>
            </div>
            <h3 className="mt-2 font-display text-xl font-bold">{org.name}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {org.country} · {org.sector}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {org.sdgs.slice(0, 3).map(id => <SdgBadge key={id} id={id} size="xs" />)}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-primary/5 p-4 ring-1 ring-primary/10">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Brain className="h-3.5 w-3.5" /> Why this match?
          </div>
          <ul className="space-y-1.5 text-sm">
            {reasons.slice(0, 3).map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 md:items-end">
          <div className="text-center md:text-right">
            <div className="font-display text-3xl font-extrabold text-gradient">{Math.min(99, Math.round(score))}%</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Match score</div>
          </div>
          <Link
            to={`/org/${org.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90"
          >
            View profile <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Match;
