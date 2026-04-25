import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({ email: z.string().trim().email("Enter a valid email") });

const ForgotPassword = () => {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ email: fd.get("email") });

    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      setBusy(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setSentEmail(parsed.data.email);
      setSent(true);
    } catch (e: any) {
      toast.error(e.message || "Failed to send reset email");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <Layout>
        <section className="container max-w-lg py-20 md:py-32">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-extrabold">Check your email</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We sent a password reset link to{" "}
                <span className="font-semibold text-foreground">{sentEmail}</span>.
                The link expires in 1 hour.
              </p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4 text-left space-y-3">
              {[
                "Open the email from SkillMap",
                'Click "Reset your password"',
                "Choose a new secure password",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Didn't get it?{" "}
              <button
                onClick={() => setSent(false)}
                className="font-semibold text-primary hover:underline"
              >
                Try again
              </button>
            </p>
            <Link to="/auth" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition">
              <ArrowLeft className="h-3 w-3" /> Back to sign in
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container max-w-lg py-20 md:py-32">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant space-y-6">
          <div className="space-y-1">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-extrabold">Forgot your password?</h1>
            <p className="text-sm text-muted-foreground">
              No worries. Enter your email and we'll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email address
              </label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 font-bold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Send reset link
            </button>
          </form>

          <Link to="/auth" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-3 w-3" /> Back to sign in
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default ForgotPassword;
