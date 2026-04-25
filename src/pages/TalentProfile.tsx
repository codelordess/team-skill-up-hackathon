import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { OPPORTUNITIES, TALENTS } from "@/data/mockData";
import { getSkillColor, getSkillIcon, matchOpportunities } from "@/lib/matchmaker";
import { ArrowLeft, ArrowRight, Brain, Calendar, CheckCircle2, ExternalLink, Mail, MapPin, ShieldCheck, Sparkles, Target, TrendingUp } from "lucide-react";

const TalentProfilePage = () => {
  const { id } = useParams();
  const talent = TALENTS.find(t => t.id === id);

  if (!talent) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <h1 className="font-display text-2xl font-bold">Talent not found</h1>
          <Link to="/employers" className="mt-4 inline-flex text-primary hover:underline">← Back to talent pool</Link>
        </div>
      </Layout>
    );
  }

  const color = getSkillColor(talent.primarySkill);
  const matches = matchOpportunities(talent).slice(0, 3);

  return (
    <Layout>
      <section className="bg-gradient-hero text-navy-foreground">
        <div className="container py-12">
          <Link to="/employers" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-navy-foreground/70 hover:text-navy-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to talent pool
          </Link>
          <div className="grid gap-8 md:grid-cols-[auto,1fr,auto] md:items-start">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-2xl text-4xl font-bold text-white shadow-glow"
              style={{ background: `linear-gradient(135deg, ${talent.avatarColor}, ${color})` }}
            >
              {talent.initials}
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: `${color}33`, color: "white" }}
                >
                  <span>{getSkillIcon(talent.primarySkill)}</span> {talent.primarySkill}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success">
                  <ShieldCheck className="h-3 w-3" /> Credibility {talent.credibilityScore}
                </span>
                {talent.available && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
                    <Sparkles className="h-3 w-3" /> Available
                  </span>
                )}
              </div>
              <h1 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">{talent.name}</h1>
              <p className="mt-2 text-lg text-navy-foreground/80">{talent.careerGoals}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-navy-foreground/70">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{talent.city}, {talent.country}</span>
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />{talent.age} years old</span>
                <span className="inline-flex items-center gap-1.5"><TrendingUp className="h-4 w-4" />{talent.yearsActive}y active</span>
                <span className="inline-flex items-center gap-1.5"><Target className="h-4 w-4" />{talent.experienceLevel}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-accent px-5 py-3 font-bold text-accent-foreground shadow-elegant transition-smooth hover:shadow-glow">
                <Mail className="h-4 w-4" /> Contact talent
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl border border-navy-foreground/20 bg-navy-foreground/5 px-5 py-3 font-semibold text-navy-foreground transition-smooth hover:bg-navy-foreground/10">
                Save to shortlist
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="container grid gap-8 py-12 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card title="In their own words" icon={Sparkles}>
            <blockquote className="border-l-4 pl-4 italic text-muted-foreground" style={{ borderColor: color }}>
              "{talent.rawDescription}"
            </blockquote>
          </Card>

          <Card title="Skills detected by AI" icon={Brain}>
            <div className="flex flex-wrap gap-2">
              {talent.detectedSkills.map(s => (
                <span key={s} className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">{s}</span>
              ))}
            </div>
          </Card>

          <Card title="Suggested roles" icon={Target}>
            <div className="space-y-2">
              {talent.suggestedRoles.map(r => (
                <div key={r} className="flex items-center gap-2 rounded-xl bg-secondary/50 p-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  <span className="font-medium">{r}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="AI-matched opportunities" icon={Sparkles} accent>
            <div className="space-y-3">
              {matches.map((m, i) => (
                <div key={m.opportunity.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">#{i + 1}</span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">{m.opportunity.type}</span>
                      </div>
                      <div className="font-semibold">{m.opportunity.title}</div>
                      <div className="text-xs text-muted-foreground">{m.opportunity.provider} · {m.opportunity.compensation}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-xl font-extrabold text-gradient">{m.score}%</div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Match</div>
                    </div>
                  </div>
                </div>
              ))}
              <Link to="/opportunities" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                See all opportunities <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Credibility" icon={ShieldCheck}>
            <div className="text-center">
              <div className="font-display text-5xl font-extrabold text-gradient">{talent.credibilityScore}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">/ 100</div>
              <p className="mt-3 text-xs text-muted-foreground">
                Computed from verified proof links, years active, and skill consistency.
              </p>
            </div>
          </Card>

          {talent.proofLinks.length > 0 && (
            <Card title="Proof of work" icon={ExternalLink}>
              <div className="space-y-2">
                {talent.proofLinks.map(p => (
                  <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer"
                     className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm transition-smooth hover:border-primary/40 hover:bg-primary/5">
                    <span className="font-medium">{p.label}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </Card>
          )}

          <Card title="Career goal" icon={Target}>
            <p className="text-sm text-muted-foreground">{talent.careerGoals}</p>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

const Card = ({ title, icon: Icon, children, accent }: { title: string; icon: any; children: React.ReactNode; accent?: boolean }) => (
  <div className={`rounded-2xl border bg-card p-6 shadow-card ${accent ? "border-accent/40 ring-1 ring-accent/20" : "border-border"}`}>
    <div className="mb-4 flex items-center gap-2">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="font-display font-bold">{title}</h2>
    </div>
    {children}
  </div>
);

export default TalentProfilePage;
