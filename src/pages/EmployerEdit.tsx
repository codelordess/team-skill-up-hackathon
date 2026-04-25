import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

const EmployerEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: e }] = await Promise.all([
        supabase.from("profiles").select("name,location").eq("id", user.id).maybeSingle(),
        supabase.from("employers").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      if (p) { setName(p.name || ""); setLocation(p.location || ""); }
      if (e) { setCompanyName(e.company_name); setIndustry(e.industry || ""); setDescription(e.description || ""); setWebsite(e.website || ""); }
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const r1 = await supabase.from("profiles").update({ name, location }).eq("id", user.id);
      const r2 = await supabase.from("employers").update({ company_name: companyName, industry, description, website }).eq("user_id", user.id);
      if (r1.error) throw r1.error;
      if (r2.error) throw r2.error;
      toast.success("Saved");
      navigate("/employer/dashboard");
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  if (loading) return <Layout><div className="container py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></Layout>;
  const i = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <Layout>
      <section className="container max-w-2xl py-10 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Company profile</h1>
          <p className="text-muted-foreground">This is how your company appears to talent.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
          <Field label="Your name"><input value={name} onChange={e => setName(e.target.value)} className={i} /></Field>
          <Field label="Location"><input value={location} onChange={e => setLocation(e.target.value)} className={i} placeholder="City, Country" /></Field>
          <Field label="Company name"><input value={companyName} onChange={e => setCompanyName(e.target.value)} className={i} /></Field>
          <Field label="Industry"><input value={industry} onChange={e => setIndustry(e.target.value)} className={i} placeholder="e.g. Fintech, Edtech, NGO" /></Field>
          <Field label="Website"><input value={website} onChange={e => setWebsite(e.target.value)} className={i} placeholder="https://..." /></Field>
          <Field label="About the company"><textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={`${i} h-auto py-3`} /></Field>
        </div>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-7 py-3 font-bold text-primary-foreground shadow-elegant disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </button>
      </section>
    </Layout>
  );
};

const Field = ({ label, children }: any) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
    {children}
  </div>
);

export default EmployerEdit;
