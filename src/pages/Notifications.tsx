import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Check, Loader2 } from "lucide-react";

const Notifications = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setItems(data || []);
      setLoading(false);
      // mark read
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    })();
  }, [user]);

  return (
    <Layout>
      <section className="container max-w-2xl py-10">
        <h1 className="mb-6 inline-flex items-center gap-2 font-display text-3xl font-bold"><Bell className="h-6 w-6 text-primary" /> Notifications</h1>
        {loading ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /> : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center text-muted-foreground">No notifications yet.</div>
        ) : (
          <ul className="space-y-3">
            {items.map(n => (
              <li key={n.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Check className="h-4 w-4" /></div>
                <div className="flex-1">
                  <p className="font-semibold">{n.title}</p>
                  {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
};

export default Notifications;
