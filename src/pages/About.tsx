import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  FileCheck,
  Globe,
  Heart,
  MapPin,
  Rocket,
  Shield,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Layout } from "@/components/Layout";

// ── Team ─────────────────────────────────────────────────────────────────────
const team = [
  {
    name: "Hephzibah Emereole",
    role: "Technical Lead ",
    location: "Accra, Ghana",
    bio: "Former software engineer who saw brilliant developers overlooked because they lacked degrees. Built SkillMap to fix that.",
    initials: "HE",
    color: "from-violet-500 to-purple-600",
  },
  {
    name: "Ezugwu Emmanuel",
    role: "Backend Engineer",
    location: "Ebonyi, Nigeria",
    bio: "Self-taught full-stack engineer. Led engineering at two African startups before co-founding SkillMap.",
    initials: "FA",
    color: "from-cyan-500 to-blue-600",
  },
  {
    name: "Meesam Abbas",
    role: "Frontend Engineer",
    location: "Kampala, Uganda",
    bio: "UX researcher turned product lead. Obsessed with making complex AI feel simple and human.",
    initials: "KA",
    color: "from-emerald-500 to-teal-600",
  },
 
];

// ── Values ────────────────────────────────────────────────────────────────────
const values = [
  {
    icon: Globe,
    title: "Radical Inclusion",
    desc: "No degree, no network, no problem. If you have a skill, you belong here.",
  },
  {
    icon: Shield,
    title: "Trust by Design",
    desc: "We don't gatekeep. Our AI surfaces skills honestly — no inflated scores, no pay-to-rank.",
  },
  {
    icon: Zap,
    title: "Speed for the Underserved",
    desc: "Opportunity shouldn't require months of applications. We move fast because talent can't wait.",
  },
  {
    icon: Heart,
    title: "People Over Metrics",
    desc: "Behind every profile is a real person. We build tools that respect and amplify their humanity.",
  },
];

// ── How it works steps ───────────────────────────────────────────────────────
const steps = [
  {
    icon: Target,
    step: "01",
    title: "AI Skill Assessment",
    sub: "Describe what you do in your own words.",
    desc: "SkillMap analyzes your experience and turns it into a structured, employer-ready talent profile.",
  },
  {
    icon: Briefcase,
    step: "02",
    title: "Match User to Employer",
    sub: "Get matched with real opportunities.",
    desc: "We recommend jobs, gigs, training, and mentorship based on your actual skills, level, and goals.",
  },
  {
    icon: FileCheck,
    step: "03",
    title: "Enhance Profile",
    sub: "Build trust with proof of work.",
    desc: "Add GitHub links, portfolios, projects, or work samples so employers can understand what you can actually do.",
  },
  {
    icon: Rocket,
    step: "04",
    title: "Get Hired",
    sub: "Become visible to employers globally.",
    desc: "Employers can discover you based on skills, not just degrees, networks, or formal job history.",
  },
];

// ── What SkillMap solves ──────────────────────────────────────────────────────
const gaps = [
  "Formal degrees",
  "Professional networks",
  "Polished CVs",
  "Access to global employers",
];

// ─────────────────────────────────────────────────────────────────────────────
const About = () => {
  return (
    <Layout>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-gradient-to-b from-navy/85 via-navy/65 to-navy/95" />
        {/* decorative blobs */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary-glow/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

        <div className="container relative py-24 md:py-36">
          <div className="mx-auto max-w-3xl text-center text-navy-foreground animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-glow/30 bg-primary-glow/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-glow backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Our story
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight md:text-6xl">
              Built by people who were{" "}
              <span className="text-gradient-accent">overlooked</span> themselves.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-navy-foreground/75 md:text-xl">
              No degree. No network. Just your skills — made visible.
            </p>
          </div>
        </div>
      </section>

      {/* ── Mission ───────────────────────────────────────────────────────── */}
      <section className="container py-20">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <div className="mb-3 text-sm font-bold uppercase tracking-widest text-accent">Our Mission</div>
            <h2 className="mb-5 text-3xl font-bold leading-snug md:text-4xl">
              Make every skilled person on Earth discoverable.
            </h2>
            <p className="mb-4 text-lg text-muted-foreground">
              Across the Global South, millions of people are developing real,
              marketable skills outside of formal education — through YouTube
              tutorials, side hustles, community projects, and raw curiosity.
            </p>
            <p className="text-lg text-muted-foreground">
              They're invisible to the global economy — not because they lack talent,
              but because they lack the right <span className="font-semibold text-foreground">vocabulary, credentials, and access</span>.
              SkillMap fixes the infrastructure problem, not the people.
            </p>
          </div>

          {/* Stats card */}
          <div className="relative rounded-3xl border border-border bg-card p-8 shadow-card">
            <div className="absolute -top-3 left-8 rounded-full bg-gradient-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
              By the numbers
            </div>
            <div className="grid grid-cols-2 gap-6 pt-4">
              {[
                { value: "10 000+", label: "Talent profiles" },
                { value: "12",      label: "Countries" },
                { value: "40+",     label: "Employer partners" },
                { value: "92%",     label: "AI accuracy rate" },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="font-display text-3xl font-extrabold text-primary">{s.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────────── */}
      <section className="bg-secondary/40 py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <div className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">What we stand for</div>
            <h2 className="text-3xl font-bold md:text-4xl">Our values</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="group relative rounded-2xl border border-border bg-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant"
              >
                <div className="absolute right-5 top-5 font-display text-5xl font-black text-primary/5">0{i + 1}</div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-card transition-smooth group-hover:shadow-glow">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-display text-lg font-bold">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Story ─────────────────────────────────────────────────────── */}
      <section className="container py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">How we got here</div>
          <h2 className="mb-8 text-3xl font-bold md:text-4xl">Our Story</h2>
          <div className="space-y-5 text-lg text-muted-foreground leading-relaxed">
            <p>
              SkillMap exists because millions of young people have real skills, but no formal way to prove them.
            </p>
            <p>
              A self-taught developer in Accra may have built websites, learned from YouTube, and helped local
              businesses — but without a degree, network, or polished CV,{" "}
              <span className="font-semibold text-foreground">employers may never find them.</span>
            </p>
            <p>
              SkillMap turns informal experience into employer-ready talent profiles, then matches that talent
              to real opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="bg-secondary/40 py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <div className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">The process</div>
            <h2 className="text-3xl font-bold md:text-4xl">How it works</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div
                key={s.step}
                className="group relative rounded-2xl border border-border bg-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant"
              >
                <div className="absolute right-5 top-5 font-display text-5xl font-black text-primary/5">{s.step}</div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-card transition-smooth group-hover:shadow-glow">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 font-display text-base font-bold">{s.title}</h3>
                <p className="mb-2 text-xs font-semibold text-accent">{s.sub}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What SkillMap Solves ───────────────────────────────────────────── */}
      <section className="container py-20">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <div className="mb-3 text-sm font-bold uppercase tracking-widest text-accent">The problem</div>
            <h2 className="mb-6 text-3xl font-bold leading-snug md:text-4xl">What SkillMap solves</h2>
            <p className="mb-6 text-lg text-muted-foreground">
              Many young people have skills but lack the things the system expects. SkillMap helps them
              show what they can do and get matched with opportunities that fit.
            </p>
            <div className="space-y-3">
              {gaps.map((gap) => (
                <div key={gap} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    <span className="h-2 w-2 rounded-full bg-destructive block" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground line-through decoration-destructive/50">{gap}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
            <div className="absolute -top-3 left-8" />
            <div className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">With SkillMap instead</div>
            <div className="space-y-4">
              {[
                { icon: Target,    text: "AI extracts and structures your real skills from plain descriptions" },
                { icon: Briefcase, text: "Get matched to jobs, gigs, and training that fit your actual level" },
                { icon: Globe,     text: "Become discoverable to employers worldwide — no gatekeeping" },
                { icon: FileCheck, text: "Proof of work replaces credentials as the trust signal" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="pt-1.5 text-sm font-medium leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ──────────────────────────────────────────────────────────── */}
      <section className="bg-secondary/40 py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <div className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">The people</div>
            <h2 className="text-3xl font-bold md:text-4xl">Meet the team</h2>
            <p className="mt-4 text-muted-foreground">
              We're a small, distributed team across West and East Africa — united by the belief that geography shouldn't determine destiny.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {team.map(member => (
              <div
                key={member.name}
                className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant"
              >
                {/* Avatar */}
                <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${member.color} text-white text-lg font-bold shadow-card`}>
                  {member.initials}
                </div>
                <h3 className="font-display text-base font-bold">{member.name}</h3>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">{member.role}</div>
                <div className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {member.location}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why it matters ────────────────────────────────────────────────── */}
      <section className="container py-20">
        <div className="rounded-3xl border border-border bg-gradient-card p-8 shadow-card md:p-12">
          <div className="grid gap-8 md:grid-cols-[auto,1fr] md:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Rocket className="h-9 w-9" />
            </div>
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">Why it matters</div>
              <h3 className="mb-3 font-display text-2xl font-bold md:text-3xl">
                The world is losing $8 trillion a year to undiscovered talent.
              </h3>
              <p className="mb-5 text-muted-foreground">
                That's not a made-up number — it's the World Bank's estimate of the productivity gap caused by
                skills mismatch and lack of opportunity access in developing economies. We think that's fixable.
                Not with charity. With infrastructure.
              </p>
              <Link
                to="/auth?mode=signup&role=talent"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground shadow-card transition-smooth hover:shadow-glow"
              >
                Join the movement <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="container pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 text-center shadow-elegant md:p-16">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary-glow/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative">
            <h2 className="mb-4 font-display text-3xl font-bold text-navy-foreground md:text-5xl">
              Ready to be seen?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-navy-foreground/80">
              Join thousands of talented people across the Global South who are making their skills visible to the world.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/auth?mode=signup&role=talent"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-accent px-8 py-4 font-bold text-accent-foreground shadow-elegant transition-smooth hover:shadow-glow"
              >
                Build my profile
                <Sparkles className="h-5 w-5" />
              </Link>
              <Link
                to="/auth?mode=signup&role=employer"
                className="inline-flex items-center gap-2 rounded-xl border border-navy-foreground/20 bg-navy-foreground/5 px-8 py-4 font-bold text-navy-foreground backdrop-blur-sm transition-smooth hover:bg-navy-foreground/10"
              >
                Hire talent
                <Users className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </Layout>
  );
};

export default About;