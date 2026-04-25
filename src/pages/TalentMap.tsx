import { useState } from "react";
import { Layout } from "@/components/Layout";
import { CITY_COORDS, CITY_SKILL_CLUSTERS, TALENTS } from "@/data/mockData";
import { getSkillColor } from "@/lib/matchmaker";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Users } from "lucide-react";

const TalentMap = () => {
  const cities = Object.keys(CITY_COORDS);
  const [selected, setSelected] = useState<string>(cities[0]);
  const sel = CITY_COORDS[selected];
  const clusters = CITY_SKILL_CLUSTERS[selected] || [];
  const totalInCity = clusters.reduce((s, c) => s + c.count, 0);
  const talentInCity = TALENTS.filter(t => t.city === selected);

  // City sizes by total count
  const cityTotals: Record<string, number> = Object.fromEntries(
    cities.map(c => [c, (CITY_SKILL_CLUSTERS[c] || []).reduce((s, x) => s + x.count, 0)])
  );
  const maxTotal = Math.max(...Object.values(cityTotals));

  return (
    <Layout>
      <section className="border-b border-border/60 bg-card/50">
        <div className="container py-12">
          <div className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Talent Map</div>
          <h1 className="mb-3 font-display text-4xl font-bold md:text-5xl">Where talent already exists</h1>
          <p className="max-w-2xl text-muted-foreground">
            Aggregated, anonymous view of skill clusters across launch cities in Nigeria, Ghana, and Uganda.
            Click a city to explore its skill mix.
          </p>
        </div>
      </section>

      <section className="container py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
          {/* Map */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-gradient-hero shadow-elegant">
            {/* Stylised Africa silhouette */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full opacity-25">
              <defs>
                <radialGradient id="land2" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="hsl(var(--primary-glow))" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" />
                </radialGradient>
              </defs>
              <path d="M30,30 Q40,18 55,22 Q70,26 75,40 Q78,55 70,68 Q60,82 50,86 Q38,84 30,72 Q22,58 22,44 Z" fill="url(#land2)"/>
            </svg>

            {/* Connection lines between cities */}
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              {cities.flatMap((a, i) =>
                cities.slice(i + 1).map(b => {
                  const ca = CITY_COORDS[a], cb = CITY_COORDS[b];
                  return (
                    <line key={`${a}-${b}`} x1={`${ca.x}%`} y1={`${ca.y}%`} x2={`${cb.x}%`} y2={`${cb.y}%`}
                          stroke="hsl(var(--primary-glow))" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.25"/>
                  );
                })
              )}
            </svg>

            {/* City pins */}
            {cities.map(city => {
              const c = CITY_COORDS[city];
              const total = cityTotals[city];
              const size = 14 + (total / maxTotal) * 22;
              const isSel = selected === city;
              return (
                <button
                  key={city}
                  onClick={() => setSelected(city)}
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${c.x}%`, top: `${c.y}%` }}
                >
                  <span className="absolute inset-0 -m-2 animate-pulse-dot rounded-full bg-accent/30" />
                  <span
                    className={`relative flex items-center justify-center rounded-full border-2 font-bold text-white transition-smooth ${
                      isSel ? "border-accent bg-accent shadow-glow" : "border-primary-glow bg-primary"
                    }`}
                    style={{ width: size, height: size, fontSize: size * 0.4 }}
                  >
                    {total}
                  </span>
                  <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-navy/90 px-2 py-1 text-[10px] font-semibold text-navy-foreground opacity-0 backdrop-blur-sm transition-smooth group-hover:opacity-100">
                    {c.flag} {city}
                  </span>
                </button>
              );
            })}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 rounded-xl border border-navy-foreground/20 bg-navy/60 p-3 text-xs text-navy-foreground backdrop-blur-md">
              <div className="mb-1 font-bold">Talent density</div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary-glow"/>City cluster</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent"/>Selected</span>
              </div>
            </div>

            {/* Region badge */}
            <div className="absolute right-4 top-4 rounded-full border border-navy-foreground/20 bg-navy/60 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-navy-foreground backdrop-blur-md">
              West & East Africa
            </div>
          </div>

          {/* Detail panel */}
          <div className="rounded-3xl border border-border bg-gradient-card p-6 shadow-card">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary text-3xl">
                {sel.flag}
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold leading-tight">{selected}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {sel.country}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-secondary/60 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total mapped talent</div>
              <div className="mt-1 font-display text-3xl font-extrabold text-gradient">{totalInCity.toLocaleString()}</div>
            </div>

            <div className="mt-5">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Skill clusters</div>
              <div className="space-y-2.5">
                {clusters.map(c => {
                  const color = getSkillColor(c.skill);
                  const pct = (c.count / totalInCity) * 100;
                  return (
                    <div key={c.skill}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-semibold">{c.skill}</span>
                        <span className="font-bold" style={{ color }}>{c.count}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {talentInCity.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Featured profiles
                </div>
                <div className="space-y-2">
                  {talentInCity.map(t => (
                    <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ backgroundColor: t.avatarColor }}>{t.initials}</div>
                      <div className="flex-1 text-sm">
                        <div className="font-semibold">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.primarySkill}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Country totals */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {(["Nigeria", "Ghana", "Uganda"] as const).map(country => {
            const cityList = cities.filter(c => CITY_COORDS[c].country === country);
            const total = cityList.reduce((s, c) => s + (cityTotals[c] || 0), 0);
            return (
              <div key={country} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> {country}
                </div>
                <div className="mt-1 font-display text-3xl font-extrabold text-gradient">{total.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{cityList.length} cit{cityList.length === 1 ? "y" : "ies"} mapped</div>
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
};

export default TalentMap;
