import { Link } from "react-router-dom";
import { ArrowRight, Brain, Globe2, HandshakeIcon, Sparkles, Target, TrendingUp, Users } from "lucide-react";
import { Layout } from "@/components/Layout";
import heroImg from "@/assets/hero-globe.jpg";
import { ORGANIZATIONS } from "@/data/mockData";
import { OrgCard } from "@/components/OrgCard";

const stats = [
  { value: "2,400+", label: "NGOs in network" },
  { value: "$840M", label: "Funding tracked" },
  { value: "78", label: "Countries covered" },
  { value: "17/17", label: "UN SDGs" },
];

const features = [
  {
    icon: Brain,
    title: "AI Matchmaking",
    desc: "Describe your challenge. Get ranked partner recommendations with clear 'why this match?' reasoning.",
  },
  {
    icon: Globe2,
    title: "Global NGO Discovery",
    desc: "Search 2,400+ verified NGOs by country, SDG, sector, and partnership type.",
  },
  {
    icon: TrendingUp,
    title: "Funding Intelligence",
    desc: "Real-time view of grants, CSR funds, and impact investments aligned to your mission.",
  },
  {
    icon: HandshakeIcon,
    title: "Cross-border Partnerships",
    desc: "Stop duplicating effort. Adopt proven models from peer NGOs across continents.",
  },
];

const Index = () => {
  const featured = ORGANIZATIONS.slice(0, 3);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div
          className="absolute inset-0 opacity-50"
          style={{ backgroundImage: `url(${heroImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/60 to-navy/90" />
        <div className="container relative py-24 md:py-36">
          <div className="mx-auto max-w-4xl text-center text-navy-foreground animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-glow/30 bg-primary-glow/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-glow backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered impact collaboration
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] md:text-6xl lg:text-7xl">
              Connect the world's <span className="text-gradient-accent">NGOs, funders</span>, and impact partners.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-navy-foreground/80 md:text-xl">
              An NGO in Nigeria needs technology. An Indian NGO has built it. A European fund wants to back it.
              OpportunityAI finds these matches in seconds.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/match"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-accent px-7 py-4 text-base font-bold text-accent-foreground shadow-elegant transition-smooth hover:shadow-glow"
              >
                Find Partners
                <ArrowRight className="h-5 w-5 transition-smooth group-hover:translate-x-1" />
              </Link>
              <Link
                to="/discover"
                className="inline-flex items-center gap-2 rounded-xl border border-navy-foreground/20 bg-navy-foreground/5 px-7 py-4 text-base font-semibold text-navy-foreground backdrop-blur-sm transition-smooth hover:bg-navy-foreground/10"
              >
                Explore NGOs
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map(s => (
                <div key={s.label} className="text-center">
                  <div className="font-display text-3xl font-extrabold text-primary-glow md:text-4xl">{s.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-navy-foreground/60">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="container py-20">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <div className="mb-3 text-sm font-bold uppercase tracking-widest text-accent">The Problem</div>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">NGOs work in isolation. Impact suffers.</h2>
            <p className="text-lg text-muted-foreground">
              Across 78 countries, thousands of NGOs duplicate effort, miss out on funding, and rebuild solutions
              their peers have already proven. There has never been a single intelligence layer for global social impact —
              <span className="font-semibold text-foreground"> until now.</span>
            </p>
          </div>
          <div className="relative rounded-3xl border border-border bg-card p-8 shadow-card">
            <div className="absolute -top-3 left-8 rounded-full bg-gradient-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
              The Solution
            </div>
            <div className="space-y-4">
              {[
                { icon: Target, text: "Discover the right partner across continents in seconds" },
                { icon: Brain, text: "AI explains every recommendation in plain English" },
                { icon: Users, text: "Funders find vetted NGOs aligned with their thesis" },
                { icon: TrendingUp, text: "Track $840M in active funding opportunities" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="pt-1.5 text-sm font-medium">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary/40 py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <div className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">What you get</div>
            <h2 className="text-3xl font-bold md:text-4xl">A collaboration intelligence system</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map(f => (
              <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-card transition-smooth group-hover:shadow-glow">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-display text-lg font-bold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured orgs */}
      <section className="container py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">Featured</div>
            <h2 className="text-3xl font-bold md:text-4xl">Verified impact partners</h2>
          </div>
          <Link to="/discover" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline md:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map(o => <OrgCard key={o.id} org={o} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 text-center shadow-elegant md:p-16">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary-glow/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative">
            <h2 className="mb-4 font-display text-3xl font-bold text-navy-foreground md:text-5xl">
              Ready to find your next partner?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-navy-foreground/80">
              Tell us your challenge. Our AI will surface the world's best-matched NGOs, funders, and corporates.
            </p>
            <Link
              to="/match"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-accent px-8 py-4 font-bold text-accent-foreground shadow-elegant transition-smooth hover:shadow-glow"
            >
              Launch AI Matchmaker
              <Sparkles className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
