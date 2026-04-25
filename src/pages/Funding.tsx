import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { FUNDINGS, SDGS } from "@/data/mockData";
import { Calendar, DollarSign, Filter, Globe, Sparkles } from "lucide-react";
import { SdgBadge } from "@/components/SdgBadge";

const TYPES = ["Grant", "CSR Fund", "Impact Investment"];
const REGIONS = ["Africa", "Asia", "Latin America", "Europe", "Global"];

const Funding = () => {
  const [type, setType] = useState("");
  const [region, setRegion] = useState("");
  const [sdg, setSdg] = useState<number | "">("");
  const [minAmount, setMinAmount] = useState(0);

  const results = useMemo(() => FUNDINGS.filter(f => {
    if (type && f.type !== type) return false;
    if (region && !f.region.includes(region)) return false;
    if (sdg && !f.sdgs.includes(Number(sdg))) return false;
    if (minAmount && f.amountValue < minAmount) return false;
    return true;
  }), [type, region, sdg, minAmount]);

  const totalValue = results.reduce((s, f) => s + f.amountValue, 0);

  return (
    <Layout>
      <section className="border-b border-border/60 bg-card/50">
        <div className="container py-12">
          <div className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Funding</div>
          <h1 className="mb-3 text-4xl font-bold md:text-5xl">Live funding opportunities</h1>
          <p className="max-w-2xl text-muted-foreground">
            Grants, CSR funds, and impact investments aligned to UN SDGs across regions.
          </p>
          <div className="mt-6 flex flex-wrap gap-6 text-sm">
            <Stat label="Open opportunities" value={`${results.length}`} />
            <Stat label="Total ceiling" value={`$${(totalValue / 1_000_000).toFixed(1)}M`} />
            <Stat label="Funders" value={`${new Set(results.map(r => r.funder)).size}`} />
          </div>
        </div>
      </section>

      <section className="container py-8">
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold">Filters</span>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <Sel value={type} onChange={setType} options={TYPES} placeholder="All types" />
            <Sel value={region} onChange={setRegion} options={REGIONS} placeholder="All regions" />
            <Sel
              value={sdg === "" ? "" : String(sdg)}
              onChange={v => setSdg(v === "" ? "" : Number(v))}
              options={SDGS.map(s => ({ value: String(s.id), label: `SDG ${s.id} · ${s.label}` }))}
              placeholder="All SDGs"
            />
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Min amount: ${minAmount.toLocaleString()}
              </label>
              <input
                type="range" min={0} max={3000000} step={50000}
                value={minAmount}
                onChange={e => setMinAmount(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {results.map(f => (
            <div key={f.id} className="group flex flex-col rounded-2xl border border-border bg-gradient-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant">
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  f.type === "Grant" ? "bg-success/15 text-success"
                  : f.type === "CSR Fund" ? "bg-accent/15 text-accent"
                  : "bg-primary/15 text-primary"
                }`}>
                  {f.type}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(f.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
              <h3 className="font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm font-medium text-primary">{f.funder}</p>
              <p className="mt-3 text-sm text-muted-foreground">{f.description}</p>

              <div className="my-4 flex flex-wrap gap-1.5">
                {f.sdgs.map(id => <SdgBadge key={id} id={id} size="xs" />)}
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{f.amount}</span>
                  <span className="inline-flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{f.region}</span>
                </div>
                <button className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-smooth hover:bg-primary/90">
                  <Sparkles className="h-3 w-3" /> Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="font-display text-2xl font-bold text-gradient">{value}</div>
    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
  </div>
);

const Sel = ({ value, onChange, options, placeholder }: any) => (
  <select value={value} onChange={e => onChange(e.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
    <option value="">{placeholder}</option>
    {options.map((o: any) => {
      const v = typeof o === "string" ? o : o.value;
      const l = typeof o === "string" ? o : o.label;
      return <option key={v} value={v}>{l}</option>;
    })}
  </select>
);

export default Funding;
