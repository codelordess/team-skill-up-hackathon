import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { OrgCard } from "@/components/OrgCard";
import { COUNTRIES, NeedType, ORGANIZATIONS, SDGS, SECTORS } from "@/data/mockData";
import { Search, SlidersHorizontal, X } from "lucide-react";

const NEEDS: NeedType[] = ["Funding", "Technology", "Local Partner", "Implementation Partner", "Research", "Volunteers"];

const Discover = () => {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState<string>("");
  const [sector, setSector] = useState<string>("");
  const [sdg, setSdg] = useState<number | "">("");
  const [need, setNeed] = useState<NeedType | "">("");

  const results = useMemo(() => {
    return ORGANIZATIONS.filter(o => {
      if (q && !(`${o.name} ${o.description} ${o.mission} ${o.sector}`.toLowerCase().includes(q.toLowerCase()))) return false;
      if (country && o.country !== country) return false;
      if (sector && o.sector !== sector) return false;
      if (sdg && !o.sdgs.includes(Number(sdg))) return false;
      if (need && !o.needs.includes(need as NeedType)) return false;
      return true;
    });
  }, [q, country, sector, sdg, need]);

  const clearAll = () => { setQ(""); setCountry(""); setSector(""); setSdg(""); setNeed(""); };
  const hasFilters = q || country || sector || sdg || need;

  return (
    <Layout>
      <section className="border-b border-border/60 bg-card/50">
        <div className="container py-12">
          <div className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Discover</div>
          <h1 className="mb-3 text-4xl font-bold md:text-5xl">NGO & partner directory</h1>
          <p className="max-w-2xl text-muted-foreground">
            Search {ORGANIZATIONS.length}+ verified organisations by country, SDG, sector, and partnership need.
          </p>
        </div>
      </section>

      <section className="container py-8">
        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold">Filters</span>
            {hasFilters && (
              <button onClick={clearAll} className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive">
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-12">
            <div className="relative md:col-span-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search NGOs, missions, sectors..."
                className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Select value={country} onChange={setCountry} options={COUNTRIES} placeholder="All countries" className="md:col-span-2" />
            <Select value={sector} onChange={setSector} options={SECTORS} placeholder="All sectors" className="md:col-span-2" />
            <Select
              value={sdg === "" ? "" : String(sdg)}
              onChange={(v) => setSdg(v === "" ? "" : Number(v))}
              options={SDGS.map(s => ({ value: String(s.id), label: `SDG ${s.id} · ${s.label}` }))}
              placeholder="All SDGs"
              className="md:col-span-2"
            />
            <Select value={need} onChange={(v) => setNeed(v as NeedType | "")} options={NEEDS} placeholder="All needs" className="md:col-span-2" />
          </div>
        </div>

        <div className="mb-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{results.length}</span> partner{results.length === 1 ? "" : "s"} matching
        </div>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 py-20 text-center">
            <p className="text-muted-foreground">No matches. Try adjusting filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map(o => <OrgCard key={o.id} org={o} />)}
          </div>
        )}
      </section>
    </Layout>
  );
};

const Select = ({
  value, onChange, options, placeholder, className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: (string | { value: string; label: string })[];
  placeholder: string;
  className?: string;
}) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className={`h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-primary/20 ${className ?? ""}`}
  >
    <option value="">{placeholder}</option>
    {options.map(opt => {
      const v = typeof opt === "string" ? opt : opt.value;
      const l = typeof opt === "string" ? opt : opt.label;
      return <option key={v} value={v}>{l}</option>;
    })}
  </select>
);

export default Discover;
