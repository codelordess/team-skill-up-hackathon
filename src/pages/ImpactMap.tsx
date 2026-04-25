import { useState } from "react";
import { Layout } from "@/components/Layout";
import { MAP_LOCATIONS, ORGANIZATIONS, Organization } from "@/data/mockData";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { SdgBadge } from "@/components/SdgBadge";

const ImpactMap = () => {
  const [selected, setSelected] = useState<Organization | null>(ORGANIZATIONS[0]);

  return (
    <Layout>
      <section className="border-b border-border/60 bg-card/50">
        <div className="container py-12">
          <div className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Impact Map</div>
          <h1 className="mb-3 text-4xl font-bold md:text-5xl">Where impact happens</h1>
          <p className="max-w-2xl text-muted-foreground">
            Explore NGOs and funders across regions. Click a node to see details.
          </p>
        </div>
      </section>

      <section className="container py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
          {/* Map */}
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-border bg-gradient-hero shadow-elegant">
            {/* Stylized continent shapes */}
            <svg viewBox="0 0 100 56" className="absolute inset-0 h-full w-full opacity-25">
              <defs>
                <radialGradient id="land" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="hsl(var(--primary-glow))" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" />
                </radialGradient>
              </defs>
              {/* Loose continent blobs */}
              <path d="M15,18 Q22,12 30,16 Q35,22 28,30 Q20,35 14,30 Z" fill="url(#land)"/>
              <path d="M28,38 Q34,34 38,42 Q34,52 26,50 Z" fill="url(#land)"/>
              <path d="M44,16 Q56,10 60,18 Q58,28 50,30 Q44,28 44,22 Z" fill="url(#land)"/>
              <path d="M48,30 Q56,28 58,38 Q54,46 48,44 Q44,38 48,30 Z" fill="url(#land)"/>
              <path d="M62,18 Q76,14 82,24 Q78,34 70,32 Q62,28 62,22 Z" fill="url(#land)"/>
              <path d="M78,36 Q86,34 88,42 Q82,46 78,42 Z" fill="url(#land)"/>
            </svg>

            {/* Connection lines */}
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              {ORGANIZATIONS.map((org, i) => {
                const a = MAP_LOCATIONS[org.country];
                const b = MAP_LOCATIONS[ORGANIZATIONS[(i + 1) % ORGANIZATIONS.length].country];
                if (!a || !b) return null;
                return (
                  <line key={org.id} x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`}
                        stroke="hsl(var(--primary-glow))" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.3"/>
                );
              })}
            </svg>

            {/* Pins */}
            {ORGANIZATIONS.map(org => {
              const loc = MAP_LOCATIONS[org.country];
              if (!loc) return null;
              const isSelected = selected?.id === org.id;
              return (
                <button
                  key={org.id}
                  onClick={() => setSelected(org)}
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                >
                  <span className="absolute inset-0 -m-3 animate-pulse-dot rounded-full bg-accent/40" />
                  <span className={`relative block rounded-full border-2 transition-smooth ${
                    isSelected ? "h-5 w-5 border-accent bg-accent shadow-glow" : "h-3.5 w-3.5 border-primary-glow bg-primary"
                  }`} />
                  <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-navy/90 px-2 py-1 text-[10px] font-semibold text-navy-foreground opacity-0 backdrop-blur-sm transition-smooth group-hover:opacity-100">
                    {org.flag} {org.name}
                  </span>
                </button>
              );
            })}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 rounded-xl border border-navy-foreground/20 bg-navy/60 p-3 text-xs text-navy-foreground backdrop-blur-md">
              <div className="mb-1 font-bold">Live partner network</div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary-glow"/>NGO / Partner</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent"/>Selected</span>
              </div>
            </div>
          </div>

          {/* Detail panel */}
          <div className="rounded-3xl border border-border bg-gradient-card p-6 shadow-card">
            {selected ? (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary text-3xl">
                    {selected.flag}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold leading-tight">{selected.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {selected.country} · {selected.region}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{selected.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {selected.sdgs.map(id => <SdgBadge key={id} id={id} size="xs" />)}
                </div>
                <div className="mt-4 rounded-xl bg-secondary/60 p-3 text-sm">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reach</div>
                  <div className="font-semibold">{selected.reach}</div>
                </div>
                <Link
                  to={`/org/${selected.id}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90"
                >
                  View full profile <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Click a node on the map.</p>
            )}
          </div>
        </div>

        {/* Region summary */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {Object.entries(
            ORGANIZATIONS.reduce<Record<string, number>>((acc, o) => {
              acc[o.region] = (acc[o.region] || 0) + 1;
              return acc;
            }, {})
          ).map(([region, count]) => (
            <div key={region} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{region}</div>
              <div className="mt-1 font-display text-3xl font-extrabold text-gradient">{count}</div>
              <div className="text-xs text-muted-foreground">active partner{count === 1 ? "" : "s"}</div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default ImpactMap;
