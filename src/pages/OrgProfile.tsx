import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ORGANIZATIONS } from "@/data/mockData";
import { SdgBadge } from "@/components/SdgBadge";
import { ArrowLeft, Calendar, CheckCircle2, DollarSign, Globe, Mail, MapPin, ShieldCheck, Target, TrendingUp, Users } from "lucide-react";

const OrgProfile = () => {
  const { id } = useParams();
  const org = ORGANIZATIONS.find(o => o.id === id);

  if (!org) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <h1 className="text-2xl font-bold">Organisation not found</h1>
          <Link to="/discover" className="mt-4 inline-flex text-primary hover:underline">← Back to discovery</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-gradient-hero text-navy-foreground">
        <div className="container py-12">
          <Link to="/discover" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-navy-foreground/70 hover:text-navy-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to discovery
          </Link>
          <div className="grid gap-8 md:grid-cols-[auto,1fr,auto] md:items-start">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-primary text-5xl shadow-glow">
              {org.flag}
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary-glow/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-glow">{org.type}</span>
                {org.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success">
                    <ShieldCheck className="h-3 w-3" /> Verified Partner
                  </span>
                )}
              </div>
              <h1 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">{org.name}</h1>
              <p className="mt-2 text-lg text-navy-foreground/80">{org.mission}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-navy-foreground/70">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{org.country}</span>
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />Est. {org.established}</span>
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" />{org.reach}</span>
                <span className="inline-flex items-center gap-1.5"><Globe className="h-4 w-4" />{org.sector}</span>
              </div>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-accent px-5 py-3 font-bold text-accent-foreground shadow-elegant transition-smooth hover:shadow-glow">
              <Mail className="h-4 w-4" /> Contact partner
            </button>
          </div>
        </div>
      </section>

      <section className="container grid gap-8 py-12 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card title="About" icon={Globe}>
            <p className="text-muted-foreground">{org.description}</p>
          </Card>

          <Card title="Active projects" icon={TrendingUp}>
            <div className="space-y-3">
              {org.projects.map((p, i) => (
                <div key={i} className="flex items-start justify-between rounded-xl bg-secondary/50 p-4">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm text-muted-foreground">{p.impact}</div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Strengths" icon={CheckCircle2}>
            <div className="flex flex-wrap gap-2">
              {org.strengths.map(s => (
                <span key={s} className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">{s}</span>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="UN SDG focus" icon={Target}>
            <div className="flex flex-wrap gap-2">
              {org.sdgs.map(id => <SdgBadge key={id} id={id} />)}
            </div>
          </Card>

          {org.needs.length > 0 && (
            <Card title="Partnership needs" icon={Target} accent>
              <div className="space-y-2">
                {org.needs.map(n => (
                  <div key={n} className="flex items-center gap-2 text-sm font-medium">
                    <div className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent" />
                    {n}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {org.fundingNeed && (
            <Card title="Funding need" icon={DollarSign}>
              <div className="text-2xl font-bold text-gradient">{org.fundingNeed}</div>
            </Card>
          )}
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

export default OrgProfile;
