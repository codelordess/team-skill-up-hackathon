import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { getSkillColor } from "@/lib/matchmaker";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, MapPin, Users } from "lucide-react";

// ── City coordinates on the SVG map (% positions) ─────────────────────────
const CITY_META: Record<string, { x: number; y: number; country: string; flag: string }> = {
  "Lagos":     { x: 42, y: 52, country: "Nigeria",  flag: "🇳🇬" },
  "Abuja":     { x: 45, y: 46, country: "Nigeria",  flag: "🇳🇬" },
  "Kano":      { x: 45, y: 38, country: "Nigeria",  flag: "🇳🇬" },
  "Accra":     { x: 38, y: 54, country: "Ghana",    flag: "🇬🇭" },
  "Kumasi":    { x: 36, y: 51, country: "Ghana",    flag: "🇬🇭" },
  "Kampala":   { x: 58, y: 55, country: "Uganda",   flag: "🇺🇬" },
  "Nairobi":   { x: 62, y: 58, country: "Kenya",    flag: "🇰🇪" },
  "Enugu":     { x: 47, y: 50, country: "Nigeria",  flag: "🇳🇬" },
  "Ebonyi":    { x: 48, y: 51, country: "Nigeria",  flag: "🇳🇬" },
  "Remote":    { x: 50, y: 30, country: "Remote",   flag: "🌍" },
};

const FALLBACK_CITY = { x: 50, y: 50, country: "Africa", flag: "🌍" };

// Normalise location string → city key
function parseCity(location: string | null): string {
  if (!location) return "Remote";
  const loc = location.toLowerCase();
  for (const city of Object.keys(CITY_META)) {
    if (loc.includes(city.toLowerCase())) return city;
  }
  // Try country match
  if (loc.includes("nigeria"))  return "Lagos";
  if (loc.includes("ghana"))    return "Accra";
  if (loc.includes("uganda"))   return "Kampala";
  if (loc.includes("kenya"))    return "Nairobi";
  if (loc.includes("remote"))   return "Remote";
  return "Remote";
}

type CityData = {
  name: string;
  total: number;
  skills: { skill: string; count: number }[];
  talents: { user_id: string; name: string; primary_skill: string; initials: string; color: string }[];
};

const TalentMap = () => {
  const [cityData, setCityData] = useState<Record<string, CityData>>({});
  const [selected, setSelected] = useState<string>("Lagos");
  const [loading, setLoading] = useState(true);
  const [totalTalents, setTotalTalents] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        // Fetch all available talents with skills + profile locations
        const { data: talents } = await supabase
          .from("talents")
          .select("user_id, primary_skill, extracted_skills, experience_level, credibility_score")
          .eq("available", true)
          .limit(200);

        if (!talents?.length) { setLoading(false); return; }

        const ids = talents.map(t => t.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, location")
          .in("id", ids);

        const profileMap: Record<string, any> = {};
        profiles?.forEach(p => { profileMap[p.id] = p; });

        // Group talents by city
        const byCity: Record<string, typeof talents> = {};
        for (const t of talents) {
          const p = profileMap[t.user_id];
          const city = parseCity(p?.location || null);
          if (!byCity[city]) byCity[city] = [];
          byCity[city].push({ ...t, _name: p?.name || "Talent", _location: p?.location });
        }

        // Build city data with skill breakdowns
        const result: Record<string, CityData> = {};
        for (const [city, cityTalents] of Object.entries(byCity)) {
          // Count skills
          const skillCounts: Record<string, number> = {};
          for (const t of cityTalents) {
            const ps = t.primary_skill;
            if (ps) skillCounts[ps] = (skillCounts[ps] || 0) + 1;
          }
          const skills = Object.entries(skillCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([skill, count]) => ({ skill, count }));

          // Top 5 profiles for display
          const topTalents = cityTalents
            .sort((a, b) => (b.credibility_score || 0) - (a.credibility_score || 0))
            .slice(0, 5)
            .map(t => {
              const name = (t as any)._name || "Talent";
              const initials = name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
              return {
                user_id: t.user_id,
                name,
                primary_skill: t.primary_skill || "General Skills",
                initials,
                color: getSkillColor(t.primary_skill || ""),
              };
            });

          result[city] = { name: city, total: cityTalents.length, skills, talents: topTalents };
        }

        setCityData(result);
        setTotalTalents(talents.length);

        // Select most populated city by default
        const topCity = Object.entries(result).sort((a, b) => b[1].total - a[1].total)[0]?.[0] || "Lagos";
        setSelected(topCity);
      } catch (e) {
        console.error("TalentMap error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cities = Object.keys(cityData).filter(c => CITY_META[c]);
  const maxTotal = Math.max(...cities.map(c => cityData[c]?.total || 0), 1);
  const sel = cityData[selected];
  const selMeta = CITY_META[selected] || FALLBACK_CITY;

  // Country totals
  const countryTotals: Record<string, number> = {};
  for (const [city, data] of Object.entries(cityData)) {
    const country = CITY_META[city]?.country || "Other";
    if (country === "Remote") continue;
    countryTotals[country] = (countryTotals[country] || 0) + data.total;
  }
  const topCountries = Object.entries(countryTotals).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <Layout>
      <section className="border-b border-border/60 bg-card/50">
        <div className="container py-12">
          <div className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Talent Map</div>
          <h1 className="mb-3 font-display text-4xl font-bold md:text-5xl">Where talent already exists</h1>
          <p className="max-w-2xl text-muted-foreground">
            Live view of real skill clusters across Africa — built from actual talent profiles on SkillMap.
            Click a city to explore its skill mix.
          </p>
          {!loading && totalTalents > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-success/10 border border-success/20 px-3 py-1.5 text-xs font-semibold text-success">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              {totalTalents} real talent profiles mapped live
            </div>
          )}
        </div>
      </section>

      {loading ? (
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : totalTalents === 0 ? (
        /* Empty state */
        <section className="container py-20 text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-4xl">🗺️</div>
          <h2 className="font-display text-2xl font-bold">The map is waiting for you</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            No talent profiles yet. Be among the first to put your skills on the map.
          </p>
          <Link to="/auth?mode=signup&role=talent"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 font-bold text-primary-foreground shadow-elegant hover:shadow-glow transition-all">
            Add my skills <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      ) : (
        <section className="container py-8">
          <div className="grid gap-6 lg:grid-cols-[1fr,380px]">

            {/* ── Map ──────────────────────────────────────────────── */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-gradient-hero shadow-elegant">
              {/* Africa silhouette */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full opacity-20">
                <defs>
                  <radialGradient id="land" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="hsl(var(--primary-glow))" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" />
                  </radialGradient>
                </defs>
                <path d="M30,28 Q42,16 57,20 Q72,24 77,40 Q80,56 72,70 Q62,84 50,88 Q36,86 28,72 Q20,56 20,42 Z" fill="url(#land)" />
              </svg>

              {/* Connection lines */}
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                {cities.flatMap((a, i) =>
                  cities.slice(i + 1).map(b => {
                    const ca = CITY_META[a], cb = CITY_META[b];
                    if (!ca || !cb) return null;
                    return (
                      <line key={`${a}-${b}`}
                        x1={`${ca.x}%`} y1={`${ca.y}%`}
                        x2={`${cb.x}%`} y2={`${cb.y}%`}
                        stroke="hsl(var(--primary-glow))" strokeWidth="0.4"
                        strokeDasharray="2 3" opacity="0.2" />
                    );
                  })
                )}
              </svg>

              {/* City pins */}
              {cities.map(city => {
                const meta = CITY_META[city];
                if (!meta) return null;
                const data = cityData[city];
                const size = 14 + (data.total / maxTotal) * 24;
                const isSel = selected === city;
                return (
                  <button key={city} onClick={() => setSelected(city)}
                    className="group absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${meta.x}%`, top: `${meta.y}%` }}>
                    <span className={`absolute inset-0 -m-2 rounded-full ${isSel ? "animate-ping bg-accent/40" : "animate-pulse bg-primary/20"}`} />
                    <span className={`relative flex items-center justify-center rounded-full border-2 font-bold text-white transition-all ${
                      isSel ? "border-accent bg-accent shadow-glow scale-110" : "border-primary-glow bg-primary hover:scale-105"
                    }`} style={{ width: size, height: size, fontSize: Math.max(8, size * 0.38) }}>
                      {data.total}
                    </span>
                    <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-navy/90 px-2 py-1 text-[10px] font-semibold text-navy-foreground opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100">
                      {meta.flag} {city}
                    </span>
                  </button>
                );
              })}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 rounded-xl border border-navy-foreground/20 bg-navy/60 p-3 text-xs text-navy-foreground backdrop-blur-md">
                <div className="mb-1 font-bold">Live talent density</div>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary-glow" />City</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" />Selected</span>
                </div>
              </div>

              <div className="absolute right-4 top-4 rounded-full border border-navy-foreground/20 bg-navy/60 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-navy-foreground backdrop-blur-md">
                Africa · Live data
              </div>
            </div>

            {/* ── Detail panel ─────────────────────────────────────── */}
            <div className="rounded-3xl border border-border bg-gradient-card p-6 shadow-card space-y-5">
              {sel ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary text-3xl">
                      {selMeta.flag}
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-bold">{selected}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {selMeta.country}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-secondary/60 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Mapped talent</div>
                    <div className="mt-1 font-display text-3xl font-extrabold text-gradient">{sel.total.toLocaleString()}</div>
                  </div>

                  {/* Skill clusters */}
                  {sel.skills.length > 0 && (
                    <div>
                      <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Skill clusters</div>
                      <div className="space-y-2.5">
                        {sel.skills.map(c => {
                          const color = getSkillColor(c.skill);
                          const pct = (c.count / sel.total) * 100;
                          return (
                            <div key={c.skill}>
                              <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="font-semibold">{c.skill}</span>
                                <span className="font-bold" style={{ color }}>{c.count}</span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Top talent profiles */}
                  {sel.talents.length > 0 && (
                    <div>
                      <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Top profiles</div>
                      <div className="space-y-2">
                        {sel.talents.map(t => (
                          <Link key={t.user_id} to={`/employer/talent/${t.user_id}`}
                            className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 hover:border-primary/40 hover:shadow-card transition-all group">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                              style={{ backgroundColor: t.color }}>
                              {t.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm truncate">{t.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{t.primary_skill}</div>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                  Select a city on the map
                </div>
              )}
            </div>
          </div>

          {/* Country totals */}
          {topCountries.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {topCountries.map(([country, total]) => {
                const citiesInCountry = Object.keys(cityData).filter(c => CITY_META[c]?.country === country);
                return (
                  <div key={country} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {citiesInCountry[0] && CITY_META[citiesInCountry[0]]?.flag} {country}
                    </div>
                    <div className="mt-1 font-display text-3xl font-extrabold text-gradient">{total.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {citiesInCountry.length} cit{citiesInCountry.length === 1 ? "y" : "ies"} mapped
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold">Add your city to the map</p>
              <p className="text-sm text-muted-foreground">Create your profile and your skills will appear here automatically.</p>
            </div>
            <Link to="/auth?mode=signup&role=talent"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-elegant hover:shadow-glow transition-all">
              Join SkillMap <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default TalentMap;