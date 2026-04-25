import { Link } from "react-router-dom";
import { ArrowRight, Brain, Eye, MapPin, Sparkles, Target, TrendingUp, Users } from "lucide-react";
import { Layout } from "@/components/Layout";
import heroImg from "@/assets/hero-skillmap.jpg";
import { TALENTS } from "@/data/mockData";
import { TalentCard } from "@/components/TalentCard";

const stats = [
  { value: "12,400+", label: "Talents mapped" },
  { value: "850+", label: "Live opportunities" },
  { value: "3", label: "Launch countries" },
  { value: "92%", label: "AI extraction accuracy" },
];

const features = [
  {
    icon: Brain,
    title: "AI Skill Extraction",
    desc: "Describe what you do in your own words. We turn it into a structured, employer-ready talent profile.",
  },
  {
    icon: Target,
    title: "Opportunity Matching",
    desc: "Get matched to jobs, gigs, training, and mentorship that actually fit your real skills and level.",
  },
  {
    icon: Eye,
    title: "Become Discoverable",
    desc: "Employers across the world can finally find you — no degree, no network required.",
  },
  {
    icon: MapPin,
    title: "Talent Map",
    desc: "See where skills cluster — Lagos developers, Accra editors, Kano tailors. Aggregated, anonymous, public.",
  },
];

const Index = () => {
  const featured = TALENTS.slice(0, 3);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div
          className="absolute inset-0 opacity-50"
          style={{ backgroundImage: `url(${heroImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/60 to-navy/95" />
        <div className="container relative py-24 md:py-36">
          <div className="mx-auto max-w-4xl text-center text-navy-foreground animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-glow/30 bg-primary-glow/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-glow backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              AI talent infrastructure for the Global South
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] md:text-6xl lg:text-7xl">
              Making <span className="text-gradient-accent">invisible talent</span> visible.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-navy-foreground/80 md:text-xl">
              A 22-year-old self-taught developer in Accra. A tailor in Kano running a TikTok shop. A video editor in Kampala.
              SkillMap turns informal experience into structured profiles — and connects them to real opportunities.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/profile"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-accent px-7 py-4 text-base font-bold text-accent-foreground shadow-elegant transition-smooth hover:shadow-glow"
              >
                Create my profile
                <ArrowRight className="h-5 w-5 transition-smooth group-hover:translate-x-1" />
              </Link>
              <Link
                to="/employers"
                className="inline-flex items-center gap-2 rounded-xl border border-navy-foreground/20 bg-navy-foreground/5 px-7 py-4 text-base font-semibold text-navy-foreground backdrop-blur-sm transition-smooth hover:bg-navy-foreground/10"
              >
                I'm hiring
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
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Millions of skilled young people. Zero discoverability.</h2>
            <p className="text-lg text-muted-foreground">
              Across Nigeria, Ghana, Uganda and the wider Global South, young people are learning skills on YouTube,
              building real projects, and earning informally. But without degrees, portfolios, or networks,
              <span className="font-semibold text-foreground"> they remain invisible to the global economy.</span>
            </p>
          </div>
          <div className="relative rounded-3xl border border-border bg-card p-8 shadow-card">
            <div className="absolute -top-3 left-8 rounded-full bg-gradient-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
              The Solution
            </div>
            <div className="space-y-4">
              {[
                { icon: Brain, text: "AI converts informal descriptions into structured skill profiles" },
                { icon: Target, text: "Matches each talent to jobs, gigs, training, and mentorship" },
                { icon: Eye, text: "Employer dashboard makes informal talent searchable" },
                { icon: TrendingUp, text: "Talent map exposes where skills already exist" },
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

      {/* How it works */}
      <section className="bg-secondary/40 py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <div className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">How it works</div>
            <h2 className="text-3xl font-bold md:text-4xl">From informal experience to global opportunity</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div key={f.title} className="group relative rounded-2xl border border-border bg-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant">
                <div className="absolute right-5 top-5 font-display text-5xl font-black text-primary/5">0{i + 1}</div>
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

      {/* Featured talent */}
      <section className="container py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">Featured talent</div>
            <h2 className="text-3xl font-bold md:text-4xl">Real people. Real skills.</h2>
          </div>
          <Link to="/employers" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline md:inline-flex">
            Browse all talent <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map(t => <TalentCard key={t.id} talent={t} />)}
        </div>
      </section>

      {/* Demo flow callout */}
      <section className="container pb-12">
        <div className="rounded-3xl border border-border bg-gradient-card p-8 shadow-card md:p-12">
          <div className="grid gap-8 md:grid-cols-[auto,1fr] md:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary text-4xl shadow-glow">
              💡
            </div>
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">Demo flow</div>
              <h3 className="mb-3 font-display text-2xl font-bold md:text-3xl">
                "I learned React from YouTube and built websites for 3 small businesses."
              </h3>
              <p className="mb-5 text-muted-foreground">
                A 22-year-old in Accra writes that one sentence. SkillMap extracts <strong>Frontend Development</strong> as primary skill,
                detects <strong>React, JavaScript, HTML, CSS, Tailwind</strong>, scores them <strong>Beginner–Intermediate</strong>, and matches them to a junior remote internship,
                a website-builder gig, and a fully-funded bootcamp scholarship.
              </p>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground shadow-card transition-smooth hover:shadow-glow"
              >
                Try the demo <Sparkles className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 text-center shadow-elegant md:p-16">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary-glow/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative">
            <h2 className="mb-4 font-display text-3xl font-bold text-navy-foreground md:text-5xl">
              Your skills are real. Make them visible.
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-navy-foreground/80">
              Tell us what you do. Our AI builds your profile and finds the opportunities you didn't know existed.
            </p>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-accent px-8 py-4 font-bold text-accent-foreground shadow-elegant transition-smooth hover:shadow-glow"
            >
              Build my profile
              <Sparkles className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
